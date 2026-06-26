using Microsoft.AspNetCore.Mvc;
using Bioma.Services;
using Bioma.Models;
using System.Data;
using System.Security.Cryptography;
using System.Text;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DatabaseService _db;

        public AuthController(DatabaseService db)
        {
            _db = db;
        }

        /// <summary>
        /// GET /api/auth/users
        /// Lists all active system users for the User Switcher dropdown.
        /// </summary>
        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            try
            {
                var dt = _db.Query(@"
                    SELECT User_ID, Username, First_Name, Last_Name, Email, 
                           Role_Name, Affiliation, Created_At
                    FROM System_Users
                    ORDER BY User_ID");

                var users = new List<UserDto>();
                foreach (DataRow row in dt.Rows)
                {
                    users.Add(MapUserDto(row));
                }

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/auth/users/{id}
        /// Gets a single user by ID.
        /// </summary>
        [HttpGet("users/{id}")]
        public IActionResult GetUserById(int id)
        {
            try
            {
                var dt = _db.Query(@"
                    SELECT User_ID, Username, First_Name, Last_Name, Email, 
                           Role_Name, Affiliation, Created_At
                    FROM System_Users
                    WHERE User_ID = :userId",
                    new Dictionary<string, object> { { ":userId", id } });

                if (dt.Rows.Count == 0)
                    return NotFound(new { error = "User not found." });

                return Ok(MapUserDto(dt.Rows[0]));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/auth/login
        /// Validates credentials and returns the user profile if matched.
        /// Uses SHA-256 hash comparison (compatible with Oracle 11g demo usage).
        /// </summary>
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
                    return BadRequest(new { error = "Username and password are required." });

                var dt = _db.Query(@"
                    SELECT User_ID, Username, Password_Hash, First_Name, Last_Name, Email, 
                           Role_Name, Affiliation, Created_At
                    FROM System_Users
                    WHERE Username = :username",
                    new Dictionary<string, object> { { ":username", dto.Username } });

                if (dt.Rows.Count == 0)
                    return Unauthorized(new { error = "Invalid username or password." });

                var row = dt.Rows[0];
                var storedHash = row["Password_Hash"]?.ToString() ?? "";
                var inputHash = HashPassword(dto.Password);

                if (storedHash != inputHash)
                    return Unauthorized(new { error = "Invalid username or password." });

                return Ok(MapUserDto(row));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/auth/register
        /// Creates a new system user with SHA-256 hashed password.
        /// Validates uniqueness of username and email via DB constraints.
        /// </summary>
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
                    return BadRequest(new { error = "Username and password are required." });

                if (string.IsNullOrWhiteSpace(dto.Email))
                    return BadRequest(new { error = "Email is required." });

                if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
                    return BadRequest(new { error = "First name and last name are required." });

                var validRoles = new[] { "Field Researcher", "Sanctuary Admin", "Global Admin" };
                if (!validRoles.Contains(dto.RoleName))
                    return BadRequest(new { error = $"Invalid role. Must be one of: {string.Join(", ", validRoles)}" });

                var hash = HashPassword(dto.Password);

                _db.Execute(@"
                    INSERT INTO System_Users (Username, Password_Hash, First_Name, Last_Name, Email, Role_Name, Affiliation)
                    VALUES (:username, :passwordHash, :firstName, :lastName, :email, :roleName, :affiliation)",
                    new Dictionary<string, object>
                    {
                        { ":username", dto.Username },
                        { ":passwordHash", hash },
                        { ":firstName", dto.FirstName },
                        { ":lastName", dto.LastName },
                        { ":email", dto.Email },
                        { ":roleName", dto.RoleName },
                        { ":affiliation", dto.Affiliation ?? (object)DBNull.Value }
                    });

                // Fetch the newly created user
                var dt = _db.Query(@"
                    SELECT User_ID, Username, First_Name, Last_Name, Email,
                           Role_Name, Affiliation, Created_At
                    FROM System_Users
                    WHERE Username = :username",
                    new Dictionary<string, object> { { ":username", dto.Username } });

                if (dt.Rows.Count == 0)
                    return StatusCode(500, new { error = "User created but could not retrieve record." });

                return Ok(new
                {
                    status = "Success",
                    message = $"User '{dto.Username}' registered successfully.",
                    user = MapUserDto(dt.Rows[0])
                });
            }
            catch (Exception ex)
            {
                // Check for unique constraint violations
                if (ex.Message.Contains("ORA-00001"))
                {
                    if (ex.Message.Contains("USERNAME"))
                        return Conflict(new { error = "Username already exists." });
                    if (ex.Message.Contains("EMAIL"))
                        return Conflict(new { error = "Email already registered." });
                    return Conflict(new { error = "A unique constraint was violated. Username or email may already exist." });
                }
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// PUT /api/auth/users/{id}/role
        /// Updates a user's role (Global Admin only operation).
        /// </summary>
        [HttpPut("users/{id}/role")]
        public IActionResult UpdateUserRole(int id, [FromBody] Dictionary<string, string> body)
        {
            try
            {
                if (!body.ContainsKey("roleName"))
                    return BadRequest(new { error = "roleName is required." });

                var newRole = body["roleName"];
                var validRoles = new[] { "Field Researcher", "Sanctuary Admin", "Global Admin" };
                if (!validRoles.Contains(newRole))
                    return BadRequest(new { error = $"Invalid role. Must be one of: {string.Join(", ", validRoles)}" });

                var rows = _db.Execute(@"
                    UPDATE System_Users SET Role_Name = :roleName WHERE User_ID = :userId",
                    new Dictionary<string, object>
                    {
                        { ":roleName", newRole },
                        { ":userId", id }
                    });

                if (rows == 0)
                    return NotFound(new { error = "User not found." });

                return Ok(new { status = "Success", message = $"User role updated to '{newRole}'." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ──────────────────────────────────────────────
        // Private Helpers
        // ──────────────────────────────────────────────

        /// <summary>
        /// SHA-256 hashing for password storage.
        /// Compatible with Oracle 11g demo environments.
        /// </summary>
        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        /// <summary>
        /// Maps a DataRow from System_Users to a UserDto.
        /// </summary>
        private static UserDto MapUserDto(DataRow row)
        {
            return new UserDto
            {
                UserId = Convert.ToInt32(row["User_ID"]),
                Username = row["Username"]?.ToString() ?? "",
                FirstName = row["First_Name"]?.ToString() ?? "",
                LastName = row["Last_Name"]?.ToString() ?? "",
                Email = row["Email"]?.ToString() ?? "",
                RoleName = row["Role_Name"]?.ToString() ?? "",
                Affiliation = row["Affiliation"] == DBNull.Value ? null : row["Affiliation"]?.ToString(),
                CreatedAt = row["Created_At"] == DBNull.Value ? null : Convert.ToDateTime(row["Created_At"])
            };
        }
    }
}
