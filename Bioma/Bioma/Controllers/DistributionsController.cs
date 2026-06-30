using Microsoft.AspNetCore.Mvc;
using Bioma.Services;
using Bioma.Models;
using System.Data;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DistributionsController : ControllerBase
    {
        private readonly DatabaseService _db;

        public DistributionsController(DatabaseService db)
        {
            _db = db;
        }

        [HttpGet("{organismId}")]
        public IActionResult GetDistributions(int organismId)
        {
            try
            {
                var sql = @"
                    SELECT sd.Organism_ID, sd.Region_ID, sd.Estimated_Population, 
                           sd.Last_Survey_Date, sd.Population_Trend,
                           r.Region_Name, r.Country
                    FROM Species_Distribution sd
                    JOIN Regions r ON sd.Region_ID = r.Region_ID
                    WHERE sd.Organism_ID = :orgId";

                var dt = _db.Query(sql, new Dictionary<string, object> { { "orgId", organismId } });
                var list = new List<SpeciesDistributionDto>();
                
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new SpeciesDistributionDto
                    {
                        OrganismId = Convert.ToInt32(row["Organism_ID"]),
                        RegionId = Convert.ToInt32(row["Region_ID"]),
                        RegionName = row["Region_Name"]?.ToString(),
                        Country = row["Country"]?.ToString(),
                        EstimatedPopulation = row["Estimated_Population"] == DBNull.Value ? null : Convert.ToInt32(row["Estimated_Population"]),
                        LastSurveyDate = row["Last_Survey_Date"] == DBNull.Value ? null : Convert.ToDateTime(row["Last_Survey_Date"]),
                        PopulationTrend = row["Population_Trend"]?.ToString()
                    });
                }
                
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("{organismId}")]
        public IActionResult AddDistribution(int organismId, [FromBody] DistributionCreateDto dto)
        {
            try
            {
                var checkSql = "SELECT 1 FROM Species_Distribution WHERE Organism_ID = :orgId AND Region_ID = :regId";
                var checkDt = _db.Query(checkSql, new Dictionary<string, object> { 
                    { "orgId", organismId }, 
                    { "regId", dto.RegionId } 
                });
                
                if (checkDt.Rows.Count > 0)
                {
                    return BadRequest(new { error = "This species is already distributed in this region." });
                }

                var sql = @"INSERT INTO Species_Distribution (Organism_ID, Region_ID, Estimated_Population, Last_Survey_Date, Population_Trend)
                            VALUES (:orgId, :regId, :estPop, :surveyDate, :trend)";
                
                _db.Execute(sql, new Dictionary<string, object>
                {
                    { "orgId", organismId },
                    { "regId", dto.RegionId },
                    { "estPop", dto.EstimatedPopulation ?? (object)DBNull.Value },
                    { "surveyDate", dto.LastSurveyDate ?? (object)DBNull.Value },
                    { "trend", dto.PopulationTrend ?? (object)DBNull.Value }
                });

                return Ok(new { message = "Distribution added successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("{organismId}/{regionId}")]
        public IActionResult DeleteDistribution(int organismId, int regionId)
        {
            try
            {
                var sql = "DELETE FROM Species_Distribution WHERE Organism_ID = :orgId AND Region_ID = :regId";
                _db.Execute(sql, new Dictionary<string, object>
                {
                    { "orgId", organismId },
                    { "regId", regionId }
                });

                return Ok(new { message = "Distribution removed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
