import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // Extract role from the cookies and route automatically
  useEffect(() => {
    const userCookie = Cookie.get("user");
    let user = null;
    try {
      user = userCookie ? JSON.parse(userCookie) : null;
    } catch (e) {
      user = null;
    }
    setRole(user?.role);

    // Auto-route after login/signup
    if (user?.role === "admin") {
      navigate("/admin-panel", { replace: true });
    } else if (user?.role === "dealer") {
      navigate("/dealer-dashboard", { replace: true });
    } else if (user?.role === "user") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="app">
      <Navbar />
      <Routes>
        {role === "admin" && (
          <>
            <Route path="/admin-panel" element={<AdminDashboard />} />
            <Route path="/store-signup" element={<StoreSignup />} />
            <Route path="/product-upload" element={<ProductUpload />} />
          </>
        )}
        {role === "dealer" && (
          <>
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
