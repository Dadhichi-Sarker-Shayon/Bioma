using Microsoft.AspNetCore.Mvc;
using Bioma.Services;
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
            try
            {
                var dt = _db.Query("SELECT * FROM Taxonomic_Ranks ORDER BY Rank_Level ASC");
                var list = new List<object>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        rankId = row["Rank_ID"],
                        rankName = row["Rank_Name"]?.ToString(),
                        rankLevel = row["Rank_Level"]
                    });
                }
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("statuses")]
        public IActionResult GetStatuses()
        {
            try
            {
                var dt = _db.Query("SELECT * FROM Conservation_Statuses ORDER BY Risk_Level ASC");
                var list = new List<object>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        statusCode = row["Status_Code"]?.ToString(),
                        statusName = row["Status_Name"]?.ToString(),
                        riskLevel = row["Risk_Level"]
                    });
                }
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("tree")]
        public IActionResult GetTree()
        {
            try
            {
                var sql = @"
                    SELECT o.Organism_ID, o.Scientific_Name, o.Common_Name, o.Discovery_Year, 
                           o.Rank_ID, o.Parent_ID, tr.Rank_Name, tr.Rank_Level
                    FROM Organisms o
                    JOIN Taxonomic_Ranks tr ON o.Rank_ID = tr.Rank_ID
                    ORDER BY tr.Rank_Level ASC, o.Scientific_Name ASC";
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
                        rankId = row["Rank_ID"],
                        parentId = row["Parent_ID"],
                        rankName = row["Rank_Name"]?.ToString(),
                        rankLevel = row["Rank_Level"]
                    });
                }
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        public class OrganismDto
        {
            public string? ScientificName { get; set; }
            public string? CommonName { get; set; }
            public int RankId { get; set; }
            public int? ParentId { get; set; }
            public int? DiscoveryYear { get; set; }
        }

        [HttpPost("organisms")]
        public IActionResult CreateOrganism([FromBody] OrganismDto dto)
        {
            try
            {
                var sql = @"INSERT INTO Organisms (Scientific_Name, Common_Name, Rank_ID, Parent_ID, Discovery_Year) 
                            VALUES (:sci, :com, :rank, :parent, :year) RETURNING Organism_ID INTO :new_id";
                
                using var conn = _db.GetConnection();
                using var cmd = new Oracle.ManagedDataAccess.Client.OracleCommand(sql, conn);
                cmd.Parameters.Add("sci", dto.ScientificName);
                cmd.Parameters.Add("com", dto.CommonName ?? (object)DBNull.Value);
                cmd.Parameters.Add("rank", dto.RankId);
                cmd.Parameters.Add("parent", dto.ParentId.HasValue ? dto.ParentId.Value : (object)DBNull.Value);
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
                            SET Scientific_Name = :sci, Common_Name = :com, Rank_ID = :rank, Parent_ID = :parent, Discovery_Year = :year
                            WHERE Organism_ID = :id";
                var parms = new Dictionary<string, object>
                {
                    { "sci", dto.ScientificName! },
                    { "com", dto.CommonName! },
                    { "rank", dto.RankId },
                    { "parent", dto.ParentId! },
                    { "year", dto.DiscoveryYear! },
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
                var profileDt = _db.Query("SELECT * FROM Species_Profiles WHERE Organism_ID = :id", new Dictionary<string, object> { { "id", id } });
                var encycDt = _db.Query("SELECT * FROM Species_Encyclopedia WHERE Organism_ID = :id", new Dictionary<string, object> { { "id", id } });

                object? profile = null;
                if (profileDt.Rows.Count > 0)
                {
                    var r = profileDt.Rows[0];
                    profile = new
                    {
                        kingdomType = r["Kingdom_Type"]?.ToString(),
                        statusCode = r["Status_Code"]?.ToString(),
                        avgLifespanYears = r["Avg_Lifespan_Years"],
                        avgWeightKg = r["Avg_Weight_Kg"],
                        metabolicRateIndex = r["Metabolic_Rate_Index"]?.ToString(),
                        photosyntheticRate = r["Photosynthetic_Rate"]?.ToString()
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

        public class SpeciesDetailsDto
        {
            public string? KingdomType { get; set; }
            public string? StatusCode { get; set; }
            public decimal? AvgLifespanYears { get; set; }
            public decimal? AvgWeightKg { get; set; }
            public string? MetabolicRateIndex { get; set; }
            public string? PhotosyntheticRate { get; set; }

            public string? Description { get; set; }
            public string? DietType { get; set; }
            public string? DietDetails { get; set; }
            public string? PhysicalDescription { get; set; }
            public decimal? AvgHeightCm { get; set; }
            public decimal? AvgLengthCm { get; set; }
            public string? HabitatBehavior { get; set; }
            public string? ReproductionInfo { get; set; }
            public string? NativeRangeDescription { get; set; }
            public string? ImageUrl { get; set; }
            public string? FunFact { get; set; }
        }

        [HttpPost("species-details/{id}")]
        public IActionResult UpsertSpeciesDetails(int id, [FromBody] SpeciesDetailsDto dto)
        {
            try
            {
                // Profile
                var profileDt = _db.Query("SELECT 1 FROM Species_Profiles WHERE Organism_ID = :id", new Dictionary<string, object> { { "id", id } });
                if (profileDt.Rows.Count > 0)
                {
                    var sql = @"UPDATE Species_Profiles SET 
                                Kingdom_Type = :kt, Status_Code = :sc, Avg_Lifespan_Years = :aly, Avg_Weight_Kg = :awk, 
                                Metabolic_Rate_Index = :mri, Photosynthetic_Rate = :pr
                                WHERE Organism_ID = :id";
                    _db.Execute(sql, new Dictionary<string, object> {
                        { "kt", dto.KingdomType! }, { "sc", dto.StatusCode! }, { "aly", dto.AvgLifespanYears! },
                        { "awk", dto.AvgWeightKg! }, { "mri", dto.MetabolicRateIndex! }, { "pr", dto.PhotosyntheticRate! }, { "id", id }
                    });
                }
                else
                {
                    var sql = @"INSERT INTO Species_Profiles (Organism_ID, Kingdom_Type, Status_Code, Avg_Lifespan_Years, Avg_Weight_Kg, Metabolic_Rate_Index, Photosynthetic_Rate)
                                VALUES (:id, :kt, :sc, :aly, :awk, :mri, :pr)";
                    _db.Execute(sql, new Dictionary<string, object> {
                        { "id", id }, { "kt", dto.KingdomType! }, { "sc", dto.StatusCode! }, { "aly", dto.AvgLifespanYears! },
                        { "awk", dto.AvgWeightKg! }, { "mri", dto.MetabolicRateIndex! }, { "pr", dto.PhotosyntheticRate! }
                    });
                }

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
                        { "desc", dto.Description! }, { "dt", dto.DietType! }, { "dd", dto.DietDetails! }, { "pd", dto.PhysicalDescription! },
                        { "ahc", dto.AvgHeightCm! }, { "alc", dto.AvgLengthCm! }, { "hb", dto.HabitatBehavior! }, { "ri", dto.ReproductionInfo! },
                        { "nrd", dto.NativeRangeDescription! }, { "img", dto.ImageUrl! }, { "ff", dto.FunFact! }, { "id", id }
                    });
                }
                else
                {
                    var sql = @"INSERT INTO Species_Encyclopedia (Organism_ID, Description, Diet_Type, Diet_Details, Physical_Description, Avg_Height_Cm, Avg_Length_Cm, Habitat_Behavior, Reproduction_Info, Native_Range_Description, Image_URL, Fun_Fact, Last_Updated)
                                VALUES (:id, :desc, :dt, :dd, :pd, :ahc, :alc, :hb, :ri, :nrd, :img, :ff, SYSDATE)";
                    _db.Execute(sql, new Dictionary<string, object> {
                        { "id", id }, { "desc", dto.Description! }, { "dt", dto.DietType! }, { "dd", dto.DietDetails! }, { "pd", dto.PhysicalDescription! },
                        { "ahc", dto.AvgHeightCm! }, { "alc", dto.AvgLengthCm! }, { "hb", dto.HabitatBehavior! }, { "ri", dto.ReproductionInfo! },
                        { "nrd", dto.NativeRangeDescription! }, { "img", dto.ImageUrl! }, { "ff", dto.FunFact! }
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
            try
            {
                var dt = _db.Query("SELECT * FROM Species_Photos WHERE Organism_ID = :id ORDER BY Uploaded_At DESC", new Dictionary<string, object> { { "id", id } });
                var list = new List<object>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        photoId = row["Photo_ID"],
                        organismId = row["Organism_ID"],
                        photoUrl = row["Photo_URL"]?.ToString(),
                        caption = row["Caption"]?.ToString(),
                        isPrimary = row["Is_Primary"]?.ToString(),
                        uploadedAt = row["Uploaded_At"]
                    });
                }
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        public class PhotoDto
        {
            public int OrganismId { get; set; }
            public string? PhotoUrl { get; set; }
            public string? Caption { get; set; }
            public string? IsPrimary { get; set; }
        }

        [HttpPost("photos")]
        public IActionResult AddPhoto([FromBody] PhotoDto dto)
        {
            try
            {
                var sql = @"INSERT INTO Species_Photos (Organism_ID, Photo_URL, Caption, Is_Primary, Uploaded_At) 
                            VALUES (:id, :url, :cap, :isp, SYSDATE)";
                _db.Execute(sql, new Dictionary<string, object> {
                    { "id", dto.OrganismId },
                    { "url", dto.PhotoUrl! },
                    { "cap", dto.Caption! },
                    { "isp", string.IsNullOrEmpty(dto.IsPrimary) ? "N" : dto.IsPrimary }
                });
                return Ok(new { message = "Photo added" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("photos/{photoId}")]
        public IActionResult DeletePhoto(int photoId)
        {
            try
            {
                int rows = _db.Execute("DELETE FROM Species_Photos WHERE Photo_ID = :id", new Dictionary<string, object> { { "id", photoId } });
                if (rows == 0) return NotFound(new { error = "Photo not found" });
                return Ok(new { message = "Photo deleted" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
