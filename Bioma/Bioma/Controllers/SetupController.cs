using Microsoft.AspNetCore.Mvc;
using Bioma.Services;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SetupController : ControllerBase
    {
        private readonly DatabaseService _db;
        private readonly IWebHostEnvironment _env;

        public SetupController(DatabaseService db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        [HttpGet("version")]
        public IActionResult GetVersion()
        {
            try
            {
                var dt = _db.Query("SELECT banner FROM v$version");
                var banner = dt.Rows.Count > 0 ? dt.Rows[0]["banner"]?.ToString() : "Unknown";
                return Ok(new { version = banner });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("seed")]
        public IActionResult Seed()
        {
            try
            {
                // Path to setup.sql
                string scriptPath = Path.Combine(_env.ContentRootPath, "setup.sql");
                if (!System.IO.File.Exists(scriptPath))
                {
                    return NotFound(new { status = "Error", message = $"setup.sql script was not found at {scriptPath}." });
                }

                string sqlScript = System.IO.File.ReadAllText(scriptPath);
                
                // Execute setup DDL, PL/SQL blocks, and inserts
                _db.ExecuteSetupScript(sqlScript);

                // Quick table count check to return in response
                var dt = _db.Query("SELECT table_name FROM user_tables");
                var tables = new List<string>();
                foreach (System.Data.DataRow row in dt.Rows)
                {
                    tables.Add(row["table_name"]?.ToString() ?? "");
                }

                return Ok(new 
                { 
                    status = "Success", 
                    message = "Database schema dropped, recreated, compiled, and seeded successfully!", 
                    tablesCount = tables.Count,
                    tables = tables 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new 
                { 
                    status = "Error", 
                    message = ex.Message, 
                    stackTrace = ex.StackTrace 
                });
            }
        }
    }
}
