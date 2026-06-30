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

        [HttpPost]
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
