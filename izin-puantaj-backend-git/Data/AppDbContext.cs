using Microsoft.EntityFrameworkCore;
using izin_puantaj_backend.Models;
using izin_puantaj_backend.Utils;

namespace izin_puantaj_backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<AttendanceRecord> AttendanceRecords { get; set; }
        public DbSet<LeaveRequest> LeaveRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 1. Yönetici (Admin) - Bu kalsın, test için lazım olur
            modelBuilder.Entity<User>().HasData(
                new User 
                { 
                    Id = 1, 
                    Username = "admin", 
                    Password = PasswordHasher.HashPassword("1234"), 
                    Name = "Sistem Yöneticisi", 
                    Department = "Yönetim",
                    TotalLeaveDays = 30
                }
            );

            // 2. Çalışan: Ayşe Yılmaz (İnsan Kaynakları)
            modelBuilder.Entity<User>().HasData(
                new User 
                { 
                    Id = 2, 
                    Username = "ayse.yilmaz",  // İsim.Soyisim
                    Password = PasswordHasher.HashPassword("1001"),         // Personel ID (Şifre)
                    Name = "Ayşe Yılmaz", 
                    Department = "İnsan Kaynakları",
                    TotalLeaveDays = 14,
                    UsedLeaveDays = 2
                }
            );

            // 3. Çalışan: Mehmet Demir (Yazılım)
            modelBuilder.Entity<User>().HasData(
                new User 
                { 
                    Id = 3, 
                    Username = "mehmet.demir", // İsim.Soyisim
                    Password = PasswordHasher.HashPassword("1002"),         // Personel ID (Şifre)
                    Name = "Mehmet Demir", 
                    Department = "Bilgi İşlem",
                    TotalLeaveDays = 20,
                    UsedLeaveDays = 5
                }
            );
        }
    }
}