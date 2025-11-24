namespace izin_puantaj_backend.Models
{
    public class AttendanceRecord
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime Date { get; set; } = DateTime.Now.Date; // Varsayılan olarak bugünün tarihi
        
        // Giriş-Çıkış saatleri (Henüz işlem yapılmadıysa boş olabilir diye ? koyduk)
        public TimeSpan? CheckInTime { get; set; } 
        public TimeSpan? CheckOutTime { get; set; } 
        
        public double TotalHours { get; set; } = 0; // O günkü toplam çalışma süresi

        // Yeni eklediğimiz güvenlik önlemi
        public string? IpAddress { get; set; } 

        // Hangi kullanıcıya ait olduğunu bilmek için ilişki
        public User? User { get; set; }
    }
}