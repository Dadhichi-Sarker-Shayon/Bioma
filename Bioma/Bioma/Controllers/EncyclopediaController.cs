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

        /// <summary>
        /// GET /api/encyclopedia
        /// Lists all species with search and filter parameters.
        /// </summary>
        [HttpGet]
        public IActionResult GetSpecies([FromQuery] string? search, [FromQuery] string? status, [FromQuery] string? diet, [FromQuery] string? tags)
        {
            try
            {
                var sql = @"
                    SELECT o.Organism_ID, o.Scientific_Name, o.Common_Name, o.Discovery_Year,
                           sp.Kingdom_Type, sp.Status_Code, cs.Status_Name, cs.Risk_Level,
                           se.Image_URL, se.Diet_Type, se.Fun_Fact, se.Description
                    FROM Organisms o
                    JOIN Taxonomic_Ranks tr ON o.Rank_ID = tr.Rank_ID AND tr.Rank_Name = 'Species'
                    LEFT JOIN Species_Profiles sp ON o.Organism_ID = sp.Organism_ID
                    LEFT JOIN Species_Encyclopedia se ON o.Organism_ID = se.Organism_ID
                    LEFT JOIN Conservation_Statuses cs ON sp.Status_Code = cs.Status_Code
                    WHERE 1 = 1";

                var parms = new Dictionary<string, object>();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    sql += " AND (UPPER(o.Common_Name) LIKE :search OR UPPER(o.Scientific_Name) LIKE :search)";
                    parms.Add(":search", $"%{search.Trim().ToUpper()}%");
                }

                if (!string.IsNullOrWhiteSpace(status))
                {
                    sql += " AND sp.Status_Code = :status";
                    parms.Add(":status", status.Trim());
                }

                if (!string.IsNullOrWhiteSpace(diet))
                {
                    sql += " AND se.Diet_Type = :diet";
                    parms.Add(":diet", diet.Trim());
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

                // Fetch all tags to map them to the species list items in memory
                var tagsSql = @"
                    SELECT ot.Organism_ID, t.Tag_Name, t.Tag_Color
                    FROM Organism_Tags ot
                    JOIN Tags t ON ot.Tag_ID = t.Tag_ID";
                var tagsDt = _db.Query(tagsSql);

                var speciesList = new List<SpeciesListItemDto>();
                foreach (DataRow row in dt.Rows)
                {
                    var organismId = Convert.ToInt32(row["Organism_ID"]);
                    var species = new SpeciesListItemDto
                    {
                        OrganismId = organismId,
                        ScientificName = row["Scientific_Name"]?.ToString() ?? "",
                        CommonName = row["Common_Name"] == DBNull.Value ? null : row["Common_Name"]?.ToString(),
                        DiscoveryYear = row["Discovery_Year"] == DBNull.Value ? null : Convert.ToInt32(row["Discovery_Year"]),
                        KingdomType = row["Kingdom_Type"] == DBNull.Value ? null : row["Kingdom_Type"]?.ToString(),
                        StatusCode = row["Status_Code"] == DBNull.Value ? null : row["Status_Code"]?.ToString(),
                        StatusName = row["Status_Name"] == DBNull.Value ? null : row["Status_Name"]?.ToString(),
                        RiskLevel = row["Risk_Level"] == DBNull.Value ? null : Convert.ToInt32(row["Risk_Level"]),
                        ImageUrl = row["Image_URL"] == DBNull.Value ? null : row["Image_URL"]?.ToString(),
                        DietType = row["Diet_Type"] == DBNull.Value ? null : row["Diet_Type"]?.ToString(),
                        FunFact = row["Fun_Fact"] == DBNull.Value ? null : row["Fun_Fact"]?.ToString(),
                        Description = row["Description"] == DBNull.Value ? null : row["Description"]?.ToString()
                    };

                    // Filter tags for this organism in memory
                    var speciesTags = tagsDt.Select($"Organism_ID = {organismId}");
                    foreach (var tagRow in speciesTags)
                    {
                        species.Tags.Add(new TagDto
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

        /// <summary>
        /// GET /api/encyclopedia/filters
        /// Returns all statuses, diet types, and tags to populate search filter UI controls.
        /// </summary>
        [HttpGet("filters")]
        public IActionResult GetFilters()
        {
            try
            {
                var statusesDt = _db.Query("SELECT Status_Code, Status_Name, Risk_Level FROM Conservation_Statuses ORDER BY Risk_Level ASC");
                var tagsDt = _db.Query("SELECT Tag_Name, Tag_Category, Tag_Color FROM Tags ORDER BY Tag_Category ASC, Tag_Name ASC");

                var filters = new FiltersDto
                {
                    Diets = new List<string> { "Carnivore", "Herbivore", "Omnivore", "Detritivore", "Autotroph" }
                };

                foreach (DataRow row in statusesDt.Rows)
                {
                    filters.Statuses.Add(new StatusFilterDto
                    {
                        StatusCode = row["Status_Code"]?.ToString() ?? "",
                        StatusName = row["Status_Name"]?.ToString() ?? "",
                        RiskLevel = Convert.ToInt32(row["Risk_Level"])
                    });
                }

                foreach (DataRow row in tagsDt.Rows)
                {
                    filters.Tags.Add(new TagFilterDto
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

        /// <summary>
        /// GET /api/encyclopedia/{id}
        /// Fetches full detailed profile data for a specific species.
        /// </summary>
        [HttpGet("{id}")]
        public IActionResult GetSpeciesDetails(int id)
        {
            try
            {
                // 1. Fetch Primary Details
                var mainSql = @"
                    SELECT o.Organism_ID, o.Scientific_Name, o.Common_Name, o.Discovery_Year,
                           sp.Kingdom_Type, sp.Status_Code, cs.Status_Name, cs.Risk_Level,
                           sp.Avg_Lifespan_Years, sp.Avg_Weight_Kg, sp.Metabolic_Rate_Index, sp.Photosynthetic_Rate,
                           se.Description, se.Diet_Type, se.Diet_Details, se.Physical_Description, 
                           se.Avg_Height_Cm, se.Avg_Length_Cm, se.Habitat_Behavior, se.Reproduction_Info,
                           se.Native_Range_Description, se.Image_URL, se.Fun_Fact, se.Last_Updated
                    FROM Organisms o
                    LEFT JOIN Species_Profiles sp ON o.Organism_ID = sp.Organism_ID
                    LEFT JOIN Species_Encyclopedia se ON o.Organism_ID = se.Organism_ID
                    LEFT JOIN Conservation_Statuses cs ON sp.Status_Code = cs.Status_Code
                    WHERE o.Organism_ID = :id";

                var mainDt = _db.Query(mainSql, new Dictionary<string, object> { { ":id", id } });
                if (mainDt.Rows.Count == 0)
                {
                    return NotFound(new { error = "Species not found." });
                }

                var mainRow = mainDt.Rows[0];
                var details = new SpeciesDetailsDto
                {
                    OrganismId = Convert.ToInt32(mainRow["Organism_ID"]),
                    ScientificName = mainRow["Scientific_Name"]?.ToString() ?? "",
                    CommonName = mainRow["Common_Name"] == DBNull.Value ? null : mainRow["Common_Name"]?.ToString(),
                    DiscoveryYear = mainRow["Discovery_Year"] == DBNull.Value ? null : Convert.ToInt32(mainRow["Discovery_Year"]),
                    KingdomType = mainRow["Kingdom_Type"] == DBNull.Value ? null : mainRow["Kingdom_Type"]?.ToString(),
                    StatusCode = mainRow["Status_Code"] == DBNull.Value ? null : mainRow["Status_Code"]?.ToString(),
                    StatusName = mainRow["Status_Name"] == DBNull.Value ? null : mainRow["Status_Name"]?.ToString(),
                    RiskLevel = mainRow["Risk_Level"] == DBNull.Value ? null : Convert.ToInt32(mainRow["Risk_Level"]),
                    AvgLifespanYears = mainRow["Avg_Lifespan_Years"] == DBNull.Value ? null : Convert.ToDouble(mainRow["Avg_Lifespan_Years"]),
                    AvgWeightKg = mainRow["Avg_Weight_Kg"] == DBNull.Value ? null : Convert.ToDouble(mainRow["Avg_Weight_Kg"]),
                    MetabolicRateIndex = mainRow["Metabolic_Rate_Index"] == DBNull.Value ? null : mainRow["Metabolic_Rate_Index"]?.ToString(),
                    PhotosyntheticRate = mainRow["Photosynthetic_Rate"] == DBNull.Value ? null : mainRow["Photosynthetic_Rate"]?.ToString(),
                    Description = mainRow["Description"] == DBNull.Value ? null : mainRow["Description"]?.ToString(),
                    DietType = mainRow["Diet_Type"] == DBNull.Value ? null : mainRow["Diet_Type"]?.ToString(),
                    DietDetails = mainRow["Diet_Details"] == DBNull.Value ? null : mainRow["Diet_Details"]?.ToString(),
                    PhysicalDescription = mainRow["Physical_Description"] == DBNull.Value ? null : mainRow["Physical_Description"]?.ToString(),
                    AvgHeightCm = mainRow["Avg_Height_Cm"] == DBNull.Value ? null : Convert.ToDouble(mainRow["Avg_Height_Cm"]),
                    AvgLengthCm = mainRow["Avg_Length_Cm"] == DBNull.Value ? null : Convert.ToDouble(mainRow["Avg_Length_Cm"]),
                    HabitatBehavior = mainRow["Habitat_Behavior"] == DBNull.Value ? null : mainRow["Habitat_Behavior"]?.ToString(),
                    ReproductionInfo = mainRow["Reproduction_Info"] == DBNull.Value ? null : mainRow["Reproduction_Info"]?.ToString(),
                    NativeRangeDescription = mainRow["Native_Range_Description"] == DBNull.Value ? null : mainRow["Native_Range_Description"]?.ToString(),
                    ImageUrl = mainRow["Image_URL"] == DBNull.Value ? null : mainRow["Image_URL"]?.ToString(),
                    FunFact = mainRow["Fun_Fact"] == DBNull.Value ? null : mainRow["Fun_Fact"]?.ToString(),
                    LastUpdated = mainRow["Last_Updated"] == DBNull.Value ? null : Convert.ToDateTime(mainRow["Last_Updated"]).ToString("yyyy-MM-dd")
                };

                // 2. Fetch Photo Gallery
                var photosSql = "SELECT Photo_ID, Photo_URL, Caption, Is_Primary FROM Species_Photos WHERE Organism_ID = :id ORDER BY Is_Primary DESC, Photo_ID ASC";
                var photosDt = _db.Query(photosSql, new Dictionary<string, object> { { ":id", id } });
                foreach (DataRow row in photosDt.Rows)
                {
                    details.Photos.Add(new PhotoDto
                    {
                        PhotoId = Convert.ToInt32(row["Photo_ID"]),
                        PhotoUrl = row["Photo_URL"]?.ToString() ?? "",
                        Caption = row["Caption"] == DBNull.Value ? null : row["Caption"]?.ToString(),
                        IsPrimary = row["Is_Primary"]?.ToString() ?? "N"
                    });
                }

                // 3. Fetch Distribution Regions
                var distSql = @"
                    SELECT sd.Estimated_Local_Population, sd.Last_Survey_Date, sd.Population_Trend,
                           gr.Region_Name, gr.Country, gr.Area_SqKm, gr.Is_Protected,
                           b.Biome_Name, b.Climate_Zone
                    FROM Species_Distribution sd
                    JOIN Geographical_Regions gr ON sd.Region_ID = gr.Region_ID
                    JOIN Biomes b ON gr.Biome_ID = b.Biome_ID
                    WHERE sd.Organism_ID = :id";
                var distDt = _db.Query(distSql, new Dictionary<string, object> { { ":id", id } });
                foreach (DataRow row in distDt.Rows)
                {
                    details.Distributions.Add(new DistributionDto
                    {
                        EstimatedLocalPopulation = row["Estimated_Local_Population"] == DBNull.Value ? null : Convert.ToInt32(row["Estimated_Local_Population"]),
                        LastSurveyDate = row["Last_Survey_Date"] == DBNull.Value ? null : Convert.ToDateTime(row["Last_Survey_Date"]).ToString("yyyy-MM-dd"),
                        PopulationTrend = row["Population_Trend"] == DBNull.Value ? null : row["Population_Trend"]?.ToString(),
                        RegionName = row["Region_Name"]?.ToString() ?? "",
                        Country = row["Country"]?.ToString() ?? "",
                        AreaSqKm = row["Area_SqKm"] == DBNull.Value ? null : Convert.ToDouble(row["Area_SqKm"]),
                        IsProtected = row["Is_Protected"]?.ToString() ?? "N",
                        BiomeName = row["Biome_Name"]?.ToString() ?? "",
                        ClimateZone = row["Climate_Zone"]?.ToString() ?? ""
                    });
                }

                // 4. Fetch Ecological Interactions
                var interactSql = @"
                    SELECT ei.Interaction_ID, ei.Ecological_Impact_Scale, ei.Interaction_Notes,
                           it.Interaction_Name,
                           o_other.Organism_ID AS Other_Organism_ID,
                           o_other.Common_Name AS Other_Common_Name,
                           o_other.Scientific_Name AS Other_Scientific_Name,
                           CASE WHEN ei.Organism_A_ID = :id THEN 'Actor' ELSE 'Receiver' END AS Role
                    FROM Ecological_Interactions ei
                    JOIN Interaction_Types it ON ei.Type_ID = it.Type_ID
                    JOIN Organisms o_other ON (
                        CASE WHEN ei.Organism_A_ID = :id THEN ei.Organism_B_ID ELSE ei.Organism_A_ID END
                    ) = o_other.Organism_ID
                    WHERE ei.Organism_A_ID = :id OR ei.Organism_B_ID = :id";
                var interactDt = _db.Query(interactSql, new Dictionary<string, object> { { ":id", id } });
                foreach (DataRow row in interactDt.Rows)
                {
                    details.Interactions.Add(new InteractionDto
                    {
                        InteractionId = Convert.ToInt32(row["Interaction_ID"]),
                        EcologicalImpactScale = Convert.ToInt32(row["Ecological_Impact_Scale"]),
                        InteractionNotes = row["Interaction_Notes"] == DBNull.Value ? null : row["Interaction_Notes"]?.ToString(),
                        InteractionName = row["Interaction_Name"]?.ToString() ?? "",
                        OtherOrganismId = Convert.ToInt32(row["Other_Organism_ID"]),
                        OtherCommonName = row["Other_Common_Name"] == DBNull.Value ? null : row["Other_Common_Name"]?.ToString(),
                        OtherScientificName = row["Other_Scientific_Name"]?.ToString() ?? "",
                        Role = row["Role"]?.ToString() ?? ""
                    });
                }

                // 5. Fetch Recursive Taxonomic Lineage (Oracle START WITH ... CONNECT BY)
                var lineageSql = @"
                    SELECT o.Organism_ID, o.Scientific_Name, o.Common_Name, tr.Rank_Name, tr.Rank_Level
                    FROM Organisms o
                    JOIN Taxonomic_Ranks tr ON o.Rank_ID = tr.Rank_ID
                    START WITH o.Organism_ID = :id
                    CONNECT BY PRIOR o.Parent_ID = o.Organism_ID
                    ORDER BY tr.Rank_Level ASC";
                var lineageDt = _db.Query(lineageSql, new Dictionary<string, object> { { ":id", id } });
                foreach (DataRow row in lineageDt.Rows)
                {
                    details.Lineage.Add(new LineageDto
                    {
                        OrganismId = Convert.ToInt32(row["Organism_ID"]),
                        ScientificName = row["Scientific_Name"]?.ToString() ?? "",
                        CommonName = row["Common_Name"] == DBNull.Value ? null : row["Common_Name"]?.ToString(),
                        RankName = row["Rank_Name"]?.ToString() ?? "",
                        RankLevel = Convert.ToInt32(row["Rank_Level"])
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

    // ────────────────────────────────────────────────────────
    // DTO Classes
    // ────────────────────────────────────────────────────────

    public class SpeciesListItemDto
    {
        public int OrganismId { get; set; }
        public string ScientificName { get; set; } = "";
        public string? CommonName { get; set; }
        public int? DiscoveryYear { get; set; }
        public string? KingdomType { get; set; }
        public string? StatusCode { get; set; }
        public string? StatusName { get; set; }
        public int? RiskLevel { get; set; }
        public string? ImageUrl { get; set; }
        public string? DietType { get; set; }
        public string? FunFact { get; set; }
        public string? Description { get; set; }
        public List<TagDto> Tags { get; set; } = new();
    }

    public class TagDto
    {
        public string TagName { get; set; } = "";
        public string TagColor { get; set; } = "";
    }

    public class FiltersDto
    {
        public List<StatusFilterDto> Statuses { get; set; } = new();
        public List<string> Diets { get; set; } = new();
        public List<TagFilterDto> Tags { get; set; } = new();
    }

    public class StatusFilterDto
    {
        public string StatusCode { get; set; } = "";
        public string StatusName { get; set; } = "";
        public int RiskLevel { get; set; }
    }

    public class TagFilterDto
    {
        public string TagName { get; set; } = "";
        public string TagCategory { get; set; } = "";
        public string TagColor { get; set; } = "";
    }

    public class SpeciesDetailsDto
    {
        public int OrganismId { get; set; }
        public string ScientificName { get; set; } = "";
        public string? CommonName { get; set; }
        public int? DiscoveryYear { get; set; }
        public string? KingdomType { get; set; }
        public string? StatusCode { get; set; }
        public string? StatusName { get; set; }
        public int? RiskLevel { get; set; }
        public double? AvgLifespanYears { get; set; }
        public double? AvgWeightKg { get; set; }
        public string? MetabolicRateIndex { get; set; }
        public string? PhotosyntheticRate { get; set; }
        public string? Description { get; set; }
        public string? DietType { get; set; }
        public string? DietDetails { get; set; }
        public string? PhysicalDescription { get; set; }
        public double? AvgHeightCm { get; set; }
        public double? AvgLengthCm { get; set; }
        public string? HabitatBehavior { get; set; }
        public string? ReproductionInfo { get; set; }
        public string? NativeRangeDescription { get; set; }
        public string? ImageUrl { get; set; }
        public string? FunFact { get; set; }
        public string? LastUpdated { get; set; }

        public List<PhotoDto> Photos { get; set; } = new();
        public List<DistributionDto> Distributions { get; set; } = new();
        public List<InteractionDto> Interactions { get; set; } = new();
        public List<LineageDto> Lineage { get; set; } = new();
    }

    public class PhotoDto
    {
        public int PhotoId { get; set; }
        public string PhotoUrl { get; set; } = "";
        public string? Caption { get; set; }
        public string IsPrimary { get; set; } = "N";
    }

    public class DistributionDto
    {
        public int? EstimatedLocalPopulation { get; set; }
        public string? LastSurveyDate { get; set; }
        public string? PopulationTrend { get; set; }
        public string RegionName { get; set; } = "";
        public string Country { get; set; } = "";
        public double? AreaSqKm { get; set; }
        public string IsProtected { get; set; } = "N";
        public string BiomeName { get; set; } = "";
        public string ClimateZone { get; set; } = "";
    }

    public class InteractionDto
    {
        public int InteractionId { get; set; }
        public int EcologicalImpactScale { get; set; }
        public string? InteractionNotes { get; set; }
        public string InteractionName { get; set; } = "";
        public int OtherOrganismId { get; set; }
        public string? OtherCommonName { get; set; }
        public string OtherScientificName { get; set; } = "";
        public string Role { get; set; } = "";
    }

    public class LineageDto
    {
        public int OrganismId { get; set; }
        public string ScientificName { get; set; } = "";
        public string? CommonName { get; set; }
        public string RankName { get; set; } = "";
        public int RankLevel { get; set; }
    }
}
