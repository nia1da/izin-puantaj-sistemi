import { useState } from "react"; // <-- Eksikti, ekledik
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // <-- API servisini çağırmayı unutma

export default function Login() {
  const navigate = useNavigate();

  // --- EKSİK OLAN KISIMLAR BURASIYDI ---
  // Kutucukların içindeki veriyi tutacak değişkenler (State)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // -------------------------------------

  const handleLogin = async () => {
    // Doğrulama: Boşsa backend'e gitme
    if (!username || !password) {
      setError("Lütfen kullanıcı adı ve şifre giriniz.");
      return;
    }

    try {
      setError(""); // Önceki hataları temizle
      
      // Backend'e giriş isteği at
      const response = await api.post("/api/Auth/login", {
        username: username,
        password: password
      });

      // Giriş başarılıysa kartı cebe koy (LocalStorage)
      localStorage.setItem("user", JSON.stringify(response.data));
      
      // Yönlendir
      navigate("/dashboard"); 
      
    } catch (err) {
      // Backend'den gelen mesaj varsa onu göster, yoksa genel hata mesajı
      setError(err.response?.data?.message || "Giriş başarısız! Bilgileri kontrol et.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-blue-600 text-center mb-6">
          İzin & Puantaj Takip Sistemi
        </h1>

        {/* Hata mesajı varsa burada göster */}
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Kullanıcı Adı"
          className="border w-full p-2 rounded mb-3 focus:outline-blue-500"
          // --- BAĞLANTI KISMI ---
          value={username} // Kutunun değeri değişkene eşit olsun
          onChange={(e) => setUsername(e.target.value)} // Yazdıkça değişkeni güncelle
          // ---------------------
        />

        <input
          type="password"
          placeholder="Şifre"
          className="border w-full p-2 rounded mb-4 focus:outline-blue-500"
          // --- BAĞLANTI KISMI ---
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          // ---------------------
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Giriş Yap
        </button>
      </div>
    </div>
  );
}