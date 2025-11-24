GELİNEN AŞAMA ÖZETİ 

1. Tasarımın Tamamlanması:

Frontend arayüzü React + Vite kullanılarak modern bir mimariyle tasarlanmıştır.

Tailwind CSS kütüphanesi ile responsive (mobil uyumlu) ve kurumsal bir görünüm elde edilmiştir.

Login (Giriş), Dashboard (Ana Ekran) ve İzin Talep sayfaları tasarlanmış ve Backend ile entegre edilmiştir.

2. Veritabanının Hazırlanması:

İstenildiği üzere Firebase kullanılmamış, SQLite veritabanı tercih edilmiştir.

.NET Entity Framework Core (Code-First) yaklaşımı kullanılarak Users (Personel), AttendanceRecords (Puantaj) ve LeaveRequests (İzinler) tabloları oluşturulmuştur.

Veritabanı bağlantısı AppDbContext üzerinden sağlanmış ve veriler başarıyla kaydedilmektedir.

3. API Entegrasyonu ve Veri Akışı:

Backend: ASP.NET Core 8 Web API ile RESTful servisler yazılmıştır (AuthController, AttendanceController, LeaveController).

Frontend Bağlantısı: React tarafında Axios kütüphanesi kullanılarak API ile haberleşme sağlanmıştır.

Dinamik Veri: Giriş yapan personelin izin hakları, geçmiş puantaj kayıtları ve anlık durumu statik değil, doğrudan veritabanından çekilerek ekrana yansıtılmaktadır.

4. Ekstra Özellikler (Güvenlik):

Puantaj (Giriş/Çıkış) işlemi sırasında personelin IP Adresi güvenlik amacıyla yakalanıp veritabanına loglanmaktadır.

Sistem kapalı devre çalışmakta olup, sadece veritabanında tanımlı yetkili personeller (Örn: İK ve IT departmanı) giriş yapabilmektedir.
