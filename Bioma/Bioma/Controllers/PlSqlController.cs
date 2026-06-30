using Microsoft.AspNetCore.Mvc;
using Bioma.Services;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlSqlController : ControllerBase
    {
        private readonly DatabaseService _db;

        public PlSqlController(DatabaseService db)
        {
            _db = db;
        }

        public class ReportDto
        {
            public int RegionId { get; set; }
        }

        [HttpPost("report")]
        public IActionResult RunCriticalSpeciesReport([FromBody] ReportDto dto)
        {
            try
            {
                string output = _db.CallProcedureWithOutput("PRC_CriticalSpecies_Report", new Dictionary<string, object> { { "p_Region_ID", dto.RegionId } });
                return Ok(new { output });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        public class GrantDto
        {
            public decimal Amount { get; set; }
        }

        [HttpPost("grant")]
        public IActionResult RunAllocateGrant([FromBody] GrantDto dto)
        {
            try
            {
                string output = _db.CallProcedureWithOutput("PRC_AllocateGrant", new Dictionary<string, object> { { "p_TotalAmount", dto.Amount } });
                return Ok(new { output });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
