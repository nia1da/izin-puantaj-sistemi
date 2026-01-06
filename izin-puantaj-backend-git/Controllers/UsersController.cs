using Microsoft.AspNetCore.Mvc;
using izin_puantaj_backend.Data;
using izin_puantaj_backend.Models;
using izin_puantaj_backend.Utils;

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
    }

    public class CreateUserRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public int TotalLeaveDays { get; set; } = 14;
    }
}
