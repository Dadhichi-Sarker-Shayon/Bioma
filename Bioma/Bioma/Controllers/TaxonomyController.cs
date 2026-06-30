using Microsoft.AspNetCore.Mvc;
using Bioma.Services;
using Bioma.Models;
using System.Data;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaxonomyController : ControllerBase
    {
        private readonly DatabaseService _db;

        public TaxonomyController(DatabaseService db)
        {
            _db = db;
        }

        [HttpGet("ranks")]
        public IActionResult GetRanks()
        {
            var ranks = new[] { "Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species" };
            var list = ranks.Select((r, i) => new { rankId = i + 1, rankName = r, rankLevel = i + 1 });
            return Ok(list);
        }

        [HttpGet("statuses")]
        public IActionResult GetStatuses()
        {
            var statuses = new[] { "LC", "NT", "VU", "EN", "CR", "EW", "EX" };
            var list = statuses.Select((s, i) => new { statusCode = s, statusName = s, riskLevel = i + 1 });
            return Ok(list);
        }

        [HttpGet("tree")]
        public IActionResult GetTree()
        {
            try
            {
                var sql = @"
                    SELECT Organism_ID, Scientific_Name, Common_Name, Discovery_Year, 
                           Parent_ID, Rank_Name, Kingdom_Type, Conservation_Status
                    FROM Organisms
                    ORDER BY CASE Rank_Name 
                        WHEN 'Kingdom' THEN 1 WHEN 'Phylum' THEN 2 WHEN 'Class' THEN 3 
                        WHEN 'Order' THEN 4 WHEN 'Family' THEN 5 WHEN 'Genus' THEN 6 WHEN 'Species' THEN 7 END ASC, 
                        Scientific_Name ASC";
                var dt = _db.Query(sql);

                var list = new List<object>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        organismId = row["Organism_ID"],
                        scientificName = row["Scientific_Name"]?.ToString(),
                        commonName = row["Common_Name"]?.ToString(),
                        discoveryYear = row["Discovery_Year"],
                        parentId = row["Parent_ID"],
                        rankName = row["Rank_Name"]?.ToString(),
                        kingdomType = row["Kingdom_Type"]?.ToString(),
                        conservationStatus = row["Conservation_Status"]?.ToString()
                    });
                }
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("organisms")]
        public IActionResult CreateOrganism([FromBody] OrganismDto dto)
        {
            try
            {
                var sql = @"INSERT INTO Organisms (Scientific_Name, Common_Name, Rank_Name, Parent_ID, Kingdom_Type, Conservation_Status, Discovery_Year) 
                            VALUES (:sci, :com, :rank, :parent, :king, :status, :year) RETURNING Organism_ID INTO :new_id";
                
                using var conn = _db.GetConnection();
                using var cmd = new Oracle.ManagedDataAccess.Client.OracleCommand(sql, conn);
                cmd.Parameters.Add("sci", dto.ScientificName);
                cmd.Parameters.Add("com", dto.CommonName ?? (object)DBNull.Value);
                cmd.Parameters.Add("rank", dto.RankName);
                cmd.Parameters.Add("parent", dto.ParentId.HasValue ? dto.ParentId.Value : (object)DBNull.Value);
                cmd.Parameters.Add("king", dto.KingdomType ?? (object)DBNull.Value);
                cmd.Parameters.Add("status", dto.ConservationStatus ?? (object)DBNull.Value);
                cmd.Parameters.Add("year", dto.DiscoveryYear.HasValue ? dto.DiscoveryYear.Value : (object)DBNull.Value);
                
                var outParam = new Oracle.ManagedDataAccess.Client.OracleParameter("new_id", Oracle.ManagedDataAccess.Client.OracleDbType.Decimal);
                outParam.Direction = ParameterDirection.Output;
                cmd.Parameters.Add(outParam);
                
                cmd.ExecuteNonQuery();

                return Ok(new { message = "Organism created", organismId = outParam.Value });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("organisms/{id}")]
        public IActionResult UpdateOrganism(int id, [FromBody] OrganismDto dto)
        {
            try
            {
                var sql = @"UPDATE Organisms 
                            SET Scientific_Name = :sci, Common_Name = :com, Rank_Name = :rank, Parent_ID = :parent, Kingdom_Type = :king, Conservation_Status = :status, Discovery_Year = :year
                            WHERE Organism_ID = :id";
                var parms = new Dictionary<string, object>
                {
                    { "sci", dto.ScientificName },
                    { "com", dto.CommonName ?? (object)DBNull.Value },
                    { "rank", dto.RankName },
                    { "parent", dto.ParentId ?? (object)DBNull.Value },
                    { "king", dto.KingdomType ?? (object)DBNull.Value },
                    { "status", dto.ConservationStatus ?? (object)DBNull.Value },
                    { "year", dto.DiscoveryYear ?? (object)DBNull.Value },
                    { "id", id }
                };
                int rows = _db.Execute(sql, parms);
                if (rows == 0) return NotFound(new { error = "Organism not found" });
                return Ok(new { message = "Organism updated" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("organisms/{id}")]
        public IActionResult DeleteOrganism(int id)
        {
            try
            {
                int rows = _db.Execute("DELETE FROM Organisms WHERE Organism_ID = :id", new Dictionary<string, object> { { "id", id } });
                if (rows == 0) return NotFound(new { error = "Organism not found" });
                return Ok(new { message = "Organism deleted" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("species-details/{id}")]
        public IActionResult GetSpeciesDetails(int id)
        {
            try
            {
                var orgDt = _db.Query("SELECT Kingdom_Type, Conservation_Status FROM Organisms WHERE Organism_ID = :id", new Dictionary<string, object> { { "id", id } });
                var encycDt = _db.Query("SELECT * FROM Species_Encyclopedia WHERE Organism_ID = :id", new Dictionary<string, object> { { "id", id } });

                object? profile = null;
                if (orgDt.Rows.Count > 0)
                {
                    var r = orgDt.Rows[0];
                    profile = new
                    {
                        kingdomType = r["Kingdom_Type"]?.ToString(),
                        statusCode = r["Conservation_Status"]?.ToString()
                    };
                }

                object? encyclopedia = null;
                if (encycDt.Rows.Count > 0)
                {
                    var r = encycDt.Rows[0];
                    encyclopedia = new
                    {
                        description = r["Description"]?.ToString(),
                        dietType = r["Diet_Type"]?.ToString(),
                        dietDetails = r["Diet_Details"]?.ToString(),
                        physicalDescription = r["Physical_Description"]?.ToString(),
                        avgHeightCm = r["Avg_Height_Cm"],
                        avgLengthCm = r["Avg_Length_Cm"],
                        habitatBehavior = r["Habitat_Behavior"]?.ToString(),
                        reproductionInfo = r["Reproduction_Info"]?.ToString(),
                        nativeRangeDescription = r["Native_Range_Description"]?.ToString(),
                        imageUrl = r["Image_URL"]?.ToString(),
                        funFact = r["Fun_Fact"]?.ToString()
                    };
                }

                return Ok(new { profile, encyclopedia });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("species-details/{id}")]
        public IActionResult UpsertSpeciesDetails(int id, [FromBody] SpeciesEncyclopediaDto dto)
        {
            try
            {
                // Encyclopedia
                var encycDt = _db.Query("SELECT 1 FROM Species_Encyclopedia WHERE Organism_ID = :id", new Dictionary<string, object> { { "id", id } });
                if (encycDt.Rows.Count > 0)
                {
                    var sql = @"UPDATE Species_Encyclopedia SET 
                                Description = :desc, Diet_Type = :dt, Diet_Details = :dd, Physical_Description = :pd, 
                                Avg_Height_Cm = :ahc, Avg_Length_Cm = :alc, Habitat_Behavior = :hb, Reproduction_Info = :ri, 
                                Native_Range_Description = :nrd, Image_URL = :img, Fun_Fact = :ff, Last_Updated = SYSDATE
                                WHERE Organism_ID = :id";
                    _db.Execute(sql, new Dictionary<string, object> {
                        { "desc", dto.Description ?? (object)DBNull.Value }, { "dt", dto.DietType ?? (object)DBNull.Value }, { "dd", dto.DietDetails ?? (object)DBNull.Value }, { "pd", dto.PhysicalDescription ?? (object)DBNull.Value },
                        { "ahc", dto.AvgHeightCm ?? (object)DBNull.Value }, { "alc", dto.AvgLengthCm ?? (object)DBNull.Value }, { "hb", dto.HabitatBehavior ?? (object)DBNull.Value }, { "ri", dto.ReproductionInfo ?? (object)DBNull.Value },
                        { "nrd", dto.NativeRangeDescription ?? (object)DBNull.Value }, { "img", dto.ImageUrl ?? (object)DBNull.Value }, { "ff", dto.FunFact ?? (object)DBNull.Value }, { "id", id }
                    });
                }
                else
                {
                    var sql = @"INSERT INTO Species_Encyclopedia (Organism_ID, Description, Diet_Type, Diet_Details, Physical_Description, Avg_Height_Cm, Avg_Length_Cm, Habitat_Behavior, Reproduction_Info, Native_Range_Description, Image_URL, Fun_Fact, Last_Updated)
                                VALUES (:id, :desc, :dt, :dd, :pd, :ahc, :alc, :hb, :ri, :nrd, :img, :ff, SYSDATE)";
                    _db.Execute(sql, new Dictionary<string, object> {
                        { "id", id }, { "desc", dto.Description ?? (object)DBNull.Value }, { "dt", dto.DietType ?? (object)DBNull.Value }, { "dd", dto.DietDetails ?? (object)DBNull.Value }, { "pd", dto.PhysicalDescription ?? (object)DBNull.Value },
                        { "ahc", dto.AvgHeightCm ?? (object)DBNull.Value }, { "alc", dto.AvgLengthCm ?? (object)DBNull.Value }, { "hb", dto.HabitatBehavior ?? (object)DBNull.Value }, { "ri", dto.ReproductionInfo ?? (object)DBNull.Value },
                        { "nrd", dto.NativeRangeDescription ?? (object)DBNull.Value }, { "img", dto.ImageUrl ?? (object)DBNull.Value }, { "ff", dto.FunFact ?? (object)DBNull.Value }
                    });
                }

                return Ok(new { message = "Species details saved successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
        
        [HttpGet("photos/{id}")]
        public IActionResult GetPhotos(int id)
        {
            return Ok(new List<object>()); // Removed in new architecture
        }
    }
}
