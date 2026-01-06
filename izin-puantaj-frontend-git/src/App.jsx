import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyLeaves from "./pages/MyLeaves";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* --- 2. BUNU EKLE (İzin Sayfası) --- */}
        <Route 
          path="/myleaves" 
          element={
            <ProtectedRoute>
              <MyLeaves />
            </ProtectedRoute>
          } 
        />
        {/* ----------------------------------- */}

        {/* --- 3. Admin Paneli --- */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        {/* ----------------------- */}

      </Routes>
    </BrowserRouter>
  );
}