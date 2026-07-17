using Microsoft.AspNetCore.Mvc;
using Bioma.Services;
using System.Data;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegionsController : ControllerBase
    {
        private readonly DatabaseService _db;

        public RegionsController(DatabaseService db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult GetRegions()
        {
            try
            {
                var sql = @"
                    SELECT r.Region_ID, r.Region_Name, r.Country, r.Biome_Name, 
                           r.Climate_Zone, r.Area_SqKm, r.Is_Protected
                    FROM Regions r
                    ORDER BY r.Region_Name ASC";
                var dt = _db.Query(sql);

                var list = new List<object>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        regionId = Convert.ToInt32(row["Region_ID"]),
                        regionName = row["Region_Name"]?.ToString(),
                        country = row["Country"]?.ToString(),
                        biomeName = row["Biome_Name"]?.ToString(),
                        climateZone = row["Climate_Zone"]?.ToString(),
                        areaSqKm = row["Area_SqKm"] == DBNull.Value ? (double?)null : Convert.ToDouble(row["Area_SqKm"]),
                        isProtected = row["Is_Protected"]?.ToString()
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
        public IActionResult GetRegion(int id)
        {
            try
            {
                // 1. Region details
                var regionSql = @"
                    SELECT Region_ID, Region_Name, Country, Biome_Name, Climate_Zone, Area_SqKm, Is_Protected
                    FROM Regions WHERE Region_ID = :id";
                var regionDt = _db.Query(regionSql, new Dictionary<string, object> { { ":id", id } });

                if (regionDt.Rows.Count == 0)
                    return NotFound(new { error = "Region not found." });

                var row = regionDt.Rows[0];

                // 2. Species in this region
                var speciesSql = @"
                    SELECT o.Organism_ID, o.Scientific_Name, o.Common_Name, o.Conservation_Status,
                           sd.Estimated_Population, sd.Population_Trend, sd.Last_Survey_Date,
                           se.Image_URL
                    FROM Species_Distribution sd
                    JOIN Organisms o ON sd.Organism_ID = o.Organism_ID
                    LEFT JOIN Species_Encyclopedia se ON o.Organism_ID = se.Organism_ID
                    WHERE sd.Region_ID = :id
                    ORDER BY o.Common_Name ASC";
                var speciesDt = _db.Query(speciesSql, new Dictionary<string, object> { { ":id", id } });
                var species = new List<object>();
                foreach (DataRow sr in speciesDt.Rows)
                {
                    species.Add(new
                    {
                        organismId = Convert.ToInt32(sr["Organism_ID"]),
                        scientificName = sr["Scientific_Name"]?.ToString(),
                        commonName = sr["Common_Name"]?.ToString(),
                        conservationStatus = sr["Conservation_Status"]?.ToString(),
                        estimatedPopulation = sr["Estimated_Population"] == DBNull.Value ? (int?)null : Convert.ToInt32(sr["Estimated_Population"]),
                        populationTrend = sr["Population_Trend"]?.ToString(),
                        lastSurveyDate = sr["Last_Survey_Date"] == DBNull.Value ? null : Convert.ToDateTime(sr["Last_Survey_Date"]).ToString("yyyy-MM-dd"),
                        imageUrl = sr["Image_URL"]?.ToString()
                    });
                }

                // 3. Reserves in this region
                var reservesSql = @"
                    SELECT Reserve_ID, Reserve_Name, Total_Area_SqKm, Annual_Budget_USD, Established_Year, Reserve_Type
                    FROM Reserves WHERE Region_ID = :id
                    ORDER BY Reserve_Name ASC";
                var reservesDt = _db.Query(reservesSql, new Dictionary<string, object> { { ":id", id } });
                var reserves = new List<object>();
                foreach (DataRow rr in reservesDt.Rows)
                {
                    reserves.Add(new
                    {
                        reserveId = Convert.ToInt32(rr["Reserve_ID"]),
                        reserveName = rr["Reserve_Name"]?.ToString(),
                        totalAreaSqKm = rr["Total_Area_SqKm"] == DBNull.Value ? (double?)null : Convert.ToDouble(rr["Total_Area_SqKm"]),
                        annualBudgetUsd = rr["Annual_Budget_USD"] == DBNull.Value ? (double?)null : Convert.ToDouble(rr["Annual_Budget_USD"]),
                        establishedYear = rr["Established_Year"] == DBNull.Value ? (int?)null : Convert.ToInt32(rr["Established_Year"]),
                        reserveType = rr["Reserve_Type"]?.ToString()
                    });
                }

                // 4. Threat logs in this region
                var threatsSql = @"
                    SELECT Threat_Name, Threat_Category, Severity_Level, Assessment_Date, Resolution_Status
                    FROM Threat_Logs WHERE Region_ID = :id
                    ORDER BY Assessment_Date DESC";
                var threatsDt = _db.Query(threatsSql, new Dictionary<string, object> { { ":id", id } });
                var threats = new List<object>();
                foreach (DataRow tr in threatsDt.Rows)
                {
                    threats.Add(new
                    {
                        threatName = tr["Threat_Name"]?.ToString(),
                        threatCategory = tr["Threat_Category"]?.ToString(),
                        severityLevel = tr["Severity_Level"]?.ToString(),
                        assessmentDate = tr["Assessment_Date"] == DBNull.Value ? null : Convert.ToDateTime(tr["Assessment_Date"]).ToString("yyyy-MM-dd"),
                        resolutionStatus = tr["Resolution_Status"]?.ToString()
                    });
                }

                // 5. Sighting stats for this region
                var statsSql = @"
                    SELECT COUNT(*) as TotalSightings,
                           COUNT(DISTINCT s.Organism_ID) as UniqueSpecies,
                           SUM(CASE WHEN s.Health_Status IN ('Injured','Malnourished','Dead') THEN 1 ELSE 0 END) as Unhealthy
                    FROM Sighting_Logs s
                    JOIN Reserves r ON s.Reserve_ID = r.Reserve_ID
                    WHERE r.Region_ID = :id";
                var statsDt = _db.Query(statsSql, new Dictionary<string, object> { { ":id", id } });
                var stats = statsDt.Rows[0];

                return Ok(new
                {
                    regionId = Convert.ToInt32(row["Region_ID"]),
                    regionName = row["Region_Name"]?.ToString(),
                    country = row["Country"]?.ToString(),
                    biomeName = row["Biome_Name"]?.ToString(),
                    climateZone = row["Climate_Zone"]?.ToString(),
                    areaSqKm = row["Area_SqKm"] == DBNull.Value ? (double?)null : Convert.ToDouble(row["Area_SqKm"]),
                    isProtected = row["Is_Protected"]?.ToString(),
                    species,
                    reserves,
                    threats,
                    stats = new
                    {
                        totalSightings = stats["TotalSightings"],
                        uniqueSpecies = stats["UniqueSpecies"],
                        unhealthySightings = stats["Unhealthy"]
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
