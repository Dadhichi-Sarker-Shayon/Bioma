using Microsoft.AspNetCore.Mvc;
using Bioma.Services;
using System.Data;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
                var speciesDt = _db.Query("SELECT COUNT(*) as TotalSpecies FROM Organisms WHERE Rank_ID = 7");
                var endangeredDt = _db.Query("SELECT COUNT(*) as EndangeredCount FROM Species_Profiles sp JOIN Conservation_Statuses cs ON sp.Status_Code = cs.Status_Code WHERE cs.Status_Code IN ('EN', 'CR', 'EW')");
                var threatsDt = _db.Query("SELECT COUNT(*) as ActiveThreats FROM Regional_Threat_Logs WHERE Resolution_Status = 'Active'");
                var reservesDt = _db.Query("SELECT COUNT(*) as TotalReserves FROM Conservation_Reserves");

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
                // Fetch top 10 most at-risk species
                var dt = _db.Query("SELECT * FROM V_ExtinctionRisk_Leaderboard FETCH NEXT 10 ROWS ONLY");
                var list = new List<object>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        organismId = row["Organism_ID"],
                        commonName = row["Common_Name"]?.ToString(),
                        scientificName = row["Scientific_Name"]?.ToString(),
                        kingdomType = row["Kingdom_Type"]?.ToString(),
                        statusCode = row["Status_Code"]?.ToString(),
                        statusName = row["Status_Name"]?.ToString(),
                        riskLevel = row["Risk_Level"],
                        globalPopulation = row["Global_Population"],
                        maxThreatScore = row["Max_Threat_Score"],
                        riskScore = row["Risk_Score"]
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
                // Fetch all reserve health analytics
                var dt = _db.Query("SELECT * FROM V_Reserve_HealthAnalytics");
                var list = new List<object>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        reserveId = row["Reserve_ID"],
                        reserveName = row["Reserve_Name"]?.ToString(),
                        reserveType = row["Reserve_Type"]?.ToString(),
                        regionName = row["Region_Name"]?.ToString(),
                        country = row["Country"]?.ToString(),
                        totalAreaSqKm = row["Total_Area_SqKm"],
                        annualBudgetUsd = row["Annual_Budget_USD"],
                        totalSightings = row["Total_Sightings"],
                        distinctSpeciesObserved = row["Distinct_Species_Observed"],
                        healthyCount = row["Healthy_Count"],
                        injuredCount = row["Injured_Count"],
                        malnourishedCount = row["Malnourished_Count"],
                        budgetPerSqKm = row["Budget_Per_SqKm"]
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
