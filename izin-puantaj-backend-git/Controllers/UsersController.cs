using Microsoft.AspNetCore.Mvc;
using izin_puantaj_backend.Data;
using izin_puantaj_backend.Models;
using izin_puantaj_backend.Utils;
using Microsoft.EntityFrameworkCore;

namespace izin_puantaj_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAllUsers()
        {
            var users = _context.Users
                .Select(u => new 
                { 
                    u.Id, 
                    u.Name, 
                    u.Username, 
                    u.Department, 
                    u.TotalLeaveDays,
                    u.UsedLeaveDays
                })
                .ToList();

            return Ok(users);
        }

        [HttpPost]
        public IActionResult CreateUser([FromBody] CreateUserRequest request)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Name) || 
                string.IsNullOrWhiteSpace(request.Username) || 
                string.IsNullOrWhiteSpace(request.Password) || 
                string.IsNullOrWhiteSpace(request.Department))
            {
                return BadRequest(new { message = "Tüm alanlar zorunludur." });
            }

            // Check if username already exists
            if (_context.Users.Any(u => u.Username == request.Username))
            {
                return BadRequest(new { message = "Bu kullanıcı adı zaten kullanılıyor." });
            }

            // Create new user with hashed password
            var newUser = new User
            {
                Name = request.Name,
                Username = request.Username,
                Password = PasswordHasher.HashPassword(request.Password),
                Department = request.Department,
                TotalLeaveDays = request.TotalLeaveDays,
                UsedLeaveDays = 0
            };

            _context.Users.Add(newUser);
            _context.SaveChanges();

            return Ok(new 
            { 
                message = "Personel başarıyla eklendi.",
                user = new 
                { 
                    newUser.Id, 
                    newUser.Name, 
                    newUser.Username, 
                    newUser.Department, 
                    newUser.TotalLeaveDays,
                    newUser.UsedLeaveDays
                }
            });
        }

        [HttpPut("{id}")]
        public IActionResult UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var user = _context.Users.Find(id);
            
            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı." });
            }

            // Update user properties
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                user.Name = request.Name;
            }

            if (!string.IsNullOrWhiteSpace(request.Department))
            {
                user.Department = request.Department;
            }

            if (request.TotalLeaveDays.HasValue)
            {
                user.TotalLeaveDays = request.TotalLeaveDays.Value;
            }

            _context.SaveChanges();

            return Ok(new 
            { 
                message = "Kullanıcı bilgileri güncellendi.",
                user = new 
                { 
                    user.Id, 
                    user.Name, 
                    user.Username, 
                    user.Department, 
                    user.TotalLeaveDays,
                    user.UsedLeaveDays
                }
            });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteUser(int id)
        {
            var user = _context.Users.Find(id);
            
            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı." });
            }

            // Prevent deletion of admin user (ID = 1)
            if (user.Id == 1)
            {
                return BadRequest(new { message = "Yönetici hesabı silinemez." });
            }

            _context.Users.Remove(user);
            _context.SaveChanges();

            return Ok(new { message = "Kullanıcı başarıyla silindi." });
        }
    }

    public class CreateUserRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public int TotalLeaveDays { get; set; } = 14;
    }

    public class UpdateUserRequest
    {
        public string? Name { get; set; }
        public string? Department { get; set; }
        public int? TotalLeaveDays { get; set; }
    }
}
