using Microsoft.AspNetCore.Mvc;
using Bioma.Services;
using System.Data;
using Oracle.ManagedDataAccess.Client;
using Bioma.Models;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SightingsController : ControllerBase
    {
        private readonly DatabaseService _db;

        public SightingsController(DatabaseService db)
        {
            _db = db;
        }

        [HttpGet("lookups")]
        public IActionResult GetLookups()
        {
            try
            {
                var speciesDt = _db.Query("SELECT Organism_ID, Scientific_Name, Common_Name FROM Organisms WHERE Rank_Name = 'Species' ORDER BY Scientific_Name ASC");
                var speciesList = new List<object>();
                foreach (DataRow row in speciesDt.Rows)
                {
                    speciesList.Add(new
                    {
                        organismId = row["Organism_ID"],
                        scientificName = row["Scientific_Name"]?.ToString(),
                        commonName = row["Common_Name"]?.ToString()
                    });
                }

                var reservesDt = _db.Query("SELECT Reserve_ID, Reserve_Name FROM Reserves ORDER BY Reserve_Name ASC");
                var reservesList = new List<object>();
                foreach (DataRow row in reservesDt.Rows)
                {
                    reservesList.Add(new
                    {
                        reserveId = row["Reserve_ID"],
                        reserveName = row["Reserve_Name"]?.ToString()
                    });
                }

                return Ok(new { species = speciesList, reserves = reservesList });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet]
        public IActionResult GetSightings()
        {
            try
            {
                var sql = @"
                    SELECT sl.Sighting_ID, sl.Organism_ID, sl.Reserve_ID, sl.Admin_ID, 
                           sl.Sighting_Timestamp, sl.Quantity_Observed, sl.Health_Status, sl.Observation_Notes,
                           o.Common_Name, o.Scientific_Name, cr.Reserve_Name, u.Full_Name
                    FROM Sighting_Logs sl
                    JOIN Organisms o ON sl.Organism_ID = o.Organism_ID
                    JOIN Reserves cr ON sl.Reserve_ID = cr.Reserve_ID
                    LEFT JOIN Admins u ON sl.Admin_ID = u.Admin_ID
                    ORDER BY sl.Sighting_Timestamp DESC";
                
                var dt = _db.Query(sql);
                var list = new List<object>();
                
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        sightingId = row["Sighting_ID"],
                        organismId = row["Organism_ID"],
                        reserveId = row["Reserve_ID"],
                        adminId = row["Admin_ID"] == DBNull.Value ? null : row["Admin_ID"],
                        timestamp = row["Sighting_Timestamp"],
                        quantityObserved = row["Quantity_Observed"],
                        healthStatus = row["Health_Status"]?.ToString(),
                        observationNotes = row["Observation_Notes"]?.ToString(),
                        speciesName = row["Common_Name"]?.ToString() ?? row["Scientific_Name"]?.ToString(),
                        reserveName = row["Reserve_Name"]?.ToString(),
                        observerName = row["Full_Name"]?.ToString() ?? "Unknown Admin"
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
        public IActionResult CreateSighting([FromBody] SightingCreateDto dto)
        {
            try
            {
                // In a real app we'd get Admin_ID from JWT token, for now we will assume the frontend sends it or we default to 1
                int adminId = 1;

                var sql = @"INSERT INTO Sighting_Logs (Organism_ID, Reserve_ID, Admin_ID, Quantity_Observed, Health_Status, Observation_Notes)
                            VALUES (:orgId, :resId, :adminId, :qty, :health, :notes)";
                
                var parms = new Dictionary<string, object>
                {
                    { "orgId", dto.OrganismId },
                    { "resId", dto.ReserveId },
                    { "adminId", adminId },
                    { "qty", dto.QuantityObserved },
                    { "health", string.IsNullOrEmpty(dto.HealthStatus) ? (object)DBNull.Value : dto.HealthStatus },
                    { "notes", string.IsNullOrEmpty(dto.ObservationNotes) ? (object)DBNull.Value : dto.ObservationNotes }
                };

                _db.Execute(sql, parms);

                return Ok(new { message = "Sighting logged successfully" });
            }
            catch (OracleException oex)
            {
                var msg = oex.Message;
                if (msg.Contains("ORA-20001") || msg.Contains("ORA-20002"))
                {
                    var lines = msg.Split('\n');
                    var primaryMessage = lines.FirstOrDefault(l => l.Contains("ORA-20")) ?? msg;
                    var cleanMessage = primaryMessage.Substring(primaryMessage.IndexOf(':') + 1).Trim();
                    return BadRequest(new { error = cleanMessage });
                }
                return StatusCode(500, new { error = oex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
