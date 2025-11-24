namespace izin_puantaj_backend.Models
{
    public class LeaveRequest
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string LeaveType { get; set; } = "Yıllık İzin";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalDays { get; set; }
        public string Status { get; set; } = "Bekliyor";
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // --- YENİ EKLENEN ALAN (Senin Fikrin) ---
        public string? RejectionReason { get; set; } // Reddedilme sebebi (Boş olabilir)
        // ----------------------------------------

        public User? User { get; set; }
    }
}