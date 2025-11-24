import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function MyLeaves() {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [user, setUser] = useState(null);
  
  // Form Verileri
  const [leaveType, setLeaveType] = useState("Yıllık İzin");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const currentUser = parsedUser.user || parsedUser;
      setUser(currentUser);
      fetchLeaves(currentUser.Id || currentUser.id);
    }
  }, []);

  const fetchLeaves = async (userId) => {
    try {
      const res = await api.get(`/api/Leave/list/${userId}`);
      setLeaves(res.data);
    } catch (err) {
      console.error("İzinler çekilemedi", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfa yenilenmesini engelle
    if (!startDate || !endDate) {
      setMessage("Lütfen tarihleri seçiniz.");
      return;
    }

    try {
      const userId = user.Id || user.id;
      await api.post("/api/Leave/create", {
        userId: userId,
        leaveType: leaveType,
        startDate: startDate,
        endDate: endDate
      });

      setMessage("İzin talebi başarıyla gönderildi! 📝");
      fetchLeaves(userId); // Listeyi güncelle
      // Formu temizle
      setStartDate("");
      setEndDate("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Talep oluşturulamadı.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Geri Dön Butonu */}
      <button onClick={() => navigate("/dashboard")} className="mb-4 text-blue-600 font-bold hover:underline">
        ← Dashboard'a Dön
      </button>

      <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
        
        {/* SOL TARA: Talep Formu */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">İzin Talep Et</h2>
          
          {message && (
             <div className={`mb-4 p-3 rounded text-white text-center font-bold ${message.includes("başarıyla") ? "bg-green-500" : "bg-red-500"}`}>
               {message}
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600 mb-1 font-medium">İzin Türü</label>
              <select 
                className="w-full border p-2 rounded focus:outline-blue-500"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option>Yıllık İzin</option>
                <option>Hastalık İzni</option>
                <option>Mazeret İzni</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-medium">Başlangıç Tarihi</label>
              <input 
                type="date" 
                className="w-full border p-2 rounded focus:outline-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-medium">Bitiş Tarihi</label>
              <input 
                type="date" 
                className="w-full border p-2 rounded focus:outline-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition transform active:scale-95">
              TALEBİ GÖNDER 📨
            </button>
          </form>
        </div>

        {/* SAĞ TARAF: Geçmiş İzinlerim */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Geçmiş İzinlerim</h2>
          
          {leaves.length === 0 ? (
            <p className="text-gray-400 italic text-center py-10">Henüz hiç izin talebin yok.</p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {leaves.map((leave) => (
                <div key={leave.id || leave.Id} className="border p-4 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-lg text-gray-700">{leave.leaveType}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">({leave.totalDays} Gün)</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                      ${leave.status === "Onaylandı" ? "bg-green-100 text-green-700" : 
                        leave.status === "Reddedildi" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {leave.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Eğer Reddedildiyse Sebebini Göster */}
                  {leave.status === "Reddedildi" && leave.rejectionReason && (
                    <div className="mt-3 bg-red-50 p-2 rounded border border-red-100 text-red-800 text-sm">
                      <strong>Red Sebebi:</strong> {leave.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}