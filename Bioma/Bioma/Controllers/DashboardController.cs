using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Bioma.Services;
using System.Data;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly DatabaseService _db;

        public DashboardController(DatabaseService db)
        {
            _db = db;
        }

        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            try
            {
                var speciesDt = _db.Query("SELECT COUNT(*) as TotalSpecies FROM Organisms WHERE Rank_Name = 'Species'");
                var endangeredDt = _db.Query("SELECT COUNT(*) as EndangeredCount FROM Organisms WHERE Conservation_Status IN ('EN', 'CR', 'EW')");
                var threatsDt = _db.Query("SELECT COUNT(*) as ActiveThreats FROM Threat_Logs WHERE Resolution_Status = 'Active'");
                var reservesDt = _db.Query("SELECT COUNT(*) as TotalReserves FROM Reserves");

                int totalSpecies = speciesDt.Rows.Count > 0 ? Convert.ToInt32(speciesDt.Rows[0]["TotalSpecies"]) : 0;
                int endangeredCount = endangeredDt.Rows.Count > 0 ? Convert.ToInt32(endangeredDt.Rows[0]["EndangeredCount"]) : 0;
                int activeThreats = threatsDt.Rows.Count > 0 ? Convert.ToInt32(threatsDt.Rows[0]["ActiveThreats"]) : 0;
                int totalReserves = reservesDt.Rows.Count > 0 ? Convert.ToInt32(reservesDt.Rows[0]["TotalReserves"]) : 0;

                return Ok(new
                {
                    totalSpecies,
                    endangeredCount,
                    activeThreats,
                    totalReserves
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("leaderboard")]
        public IActionResult GetLeaderboard()
        {
            try
            {
                var dt = _db.Query("SELECT * FROM (SELECT * FROM V_ExtinctionRisk) WHERE ROWNUM <= 10");
                var list = new List<object>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        organismId = row["Organism_ID"],
                        scientificName = row["Scientific_Name"]?.ToString(),
                        commonName = row["Common_Name"]?.ToString(),
                        conservationStatus = row["Conservation_Status"]?.ToString(),
                        globalPopulation = row["Global_Population"],
                        regionCount = row["Region_Count"]
                    });
                }
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("reserves")]
        public IActionResult GetReserves()
        {
            try
            {
                var dt = _db.Query("SELECT * FROM V_Reserve_Health");
                var list = new List<object>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        reserveId = row["Reserve_ID"],
                        reserveName = row["Reserve_Name"]?.ToString(),
                        regionName = row["Region_Name"]?.ToString(),
                        totalAreaSqKm = row["Total_Area_SqKm"],
                        annualBudgetUsd = row["Annual_Budget_USD"],
                        totalSightings = row["Total_Sightings"],
                        uniqueSpeciesSpotted = row["Unique_Species_Spotted"],
                        unhealthySightings = row["Unhealthy_Sightings"]
                    });
                }
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
