using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bioma.Services;
using Bioma.Models;
using System.Data;
using System.Security.Cryptography;

namespace Bioma.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DatabaseService _db;
        private readonly IConfiguration _config;

        public AuthController(DatabaseService db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        [HttpGet("users")]
        public IActionResult GetAdmins()
        {
            try
            {
                var dt = _db.Query(@"
                    SELECT Admin_ID, Username, Full_Name, Email, Created_At
                    FROM Admins
                    ORDER BY Admin_ID");

                var admins = new List<AdminDto>();
                foreach (DataRow row in dt.Rows)
                {
                    admins.Add(MapAdminDto(row));
                }

                return Ok(admins);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("users/{id}")]
        public IActionResult GetAdminById(int id)
        {
            try
            {
                var dt = _db.Query(@"
                    SELECT Admin_ID, Username, Full_Name, Email, Created_At
                    FROM Admins
                    WHERE Admin_ID = :adminId",
                    new Dictionary<string, object> { { ":adminId", id } });

                if (dt.Rows.Count == 0)
                    return NotFound(new { error = "Admin not found." });

                return Ok(MapAdminDto(dt.Rows[0]));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
                    return BadRequest(new { error = "Username and password are required." });

                var dt = _db.Query(@"
                    SELECT Admin_ID, Username, Password_Hash, Full_Name, Email, Created_At
                    FROM Admins
                    WHERE Username = :username",
                    new Dictionary<string, object> { { ":username", dto.Username } });

                if (dt.Rows.Count == 0)
                    return Unauthorized(new { error = "Invalid username or password." });

                var row = dt.Rows[0];
                var storedHash = row["Password_Hash"]?.ToString() ?? "";

                var inputHash = HashPassword(dto.Password);
                bool isMatch = storedHash == inputHash;

                if (!isMatch)
                    return Unauthorized(new { error = "Invalid username or password." });

                var adminDto = MapAdminDto(row);
                var token = GenerateJwtToken(adminDto);

                return Ok(new { token, admin = adminDto });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("users")]
        public IActionResult CreateAdmin([FromBody] AdminCreateDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
                    return BadRequest(new { error = "Username and password are required." });

                var passwordHash = HashPassword(dto.Password);

                _db.Execute(@"
                    INSERT INTO Admins (Username, Password_Hash, Full_Name, Email, Created_At)
                    VALUES (:username, :passwordHash, :fullName, :email, SYSDATE)",
                    new Dictionary<string, object>
                    {
                        { ":username", dto.Username },
                        { ":passwordHash", passwordHash },
                        { ":fullName", dto.FullName ?? (object)DBNull.Value },
                        { ":email", dto.Email ?? (object)DBNull.Value }
                    });

                return Ok(new { message = "User created successfully." });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("ORA-00001") || ex.Message.Contains("unique constraint"))
                    return Conflict(new { error = "Username or email already exists." });
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("users/{id}")]
        public IActionResult UpdateAdmin(int id, [FromBody] AdminUpdateDto dto)
        {
            try
            {
                var dt = _db.Query("SELECT Admin_ID FROM Admins WHERE Admin_ID = :adminId",
                    new Dictionary<string, object> { { ":adminId", id } });

                if (dt.Rows.Count == 0)
                    return NotFound(new { error = "Admin not found." });

                var updates = new List<string>();
                var parameters = new Dictionary<string, object> { { ":adminId", id } };

                if (dto.FullName != null)
                {
                    updates.Add("Full_Name = :fullName");
                    parameters.Add(":fullName", dto.FullName);
                }

                if (dto.Email != null)
                {
                    updates.Add("Email = :email");
                    parameters.Add(":email", dto.Email);
                }

                if (!string.IsNullOrWhiteSpace(dto.Password))
                {
                    updates.Add("Password_Hash = :passwordHash");
                    parameters.Add(":passwordHash", HashPassword(dto.Password));
                }

                if (updates.Count == 0)
                    return BadRequest(new { error = "No fields provided to update." });

                var sql = $"UPDATE Admins SET {string.Join(", ", updates)} WHERE Admin_ID = :adminId";
                _db.Execute(sql, parameters);

                return Ok(new { message = "User updated successfully." });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("ORA-00001") || ex.Message.Contains("unique constraint"))
                    return Conflict(new { error = "Email already in use." });
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("users/{id}")]
        public IActionResult DeleteAdmin(int id)
        {
            try
            {
                var countDt = _db.Query("SELECT COUNT(*) as AdminCount FROM Admins");
                int adminCount = Convert.ToInt32(countDt.Rows[0]["AdminCount"]);
                if (adminCount <= 1)
                {
                    return BadRequest(new { error = "Cannot delete the last administrator." });
                }

                var dt = _db.Query("SELECT Admin_ID FROM Admins WHERE Admin_ID = :adminId",
                    new Dictionary<string, object> { { ":adminId", id } });

                if (dt.Rows.Count == 0)
                    return NotFound(new { error = "Admin not found." });

                _db.Execute("DELETE FROM Admins WHERE Admin_ID = :adminId",
                    new Dictionary<string, object> { { ":adminId", id } });

                return Ok(new { message = "User deleted successfully." });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("ORA-02292") || ex.Message.Contains("child record found"))
                    return Conflict(new { error = "Cannot delete user. They are referenced in sighting or threat logs." });
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ──────────────────────────────────────────────
        // Private Helpers
        // ──────────────────────────────────────────────

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private string GenerateJwtToken(AdminDto admin)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, admin.AdminId.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, admin.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("fullName", admin.FullName ?? "")
            };

            var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "60");

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static AdminDto MapAdminDto(DataRow row)
        {
            return new AdminDto
            {
                AdminId = Convert.ToInt32(row["Admin_ID"]),
                Username = row["Username"]?.ToString() ?? "",
                FullName = row["Full_Name"] == DBNull.Value ? null : row["Full_Name"]?.ToString(),
                Email = row["Email"] == DBNull.Value ? null : row["Email"]?.ToString(),
                CreatedAt = row["Created_At"] == DBNull.Value ? null : Convert.ToDateTime(row["Created_At"])
            };
        }
    }
}