using Microsoft.AspNetCore.Mvc;
using izin_puantaj_backend.Data;   
using izin_puantaj_backend.Models; 
using Microsoft.EntityFrameworkCore; 

namespace izin_puantaj_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttendanceController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Bugünün Kaydını Getir (Dashboard açılınca çalışır)
        [HttpGet("today/{userId}")]
        public IActionResult GetTodayRecord(int userId)
        {
            var today = DateTime.Now.Date;
            
            var record = _context.AttendanceRecords
                .FirstOrDefault(r => r.UserId == userId && r.Date == today);

            return Ok(record);
        }

        // 2. Giriş veya Çıkış Yap (GÜNCELLENDİ - Kutu ile veri alıyor)
        [HttpPost("action")]
        public IActionResult CheckInOrOut([FromBody] PuantajIstegi request) 
        {
            var userId = request.UserId; // Kutunun içinden ID'yi aldık

            var today = DateTime.Now.Date;
            var now = DateTime.Now.TimeOfDay;
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString(); // IP Yakalama

            var record = _context.AttendanceRecords
                .FirstOrDefault(r => r.UserId == userId && r.Date == today);

            if (record == null)
            {
                // Kayıt Yok -> GİRİŞ YAP (Check-In)
                record = new AttendanceRecord
                {
                    UserId = userId,
                    Date = today,
                    CheckInTime = now,
                    IpAddress = ipAddress
                };

                _context.AttendanceRecords.Add(record);
                _context.SaveChanges(); 

                return Ok(new { message = "Giriş yapıldı 🟢", type = "CheckIn", time = now });
            }
            else if (record.CheckOutTime == null)
            {
                // Giriş Var -> ÇIKIŞ YAP (Check-Out)
                record.CheckOutTime = now;
                record.IpAddress = ipAddress; // Çıkışta da IP'yi güncelleyelim
                
                if (record.CheckInTime.HasValue)
                {
                    record.TotalHours = (now - record.CheckInTime.Value).TotalHours;
                }

                _context.SaveChanges(); 

                return Ok(new { message = "Çıkış yapıldı 🔴", type = "CheckOut", time = now, totalHours = record.TotalHours });
            }
            else
            {
                return BadRequest(new { message = "Bugün zaten mesainiz tamamlandı. 👋" });
            }
        }
    }

    // Frontend'den gelen veriyi karşılayan kutucuk (Class)
    public class PuantajIstegi
    {
        public int UserId { get; set; }
    }
}