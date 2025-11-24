namespace izin_puantaj_backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public int TotalLeaveDays { get; set; } = 14; // İzin hakkı
        public int UsedLeaveDays { get; set; } = 0;   // Kullanılan izin
    }
}