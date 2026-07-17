using Microsoft.AspNetCore.Mvc;
using Bioma.Services;
using System.Data;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EncyclopediaController : ControllerBase
    {
        private readonly DatabaseService _db;

        public EncyclopediaController(DatabaseService db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult GetSpecies([FromQuery] string? search, [FromQuery] string? status, [FromQuery] string? diet, [FromQuery] string? tags, [FromQuery] string? kingdom)
        {
            try
            {
                var sql = @"
                    SELECT o.Organism_ID, o.Scientific_Name, o.Common_Name, o.Discovery_Year,
                           o.Kingdom_Type, o.Conservation_Status,
                           se.Image_URL, se.Diet_Type, se.Fun_Fact, se.Description
                    FROM Organisms o
                    LEFT JOIN Species_Encyclopedia se ON o.Organism_ID = se.Organism_ID
                    WHERE o.Rank_Name = 'Species'";

                var parms = new Dictionary<string, object>();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    sql += " AND (UPPER(o.Common_Name) LIKE :search OR UPPER(o.Scientific_Name) LIKE :search)";
                    parms.Add(":search", $"%{search.Trim().ToUpper()}%");
                }

                if (!string.IsNullOrWhiteSpace(status))
                {
                    sql += " AND o.Conservation_Status = :status";
                    parms.Add(":status", status.Trim());
                }

                if (!string.IsNullOrWhiteSpace(diet))
                {
                    sql += " AND se.Diet_Type = :diet";
                    parms.Add(":diet", diet.Trim());
                }

                if (!string.IsNullOrWhiteSpace(kingdom))
                {
                    sql += " AND o.Kingdom_Type = :kingdom";
                    parms.Add(":kingdom", kingdom.Trim());
                }

                if (!string.IsNullOrWhiteSpace(tags))
                {
                    var tagList = tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                      .Select(t => t.Trim())
                                      .ToList();

                    if (tagList.Count > 0)
                    {
                        var tagParamsList = new List<string>();
                        for (int i = 0; i < tagList.Count; i++)
                        {
                            var paramName = $":tag{i}";
                            tagParamsList.Add(paramName);
                            parms.Add(paramName, tagList[i]);
                        }

                        sql += $@" AND o.Organism_ID IN (
                            SELECT ot.Organism_ID
                            FROM Organism_Tags ot
                            JOIN Tags t ON ot.Tag_ID = t.Tag_ID
                            WHERE t.Tag_Name IN ({string.Join(", ", tagParamsList)})
                            GROUP BY ot.Organism_ID
                            HAVING COUNT(DISTINCT t.Tag_Name) = :tagCount
                        )";
                        parms.Add(":tagCount", tagList.Count);
                    }
                }

                sql += " ORDER BY o.Common_Name ASC, o.Scientific_Name ASC";

                var dt = _db.Query(sql, parms);

                // Fetch tags
                var tagsSql = @"
                    SELECT ot.Organism_ID, t.Tag_Name, t.Tag_Color
                    FROM Organism_Tags ot
                    JOIN Tags t ON ot.Tag_ID = t.Tag_ID";
                var tagsDt = _db.Query(tagsSql);

                var speciesList = new List<object>();
                foreach (DataRow row in dt.Rows)
                {
                    var organismId = Convert.ToInt32(row["Organism_ID"]);
                    var species = new 
                    {
                        OrganismId = organismId,
                        ScientificName = row["Scientific_Name"]?.ToString() ?? "",
                        CommonName = row["Common_Name"] == DBNull.Value ? null : row["Common_Name"]?.ToString(),
                        DiscoveryYear = row["Discovery_Year"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["Discovery_Year"]),
                        KingdomType = row["Kingdom_Type"] == DBNull.Value ? null : row["Kingdom_Type"]?.ToString(),
                        StatusCode = row["Conservation_Status"] == DBNull.Value ? null : row["Conservation_Status"]?.ToString(),
                        ImageUrl = row["Image_URL"] == DBNull.Value ? null : row["Image_URL"]?.ToString(),
                        DietType = row["Diet_Type"] == DBNull.Value ? null : row["Diet_Type"]?.ToString(),
                        FunFact = row["Fun_Fact"] == DBNull.Value ? null : row["Fun_Fact"]?.ToString(),
                        Description = row["Description"] == DBNull.Value ? null : row["Description"]?.ToString(),
                        Tags = new List<object>()
                    };

                    var speciesTags = tagsDt.Select($"Organism_ID = {organismId}");
                    foreach (var tagRow in speciesTags)
                    {
                        species.Tags.Add(new 
                        {
                            TagName = tagRow["Tag_Name"]?.ToString() ?? "",
                            TagColor = tagRow["Tag_Color"]?.ToString() ?? ""
                        });
                    }

                    speciesList.Add(species);
                }

                return Ok(speciesList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("filters")]
        public IActionResult GetFilters()
        {
            try
            {
                var statuses = new[] { "LC", "NT", "VU", "EN", "CR", "EW", "EX" };
                var tagsDt = _db.Query("SELECT Tag_Name, Tag_Category, Tag_Color FROM Tags ORDER BY Tag_Category ASC, Tag_Name ASC");

                var filters = new 
                {
                    Diets = new List<string> { "Carnivore", "Herbivore", "Omnivore", "Autotroph" },
                    Statuses = statuses.Select((s, i) => new { StatusCode = s, StatusName = s, RiskLevel = i + 1 }).ToList(),
                    Tags = new List<object>()
                };

                foreach (DataRow row in tagsDt.Rows)
                {
                    filters.Tags.Add(new 
                    {
                        TagName = row["Tag_Name"]?.ToString() ?? "",
                        TagCategory = row["Tag_Category"]?.ToString() ?? "",
                        TagColor = row["Tag_Color"]?.ToString() ?? ""
                    });
                }

                return Ok(filters);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetSpeciesDetails(int id)
        {
            try
            {
                // 1. Fetch Primary Details
                var mainSql = @"
                    SELECT o.Organism_ID, o.Scientific_Name, o.Common_Name, o.Discovery_Year,
                           o.Kingdom_Type, o.Conservation_Status,
                           se.Description, se.Diet_Type, se.Diet_Details, se.Physical_Description, 
                           se.Avg_Height_Cm, se.Avg_Length_Cm, se.Habitat_Behavior, se.Reproduction_Info,
                           se.Native_Range_Description, se.Image_URL, se.Fun_Fact, se.Last_Updated
                    FROM Organisms o
                    LEFT JOIN Species_Encyclopedia se ON o.Organism_ID = se.Organism_ID
                    WHERE o.Organism_ID = :id";

                var mainDt = _db.Query(mainSql, new Dictionary<string, object> { { ":id", id } });
                if (mainDt.Rows.Count == 0)
                {
                    return NotFound(new { error = "Species not found." });
                }

                var mainRow = mainDt.Rows[0];
                var details = new 
                {
                    OrganismId = Convert.ToInt32(mainRow["Organism_ID"]),
                    ScientificName = mainRow["Scientific_Name"]?.ToString() ?? "",
                    CommonName = mainRow["Common_Name"] == DBNull.Value ? null : mainRow["Common_Name"]?.ToString(),
                    DiscoveryYear = mainRow["Discovery_Year"] == DBNull.Value ? (int?)null : Convert.ToInt32(mainRow["Discovery_Year"]),
                    KingdomType = mainRow["Kingdom_Type"] == DBNull.Value ? null : mainRow["Kingdom_Type"]?.ToString(),
                    StatusCode = mainRow["Conservation_Status"] == DBNull.Value ? null : mainRow["Conservation_Status"]?.ToString(),
                    Description = mainRow["Description"] == DBNull.Value ? null : mainRow["Description"]?.ToString(),
                    DietType = mainRow["Diet_Type"] == DBNull.Value ? null : mainRow["Diet_Type"]?.ToString(),
                    DietDetails = mainRow["Diet_Details"] == DBNull.Value ? null : mainRow["Diet_Details"]?.ToString(),
                    PhysicalDescription = mainRow["Physical_Description"] == DBNull.Value ? null : mainRow["Physical_Description"]?.ToString(),
                    AvgHeightCm = mainRow["Avg_Height_Cm"] == DBNull.Value ? (double?)null : Convert.ToDouble(mainRow["Avg_Height_Cm"]),
                    AvgLengthCm = mainRow["Avg_Length_Cm"] == DBNull.Value ? (double?)null : Convert.ToDouble(mainRow["Avg_Length_Cm"]),
                    HabitatBehavior = mainRow["Habitat_Behavior"] == DBNull.Value ? null : mainRow["Habitat_Behavior"]?.ToString(),
                    ReproductionInfo = mainRow["Reproduction_Info"] == DBNull.Value ? null : mainRow["Reproduction_Info"]?.ToString(),
                    NativeRangeDescription = mainRow["Native_Range_Description"] == DBNull.Value ? null : mainRow["Native_Range_Description"]?.ToString(),
                    ImageUrl = mainRow["Image_URL"] == DBNull.Value ? null : mainRow["Image_URL"]?.ToString(),
                    FunFact = mainRow["Fun_Fact"] == DBNull.Value ? null : mainRow["Fun_Fact"]?.ToString(),
                    LastUpdated = mainRow["Last_Updated"] == DBNull.Value ? null : Convert.ToDateTime(mainRow["Last_Updated"]).ToString("yyyy-MM-dd"),
                    Photos = new List<object>(), // Removed in new architecture
                    Distributions = new List<object>(),
                    Interactions = new List<object>(), // Removed in new architecture
                    Lineage = new List<object>()
                };

                // 3. Fetch Distribution Regions
                var distSql = @"
                    SELECT sd.Estimated_Population, sd.Last_Survey_Date, sd.Population_Trend,
                           gr.Region_Name, gr.Country, gr.Area_SqKm, gr.Is_Protected,
                           gr.Biome_Name, gr.Climate_Zone
                    FROM Species_Distribution sd
                    JOIN Regions gr ON sd.Region_ID = gr.Region_ID
                    WHERE sd.Organism_ID = :id";
                var distDt = _db.Query(distSql, new Dictionary<string, object> { { ":id", id } });
                foreach (DataRow row in distDt.Rows)
                {
                    details.Distributions.Add(new 
                    {
                        EstimatedLocalPopulation = row["Estimated_Population"] == DBNull.Value ? (int?)null : Convert.ToInt32(row["Estimated_Population"]),
                        LastSurveyDate = row["Last_Survey_Date"] == DBNull.Value ? null : Convert.ToDateTime(row["Last_Survey_Date"]).ToString("yyyy-MM-dd"),
                        PopulationTrend = row["Population_Trend"] == DBNull.Value ? null : row["Population_Trend"]?.ToString(),
                        RegionName = row["Region_Name"]?.ToString() ?? "",
                        Country = row["Country"]?.ToString() ?? "",
                        AreaSqKm = row["Area_SqKm"] == DBNull.Value ? (double?)null : Convert.ToDouble(row["Area_SqKm"]),
                        IsProtected = row["Is_Protected"]?.ToString() ?? "N",
                        BiomeName = row["Biome_Name"]?.ToString() ?? "",
                        ClimateZone = row["Climate_Zone"]?.ToString() ?? ""
                    });
                }

                // 5. Fetch Recursive Taxonomic Lineage (Oracle START WITH ... CONNECT BY)
                var lineageSql = @"
                    SELECT Organism_ID, Scientific_Name, Common_Name, Rank_Name
                    FROM Organisms
                    START WITH Organism_ID = :id
                    CONNECT BY PRIOR Parent_ID = Organism_ID
                    ORDER BY CASE Rank_Name 
                        WHEN 'Kingdom' THEN 1 WHEN 'Phylum' THEN 2 WHEN 'Class' THEN 3 
                        WHEN 'Order' THEN 4 WHEN 'Family' THEN 5 WHEN 'Genus' THEN 6 WHEN 'Species' THEN 7 END ASC";
                var lineageDt = _db.Query(lineageSql, new Dictionary<string, object> { { ":id", id } });
                foreach (DataRow row in lineageDt.Rows)
                {
                    details.Lineage.Add(new 
                    {
                        OrganismId = Convert.ToInt32(row["Organism_ID"]),
                        ScientificName = row["Scientific_Name"]?.ToString() ?? "",
                        CommonName = row["Common_Name"] == DBNull.Value ? null : row["Common_Name"]?.ToString(),
                        RankName = row["Rank_Name"]?.ToString() ?? ""
                    });
                }

                return Ok(details);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
