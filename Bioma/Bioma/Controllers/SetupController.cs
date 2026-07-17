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

        [HttpPost("assign-tags")]
        public IActionResult AssignTags()
        {
            try
            {
                string scriptPath = Path.Combine(_env.ContentRootPath, "assign_tags.sql");
                if (!System.IO.File.Exists(scriptPath))
                    return NotFound(new { error = "assign_tags.sql not found" });

                string sql = System.IO.File.ReadAllText(scriptPath);
                _db.ExecuteLargeScript(sql);

                var dt = _db.Query("SELECT COUNT(*) as cnt FROM Organism_Tags");
                int total = Convert.ToInt32(dt.Rows[0]["cnt"]);

                var dt2 = _db.Query("SELECT COUNT(DISTINCT Organism_ID) as cnt FROM Organism_Tags");
                int speciesWithTags = Convert.ToInt32(dt2.Rows[0]["cnt"]);

                return Ok(new { message = "Tags assigned", totalAssignments = total, speciesWithTags });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("update-images")]
        public IActionResult UpdateImages()
        {
            try
            {
                string scriptPath = Path.Combine(_env.ContentRootPath, "update_images.sql");
                if (!System.IO.File.Exists(scriptPath))
                    return NotFound(new { error = "update_images.sql not found" });

                string sql = System.IO.File.ReadAllText(scriptPath);
                _db.ExecuteLargeScript(sql);

                var dt = _db.Query("SELECT COUNT(*) as cnt FROM Species_Encyclopedia WHERE Image_URL LIKE '%unsplash%'");
                int updated = Convert.ToInt32(dt.Rows[0]["cnt"]);

                return Ok(new { message = "Images updated", unsplashCount = updated });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("populate")]
        public IActionResult Populate()
        {
            try
            {
                var results = new List<string>();

                string populatePath = Path.Combine(_env.ContentRootPath, "populate.sql");
                string additionalPath = Path.Combine(_env.ContentRootPath, "populate_additional.sql");

                if (System.IO.File.Exists(populatePath))
                {
                    string sql = System.IO.File.ReadAllText(populatePath);
                    sql = System.Text.RegularExpressions.Regex.Replace(sql, @"SET\s+DEFINE\s+OFF\s*;", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                    var (exec, skip, err) = _db.ExecuteLargeScript(sql);
                    results.Add($"populate.sql: {exec} executed, {skip} skipped" + (string.IsNullOrEmpty(err) ? "" : $" (last err: {err})"));
                }

                if (System.IO.File.Exists(additionalPath))
                {
                    string sql = System.IO.File.ReadAllText(additionalPath);
                    sql = System.Text.RegularExpressions.Regex.Replace(sql, @"SET\s+DEFINE\s+OFF\s*;", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                    var (exec, skip, err) = _db.ExecuteLargeScript(sql);
                    results.Add($"populate_additional.sql: {exec} executed, {skip} skipped" + (string.IsNullOrEmpty(err) ? "" : $" (last err: {err})"));
                }

                // Count rows in key tables
                var speciesCount = _db.Query("SELECT COUNT(*) as cnt FROM Organisms WHERE Rank_Name = 'Species'");
                var regionCount = _db.Query("SELECT COUNT(*) as cnt FROM Regions");
                var reserveCount = _db.Query("SELECT COUNT(*) as cnt FROM Reserves");
                var tagCount = _db.Query("SELECT COUNT(*) as cnt FROM Tags");
                var distCount = _db.Query("SELECT COUNT(*) as cnt FROM Species_Distribution");

                return Ok(new
                {
                    status = "Success",
                    message = "Data populated successfully!",
                    steps = results,
                    counts = new
                    {
                        species = speciesCount.Rows[0]["cnt"],
                        regions = regionCount.Rows[0]["cnt"],
                        reserves = reserveCount.Rows[0]["cnt"],
                        tags = tagCount.Rows[0]["cnt"],
                        distributions = distCount.Rows[0]["cnt"]
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "Error",
                    message = ex.Message
                });
            }
        }
    }
}
