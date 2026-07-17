using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Bioma.Services;
using System.Data;
using Bioma.Models;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TagsController : ControllerBase
    {
        private readonly DatabaseService _db;

        public TagsController(DatabaseService db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult GetTags()
        {
            try
            {
                var dt = _db.Query("SELECT * FROM Tags ORDER BY Tag_Category ASC, Tag_Name ASC");
                var list = new List<object>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new
                    {
                        tagId = row["Tag_ID"],
                        tagName = row["Tag_Name"]?.ToString(),
                        tagCategory = row["Tag_Category"]?.ToString(),
                        tagColor = row["Tag_Color"]?.ToString()
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
        public IActionResult CreateTag([FromBody] TagDto dto)
        {
            try
            {
                var sql = "INSERT INTO Tags (Tag_Name, Tag_Category, Tag_Color) VALUES (:name, :cat, :color)";
                _db.Execute(sql, new Dictionary<string, object> {
                    { "name", dto.TagName },
                    { "cat", dto.TagCategory ?? (object)DBNull.Value },
                    { "color", dto.TagColor ?? (object)DBNull.Value }
                });
                return Ok(new { message = "Tag created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteTag(int id)
        {
            try
            {
                _db.Execute("DELETE FROM Tags WHERE Tag_ID = :id", new Dictionary<string, object> { { "id", id } });
                return Ok(new { message = "Tag deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // --- Organism Tag Assignment ---

        [HttpGet("organism/{organismId}")]
        public IActionResult GetOrganismTags(int organismId)
        {
            try
            {
                var dt = _db.Query("SELECT Tag_ID FROM Organism_Tags WHERE Organism_ID = :id", new Dictionary<string, object> { { "id", organismId } });
                var list = new List<int>();
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(Convert.ToInt32(row["Tag_ID"]));
                }
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        public class AssignTagsDto
        {
            public List<int> TagIds { get; set; } = new();
        }

        [HttpPost("organism/{organismId}")]
        public IActionResult AssignOrganismTags(int organismId, [FromBody] AssignTagsDto dto)
        {
            try
            {
                // Simple wipe and replace approach
                _db.Execute("DELETE FROM Organism_Tags WHERE Organism_ID = :id", new Dictionary<string, object> { { "id", organismId } });

                foreach (var tagId in dto.TagIds)
                {
                    _db.Execute("INSERT INTO Organism_Tags (Organism_ID, Tag_ID) VALUES (:oid, :tid)", new Dictionary<string, object> {
                        { "oid", organismId },
                        { "tid", tagId }
                    });
                }
                
                return Ok(new { message = "Tags updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
