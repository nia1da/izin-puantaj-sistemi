import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedData = JSON.parse(storedUser);
      const currentUser = parsedData.user || parsedData; 
      setUser(currentUser);
      fetchTodayRecord(currentUser.Id || currentUser.id);
    } else {
        setLoading(false);
    }
  }, []);

  const fetchTodayRecord = async (userId) => {
    try {
      const res = await api.get(`/api/Attendance/today/${userId}`);
      setTodayRecord(res.data); 
    } catch (error) {
      console.error("Kayıt çekilemedi", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePuantaj = async () => {
    if (!user) return;
    try {
      const userId = user.Id || user.id;
      const res = await api.post("/api/Attendance/action", { userId: userId });
      setMessage(res.data.message);
      fetchTodayRecord(userId);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "İşlem başarısız.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-blue-600 font-bold">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      
      {/* --- ÜST BAR (HEADER) --- */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">Personel Takip v1.0</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block mr-2">
              <div className="text-sm font-bold text-gray-900">{user?.Name || user?.name}</div>
              <div className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                {user?.Department || "Personel"}
              </div>
            </div>

            {/* --- YENİ EKLENEN ÜST İZİN BUTONU --- */}
            <a href="/myleaves" className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-2 rounded-lg transition border border-blue-200 flex items-center gap-2">
              <span>📅</span> <span className="hidden sm:inline">İzin İşlemleri</span>
            </a>
            {/* ------------------------------------ */}

            {/* --- ADMİN PANELİ BUTONU (Sadece admin için) --- */}
            {(user?.Department === "Yönetim" || user?.department === "Yönetim") && (
              <a href="/admin" className="bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-semibold px-4 py-2 rounded-lg transition border border-purple-200 flex items-center gap-2">
                <span>⚙️</span> <span className="hidden sm:inline">Admin Paneli</span>
              </a>
            )}
            {/* ------------------------------------------------- */}

            <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-lg transition border border-red-200">
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- İSTATİSTİK KARTLARI --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Kart 1: Kalan İzin */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
                <div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Kalan İzin Hakkı</div>
                    <div className="text-4xl font-extrabold text-blue-600 mt-2">
                        {user ? ((user.TotalLeaveDays || user.totalLeaveDays) - (user.UsedLeaveDays || user.usedLeaveDays)) : "..."} <span className="text-lg text-gray-400 font-normal">Gün</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Toplam: {user?.TotalLeaveDays || user?.totalLeaveDays} gün</div>
                </div>
                
                {/* --- YENİ EKLENEN KART İÇİ BUTON --- */}
                <a href="/myleaves" className="mt-4 w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 rounded-lg transition">
                    Talep Oluştur →
                </a>
                {/* ------------------------------------ */}
            </div>

            {/* Kart 2: Kullanılan İzin */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Kullanılan İzin</div>
                <div className="text-4xl font-extrabold text-orange-500 mt-3">
                    {user?.UsedLeaveDays || user?.usedLeaveDays || 0} <span className="text-lg text-gray-400 font-normal">Gün</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                    Bu yıl kullanılan toplam süre
                </div>
            </div>

            {/* Kart 3: Anlık Durum */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Anlık Durum</div>
                <div className="mt-3 flex items-center gap-3">
                    <span className={`w-4 h-4 rounded-full shadow-sm ${todayRecord?.checkOutTime === null && todayRecord ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
                    <span className="text-2xl font-bold text-gray-700">
                        {todayRecord?.checkOutTime === null && todayRecord ? "Mesai Başladı" : "Mesai Dışı"}
                    </span>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
                    Sistem saati ile senkronize
                </div>
            </div>
        </div>

        {/* --- MESAJ KUTUSU --- */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-white font-bold text-center shadow-lg transform transition-all duration-500 ${message.includes("hata") ? "bg-red-500" : "bg-emerald-600"}`}>
            {message}
          </div>
        )}

        {/* --- GÜNLÜK PUANTAJ (AYNI) --- */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                    <span>⏱️</span> Günlük Puantaj
                </h2>
                <span className="text-sm font-mono text-gray-600 bg-white px-3 py-1 rounded-full border shadow-sm">
                    {new Date().toLocaleDateString("tr-TR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>

            <div className="p-10 flex flex-col items-center justify-center min-h-[300px]">
                {!todayRecord && (
                    <div className="text-center w-full max-w-md animate-fade-in">
                        <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <span className="text-4xl">🌤️</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Günaydın, {user?.Name?.split(' ')[0]}!</h3>
                        <p className="text-gray-500 mb-8">Bugünkü mesaine başlamak için aşağıdaki butona basabilirsin.</p>
                        <button onClick={handlePuantaj} className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-4 rounded-xl shadow-green-200 shadow-xl transition-all hover:-translate-y-1 active:scale-95 cursor-pointer">
                            GİRİŞ YAP (BAŞLA)
                        </button>
                    </div>
                )}

                {todayRecord && todayRecord.checkOutTime === null && (
                    <div className="text-center w-full max-w-md animate-fade-in">
                        <div className="border-2 border-green-100 bg-green-50 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 left-0 w-full h-1 bg-green-400 animate-pulse"></div>
                            <p className="text-green-800 font-medium mb-1 uppercase text-xs tracking-wider">Giriş Saati</p>
                            <p className="text-5xl font-mono font-bold text-green-600 tracking-tight">
                                {todayRecord.checkInTime?.substring(0, 5)}
                            </p>
                        </div>
                        <button onClick={handlePuantaj} className="w-full bg-red-500 hover:bg-red-600 text-white text-lg font-bold py-4 rounded-xl shadow-red-200 shadow-xl transition-all hover:-translate-y-1 active:scale-95 cursor-pointer">
                            MESAİYİ BİTİR (ÇIKIŞ)
                        </button>
                    </div>
                )}

                {todayRecord && todayRecord.checkOutTime !== null && (
                    <div className="text-center w-full max-w-md animate-fade-in">
                        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <span className="text-3xl">✅</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Bugünlük Bu Kadar!</h3>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                                <div className="text-left">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Giriş</p>
                                    <p className="font-mono font-bold text-gray-700 text-lg">{todayRecord.checkInTime?.substring(0, 5)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Çıkış</p>
                                    <p className="font-mono font-bold text-gray-700 text-lg">{todayRecord.checkOutTime?.substring(0, 5)}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-blue-100 p-4 rounded-lg">
                                <span className="text-blue-900 font-bold text-sm">TOPLAM SÜRE</span>
                                <span className="text-blue-800 font-extrabold text-xl">{todayRecord.totalHours.toFixed(2)} Saat</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}