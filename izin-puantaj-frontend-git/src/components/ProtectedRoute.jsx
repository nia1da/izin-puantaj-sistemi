import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // 1. Tarayıcı hafızasına bak: 'user' var mı?
  const user = localStorage.getItem("user");

  // 2. Eğer kullanıcı yoksa, anasayfaya (Login) tekmele
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3. Kullanıcı varsa, gitmek istediği sayfayı (Dashboard) göster
  return children;
}
