using Microsoft.AspNetCore.Mvc;
using izin_puantaj_backend.Data;   
using izin_puantaj_backend.Models; 
using izin_puantaj_backend.Utils;

namespace izin_puantaj_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // 1. Veritabanında kullanıcıyı bul
            var user = _context.Users.FirstOrDefault(u => u.Username == request.Username);

            if (user == null || !PasswordHasher.VerifyPassword(request.Password, user.Password))
                return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı." });

            // 2. Giriş Başarılı! Frontend'e gönderilecek paketi hazırla
            return Ok(new 
            { 
                message = "Giriş başarılı.",
                user = new 
                { 
                    user.Id, 
                    user.Name, 
                    user.Department, 
                    // --- BURASI YENİ EKLENDİ (DİNAMİK VERİ) ---
                    user.TotalLeaveDays, // Veritabanındaki Toplam Hak (Örn: 14)
                    user.UsedLeaveDays   // Veritabanındaki Kullanılan (Örn: 2)
                    // ------------------------------------------
                } 
            });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new { message = "Çıkış yapıldı." });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}