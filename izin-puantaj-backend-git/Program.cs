using izin_puantaj_backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------
// İŞTE EKSİK OLAN PARÇA BU 👇 (Veritabanı Servisi)
// ---------------------------------------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=izinPuantaj.db"));
// ---------------------------------------------------------

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// CORS Ayarları (Frontend erişimi için)
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseHttpsRedirection();
app.MapControllers();

app.Run();