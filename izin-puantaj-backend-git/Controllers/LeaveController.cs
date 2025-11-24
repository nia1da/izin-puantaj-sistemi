using Microsoft.AspNetCore.Mvc;
using izin_puantaj_backend.Data;
using izin_puantaj_backend.Models;

namespace izin_puantaj_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LeaveController(AppDbContext context)
        {
            _context = context;
        }

        // 1. İzin Talebi Oluştur (Ali form doldurup gönderince burası çalışır)
        [HttpPost("create")]
        public IActionResult CreateLeaveRequest([FromBody] LeaveRequestDto request)
        {
            // Tarih hatası var mı?
            if (request.EndDate < request.StartDate)
                return BadRequest(new { message = "Bitiş tarihi başlangıçtan önce olamaz!" });

            var totalDays = (request.EndDate - request.StartDate).Days + 1;

            var newLeave = new LeaveRequest
            {
                UserId = request.UserId,
                LeaveType = request.LeaveType,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                TotalDays = totalDays,
                Status = "Bekliyor" // İlk başta hep Bekliyor olur
            };

            _context.LeaveRequests.Add(newLeave);
            _context.SaveChanges();

            return Ok(new { message = "İzin talebiniz alındı. Yöneticinin onayı bekleniyor. 📝" });
        }

        // 2. Benim İzinlerimi Listele
        [HttpGet("list/{userId}")]
        public IActionResult GetMyLeaves(int userId)
        {
            var leaves = _context.LeaveRequests
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.CreatedAt) // En yeni en üstte
                .ToList();

            return Ok(leaves);
        }
    }

    // Frontend'den gelecek veri kutusu
    public class LeaveRequestDto
    {
        public int UserId { get; set; }
        public string LeaveType { get; set; } = "Yıllık İzin";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}