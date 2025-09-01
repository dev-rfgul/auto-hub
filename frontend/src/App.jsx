import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Cookie from "js-cookie";
import Navbar from "./components/Navbar";
import Signup from "./Pages/Signup";
import AdminDashboard from "./Pages/AdminDashboard";
import StoreSignup from "./Pages/StoreSignup";
import ProductUpload from "./Pages/ProductUpload";
import LoginUser from "./Pages/LoginUser";
import DealerHome from "./Pages/DealerHome";

const App = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract role from the cookies and route automatically
  useEffect(() => {
    const userCookie = Cookie.get("user");
    let user = null;
    try {
      user = userCookie ? JSON.parse(userCookie) : null;
      console.log("User from cookie:", user);
    } catch (e) {
      user = null;
    }

    setRole(user?.role ?? null);
    setLoading(false);

    // Auto-redirect based on role, but only once per session
    if (user && user.role && !hasRedirected) {
      setHasRedirected(true);
      
      if (user.role === "admin") {
        navigate("/admin-panel", { replace: true });
      } else if (user.role === "dealer") {
        navigate("/dealer-dashboard", { replace: true });
      } else if (user.role === "user") {
        navigate("/", { replace: true });
      }
    }
  }, [navigate, hasRedirected]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <Navbar />
      <Routes>
        {role === "admin" && (
          <>
            <Route path="/admin-panel" element={<AdminDashboard />} />
            <Route path="/product-upload" element={<ProductUpload />} />
          </>
        )}
        {role === "dealer" && (
          <>
            <Route path="/store-signup" element={<StoreSignup />} />
            <Route path="/dealer-dashboard" element={<DealerHome />} />
          </>
        )}
        <Route path="/user-signup" element={<Signup />} />
        <Route path="/login" element={<LoginUser />} />
      </Routes>
    </div>
  );
};

export default App;
