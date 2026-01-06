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

        // 3. Bekleyen İzin Taleplerini Listele (Admin için)
        [HttpGet("pending")]
        public IActionResult GetPendingLeaves()
        {
            var pendingLeaves = _context.LeaveRequests
                .Where(l => l.Status == "Bekliyor")
                .OrderBy(l => l.CreatedAt)
                .Select(l => new
                {
                    l.Id,
                    l.UserId,
                    l.LeaveType,
                    l.StartDate,
                    l.EndDate,
                    l.TotalDays,
                    l.Status,
                    l.CreatedAt,
                    UserName = _context.Users.Where(u => u.Id == l.UserId).Select(u => u.Name).FirstOrDefault(),
                    UserDepartment = _context.Users.Where(u => u.Id == l.UserId).Select(u => u.Department).FirstOrDefault()
                })
                .ToList();

            return Ok(pendingLeaves);
        }

        // 4. İzin Talebini Onayla (Admin için)
        [HttpPost("approve/{id}")]
        public IActionResult ApproveLeave(int id)
        {
            var leaveRequest = _context.LeaveRequests.FirstOrDefault(l => l.Id == id);
            if (leaveRequest == null)
                return NotFound(new { message = "İzin talebi bulunamadı." });

            if (leaveRequest.Status != "Bekliyor")
                return BadRequest(new { message = "Bu talep zaten işleme alınmış." });

            // Kullanıcıyı bul
            var user = _context.Users.FirstOrDefault(u => u.Id == leaveRequest.UserId);
            if (user == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            // Kalan izin günlerini kontrol et
            var remainingDays = user.TotalLeaveDays - user.UsedLeaveDays;
            if (remainingDays < leaveRequest.TotalDays)
            {
                return BadRequest(new 
                { 
                    message = $"Yetersiz izin bakiyesi. Kalan: {remainingDays} gün, Talep edilen: {leaveRequest.TotalDays} gün" 
                });
            }

            // İzni onayla ve kullanılan günleri güncelle
            leaveRequest.Status = "Onaylandı";
            user.UsedLeaveDays += leaveRequest.TotalDays;

            _context.SaveChanges();

            return Ok(new { message = "İzin talebi onaylandı. ✅" });
        }

        // 5. İzin Talebini Reddet (Admin için)
        [HttpPost("reject/{id}")]
        public IActionResult RejectLeave(int id, [FromBody] RejectionDto rejection)
        {
            var leaveRequest = _context.LeaveRequests.FirstOrDefault(l => l.Id == id);
            if (leaveRequest == null)
                return NotFound(new { message = "İzin talebi bulunamadı." });

            if (leaveRequest.Status != "Bekliyor")
                return BadRequest(new { message = "Bu talep zaten işleme alınmış." });

            // İzni reddet
            leaveRequest.Status = "Reddedildi";
            leaveRequest.RejectionReason = rejection.Reason ?? "Belirtilmedi";

            _context.SaveChanges();

            return Ok(new { message = "İzin talebi reddedildi. ❌" });
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

    // Red sebebi için DTO
    public class RejectionDto
    {
        public string? Reason { get; set; }
    }
}