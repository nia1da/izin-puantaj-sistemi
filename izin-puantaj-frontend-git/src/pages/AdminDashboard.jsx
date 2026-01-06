import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  
  const INITIAL_USER = {
    name: "",
    username: "",
    password: "",
    department: "",
    totalLeaveDays: 14
  };
  
  const [newUser, setNewUser] = useState(INITIAL_USER);
  
  const itemsPerPage = 5;

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const res = await api.get("/api/Leave/pending");
      setPendingLeaves(res.data);
    } catch (err) {
      console.error("Bekleyen talepler çekilemedi", err);
      setMessage("Talepler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    if (!confirm("Bu izin talebini onaylamak istediğinizden emin misiniz?")) return;

    try {
      const res = await api.post(`/api/Leave/approve/${leaveId}`);
      setMessage(res.data.message);
      fetchPendingLeaves(); // Listeyi yenile
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Onaylama işlemi başarısız.";
      setMessage(errorMsg);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleRejectClick = (leaveId) => {
    setSelectedLeaveId(leaveId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      alert("Lütfen red sebebini giriniz.");
      return;
    }

    try {
      const res = await api.post(`/api/Leave/reject/${selectedLeaveId}`, {
        reason: rejectReason
      });
      setMessage(res.data.message);
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedLeaveId(null);
      fetchPendingLeaves(); // Listeyi yenile
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Reddetme işlemi başarısız.";
      setMessage(errorMsg);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleAddUserClick = () => {
    setNewUser(INITIAL_USER);
    setShowAddUserModal(true);
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    
    if (!newUser.name.trim() || !newUser.username.trim() || !newUser.password.trim() || !newUser.department.trim()) {
      alert("Lütfen tüm alanları doldurunuz.");
      return;
    }

    try {
      const res = await api.post("/api/Users", newUser);
      setMessage(res.data.message);
      setShowAddUserModal(false);
      setNewUser(INITIAL_USER);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Personel eklenirken hata oluştu.";
      setMessage(errorMsg);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pendingLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pendingLeaves.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-blue-600 font-bold">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* ÜST BAR */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 text-white p-2 rounded-lg shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Admin Paneli</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleAddUserClick}
              className="bg-green-50 hover:bg-green-100 text-green-600 text-sm font-semibold px-4 py-2 rounded-lg transition border border-green-200"
            >
              + Yeni Personel Ekle
            </button>
            <button 
              onClick={() => navigate("/dashboard")} 
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-2 rounded-lg transition border border-blue-200"
            >
              Ana Sayfa
            </button>
            <button 
              onClick={handleLogout} 
              className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-lg transition border border-red-200"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* MESAJ KUTUSU */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-white font-bold text-center shadow-lg ${
            message.includes("Yetersiz") || message.includes("başarısız") || message.includes("hata") 
              ? "bg-red-500" 
              : message.includes("onaylandı") 
                ? "bg-green-600" 
                : "bg-orange-600"
          }`}>
            {message}
          </div>
        )}

        {/* İSTATİSTİK KARTI */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Bekleyen Talepler</div>
              <div className="text-4xl font-extrabold text-purple-600 mt-2">
                {pendingLeaves.length} <span className="text-lg text-gray-400 font-normal">Talep</span>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-full">
              <span className="text-4xl">📋</span>
            </div>
          </div>
        </div>

        {/* BEKLEYEN İZİN TALEPLERİ LİSTESİ */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
              <span>⏳</span> Bekleyen İzin Talepleri
            </h2>
          </div>

          <div className="p-6">
            {pendingLeaves.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">🎉</span>
                </div>
                <p className="text-gray-400 text-lg italic">Bekleyen izin talebi yok.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentItems.map((leave) => (
                    <div 
                      key={leave.id} 
                      className="border border-gray-200 p-5 rounded-xl hover:shadow-md transition bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-gray-800">{leave.userName}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                              {leave.userDepartment}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div><strong>İzin Türü:</strong> {leave.leaveType}</div>
                            <div><strong>Tarih Aralığı:</strong> {new Date(leave.startDate).toLocaleDateString('tr-TR')} - {new Date(leave.endDate).toLocaleDateString('tr-TR')}</div>
                            <div><strong>Toplam Gün:</strong> {leave.totalDays} gün</div>
                            <div className="text-xs text-gray-400"><strong>Talep Tarihi:</strong> {new Date(leave.createdAt).toLocaleString('tr-TR')}</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleApprove(leave.id)}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-6 py-3 rounded-lg transition transform active:scale-95"
                          >
                            ✅ Onayla
                          </button>
                          <button 
                            onClick={() => handleRejectClick(leave.id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-3 rounded-lg transition transform active:scale-95"
                          >
                            ❌ Reddet
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition font-semibold"
                    >
                      ← Önceki
                    </button>
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition font-semibold"
                    >
                      Sonraki →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* REDDETME MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">İzin Talebini Reddet</h3>
            <p className="text-gray-600 mb-4">Lütfen red sebebini belirtiniz:</p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500 focus:ring-2 focus:ring-blue-200 min-h-[120px]"
              placeholder="Red sebebini buraya yazınız..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedLeaveId(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg transition"
              >
                İptal
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition"
              >
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ PERSONEL EKLEME MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Yeni Personel Ekle</h3>
            <form onSubmit={handleAddUserSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Soyad</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Örn: Ahmet Yılmaz"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kullanıcı Adı</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Örn: ahmet.yilmaz"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Şifre</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Şifre giriniz"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Departman</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Örn: İnsan Kaynakları"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Toplam İzin Hakkı (Gün)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="14"
                    value={newUser.totalLeaveDays}
                    onChange={(e) => setNewUser({...newUser, totalLeaveDays: parseInt(e.target.value) || 14})}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setNewUser(INITIAL_USER);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
