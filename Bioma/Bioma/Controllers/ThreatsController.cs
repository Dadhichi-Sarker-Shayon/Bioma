using Microsoft.AspNetCore.Mvc;
using Bioma.Services;
using System.Data;
using Bioma.Models;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ThreatsController : ControllerBase
    {
        private readonly DatabaseService _db;

        public ThreatsController(DatabaseService db)
        {
            _db = db;
        }

        [HttpGet("lookups")]
        public IActionResult GetLookups()
        {
            try
            {
                var regionsDt = _db.Query("SELECT Region_ID, Region_Name FROM Regions ORDER BY Region_Name ASC");
                var regionsList = new List<object>();
                foreach (DataRow row in regionsDt.Rows)
                {
                    regionsList.Add(new
                    {
                        regionId = row["Region_ID"],
                        regionName = row["Region_Name"]?.ToString()
                    });
                }
                
                var threatCategories = new[] { "Human-Caused", "Natural", "Climate-Related" };
                var severities = new[] { "Low", "Medium", "High", "Critical" };

                return Ok(new { regions = regionsList, categories = threatCategories, severities = severities });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet]
        public IActionResult GetThreatLogs()
        {
            try
            {
                var sql = @"
                    SELECT t.Log_ID, t.Region_ID, t.Threat_Name, t.Threat_Category, t.Severity_Level, t.Assessment_Date, 
                           t.Admin_ID, t.Resolution_Status,
                           r.Region_Name, u.Full_Name
                    FROM Threat_Logs t
                    JOIN Regions r ON t.Region_ID = r.Region_ID
                    LEFT JOIN Admins u ON t.Admin_ID = u.Admin_ID
                    ORDER BY t.Assessment_Date DESC";
                
                var dt = _db.Query(sql);
                var list = new List<object>();
                
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        logId = row["Log_ID"],
                        regionId = row["Region_ID"],
                        threatName = row["Threat_Name"]?.ToString(),
                        threatCategory = row["Threat_Category"]?.ToString(),
                        severityLevel = row["Severity_Level"]?.ToString(),
                        assessmentDate = row["Assessment_Date"],
                        adminId = row["Admin_ID"] == DBNull.Value ? null : row["Admin_ID"],
                        resolutionStatus = row["Resolution_Status"]?.ToString(),
                        regionName = row["Region_Name"]?.ToString(),
                        reporterName = row["Full_Name"]?.ToString() ?? "Unknown Admin"
                    });
                }
                
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        public IActionResult CreateThreatLog([FromBody] ThreatCreateDto dto)
        {
            try
            {
                int adminId = 1; // Fallback dummy ID

                var sql = @"INSERT INTO Threat_Logs (Region_ID, Threat_Name, Threat_Category, Severity_Level, Assessment_Date, Admin_ID, Resolution_Status)
                            VALUES (:regId, :threatName, :category, :severity, :assessDate, :adminId, :status)";
                
                var parms = new Dictionary<string, object>
                {
                    { "regId", dto.RegionId },
                    { "threatName", dto.ThreatName },
                    { "category", string.IsNullOrEmpty(dto.ThreatCategory) ? (object)DBNull.Value : dto.ThreatCategory },
                    { "severity", dto.SeverityLevel },
                    { "assessDate", dto.AssessmentDate },
                    { "adminId", adminId },
                    { "status", dto.ResolutionStatus }
                };

                _db.Execute(sql, parms);

                return Ok(new { message = "Threat report submitted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        public class StatusUpdateDto
        {
            public string ResolutionStatus { get; set; } = string.Empty;
        }

        [HttpPut("{id}/status")]
        public IActionResult UpdateThreatStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            try
            {
                var sql = @"UPDATE Threat_Logs 
                            SET Resolution_Status = :status 
                            WHERE Log_ID = :logId";
                
                var parms = new Dictionary<string, object>
                {
                    { "status", dto.ResolutionStatus },
                    { "logId", id }
                };

                _db.Execute(sql, parms);

                return Ok(new { message = "Status updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
