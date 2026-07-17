using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Bioma.Services;
using System.Data;
using Bioma.Models;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservesController : ControllerBase
    {
        private readonly DatabaseService _db;

        public ReservesController(DatabaseService db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult GetReserves()
        {
            try
            {
                var sql = @"
                    SELECT r.Reserve_ID, r.Reserve_Name, r.Region_ID, r.Total_Area_SqKm, 
                           r.Annual_Budget_USD, r.Established_Year, r.Reserve_Type,
                           reg.Region_Name
                    FROM Reserves r
                    JOIN Regions reg ON r.Region_ID = reg.Region_ID
                    ORDER BY r.Reserve_Name ASC";
                var dt = _db.Query(sql);
                
                var list = new List<object>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        reserveId = row["Reserve_ID"],
                        reserveName = row["Reserve_Name"]?.ToString(),
                        regionId = row["Region_ID"],
                        regionName = row["Region_Name"]?.ToString(),
                        totalAreaSqKm = row["Total_Area_SqKm"],
                        annualBudgetUsd = row["Annual_Budget_USD"],
                        establishedYear = row["Established_Year"],
                        reserveType = row["Reserve_Type"]?.ToString()
                    });
                }
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetReserve(int id)
        {
            try
            {
                var sql = @"
                    SELECT r.Reserve_ID, r.Reserve_Name, r.Region_ID, r.Total_Area_SqKm,
                           r.Annual_Budget_USD, r.Established_Year, r.Reserve_Type,
                           reg.Region_Name, reg.Country, reg.Biome_Name, reg.Climate_Zone,
                           reg.Area_SqKm AS RegionArea, reg.Is_Protected
                    FROM Reserves r
                    JOIN Regions reg ON r.Region_ID = reg.Region_ID
                    WHERE r.Reserve_ID = :id";
                var dt = _db.Query(sql, new Dictionary<string, object> { { ":id", id } });

                if (dt.Rows.Count == 0)
                    return NotFound(new { error = "Reserve not found." });

                var row = dt.Rows[0];

                // Get sighting stats
                var sightingSql = @"
                    SELECT COUNT(*) as TotalSightings,
                           COUNT(DISTINCT Organism_ID) as UniqueSpecies,
                           SUM(CASE WHEN Health_Status IN ('Injured','Malnourished','Dead') THEN 1 ELSE 0 END) as Unhealthy
                    FROM Sighting_Logs WHERE Reserve_ID = :id";
                var sightingDt = _db.Query(sightingSql, new Dictionary<string, object> { { ":id", id } });
                var sightings = sightingDt.Rows[0];

                // Get recent sightings
                var recentSql = @"
                    SELECT s.Sighting_ID, s.Sighting_Timestamp, s.Quantity_Observed, s.Health_Status, s.Observation_Notes,
                           o.Common_Name, o.Scientific_Name, o.Conservation_Status
                    FROM Sighting_Logs s
                    JOIN Organisms o ON s.Organism_ID = o.Organism_ID
                    WHERE s.Reserve_ID = :id
                    ORDER BY s.Sighting_Timestamp DESC";
                var recentDt = _db.Query(recentSql, new Dictionary<string, object> { { ":id", id } });
                var recentSightings = new List<object>();
                foreach (DataRow sr in recentDt.Rows)
                {
                    recentSightings.Add(new
                    {
                        sightingId = sr["Sighting_ID"],
                        timestamp = sr["Sighting_Timestamp"],
                        quantity = sr["Quantity_Observed"],
                        healthStatus = sr["Health_Status"]?.ToString(),
                        notes = sr["Observation_Notes"]?.ToString(),
                        speciesName = sr["Common_Name"]?.ToString(),
                        scientificName = sr["Scientific_Name"]?.ToString(),
                        conservationStatus = sr["Conservation_Status"]?.ToString()
                    });
                }

                return Ok(new
                {
                    reserveId = row["Reserve_ID"],
                    reserveName = row["Reserve_Name"]?.ToString(),
                    regionId = row["Region_ID"],
                    regionName = row["Region_Name"]?.ToString(),
                    country = row["Country"]?.ToString(),
                    biomeName = row["Biome_Name"]?.ToString(),
                    climateZone = row["Climate_Zone"]?.ToString(),
                    totalAreaSqKm = row["Total_Area_SqKm"],
                    annualBudgetUsd = row["Annual_Budget_USD"],
                    establishedYear = row["Established_Year"],
                    reserveType = row["Reserve_Type"]?.ToString(),
                    regionArea = row["RegionArea"],
                    isProtected = row["Is_Protected"]?.ToString(),
                    stats = new
                    {
                        totalSightings = sightings["TotalSightings"],
                        uniqueSpecies = sightings["UniqueSpecies"],
                        unhealthySightings = sightings["Unhealthy"]
                    },
                    recentSightings
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize]
        public IActionResult CreateReserve([FromBody] ReserveDto dto)
        {
            try
            {
                var sql = @"INSERT INTO Reserves (Reserve_Name, Region_ID, Total_Area_SqKm, Annual_Budget_USD, Established_Year, Reserve_Type)
                            VALUES (:name, :reg, :area, :budget, :year, :type)";
                
                var parms = new Dictionary<string, object>
                {
                    { "name", dto.ReserveName },
                    { "reg", dto.RegionId! },
                    { "area", dto.TotalAreaSqKm ?? (object)DBNull.Value },
                    { "budget", dto.AnnualBudgetUsd ?? (object)DBNull.Value },
                    { "year", dto.EstablishedYear ?? (object)DBNull.Value },
                    { "type", dto.ReserveType ?? (object)DBNull.Value }
                };

                _db.Execute(sql, parms);
                return Ok(new { message = "Reserve created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public IActionResult UpdateReserve(int id, [FromBody] ReserveDto dto)
        {
            try
            {
                var sql = @"UPDATE Reserves 
                            SET Reserve_Name = :name, Region_ID = :reg, Total_Area_SqKm = :area, 
                                Annual_Budget_USD = :budget, Established_Year = :year, Reserve_Type = :type
                            WHERE Reserve_ID = :id";
                
                var parms = new Dictionary<string, object>
                {
                    { "name", dto.ReserveName },
                    { "reg", dto.RegionId! },
                    { "area", dto.TotalAreaSqKm ?? (object)DBNull.Value },
                    { "budget", dto.AnnualBudgetUsd ?? (object)DBNull.Value },
                    { "year", dto.EstablishedYear ?? (object)DBNull.Value },
                    { "type", dto.ReserveType ?? (object)DBNull.Value },
                    { "id", id }
                };

                _db.Execute(sql, parms);
                return Ok(new { message = "Reserve updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public IActionResult DeleteReserve(int id)
        {
            try
            {
                _db.Execute("DELETE FROM Reserves WHERE Reserve_ID = :id", new Dictionary<string, object> { { "id", id } });
                return Ok(new { message = "Reserve deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
