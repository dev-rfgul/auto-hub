import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Cookie from "js-cookie";
import Navbar from "./components/Navbar";
import Signup from "./signup/Signup";
import AdminDashboard from "./Pages/admin/AdminDashboard";
import StoreSignup from "./signup/StoreSignup";
import ProductUpload from "./Pages/ProductUpload";
import LoginUser from "./signup/LoginUser";
import DealerHome from "./dealer/DealerHome";
import StoreHome from "./Pages/store/StorePage";
import StoreDetail from "./dealer/StoreDetail";
import ProductPreview from "./Pages/ProductPreview";
import Home from "./Pages/Home";
import UserDashboard from "./Pages/UserDashboard";
import Compare from "./Pages/Compare";
import Orders from "./Pages/Orders";
import Chatbot from "./signup/Chatbot";
import BlogsList from "./Pages/BlogsList";
import BlogDetail from "./Pages/BlogDetail";

const App = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract role from the cookies and route automatically
  useEffect(() => {
    const loadUser = async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL || '';
        const res = await fetch(`${base}/api/user/me`, { credentials: 'include' });
        if (res.ok) {
          const user = await res.json();
          // console.log('User from /me:', user);
          setRole(user?.role ?? null);
          if (user && user.role && !hasRedirected) {
            setHasRedirected(true);
            if (user.role === 'admin') navigate('/admin-panel', { replace: true });
            else if (user.role === 'dealer') navigate('/dealer-dashboard', { replace: true });
            else if (user.role === 'user') navigate('/', { replace: true });
          }
        } else {
          // fallback: try cookie (works for local setups where cookie is client-visible)
          const userCookie = Cookie.get('user');
          let user = null;
          try {
            user = userCookie ? JSON.parse(userCookie) : null;
          } catch (e) {
            user = null;
          }
          setRole(user?.role ?? null);
        }
      } catch (err) {
        // console.warn('Could not load /me:', err);
        const userCookie = Cookie.get('user');
        let user = null;
        try {
          user = userCookie ? JSON.parse(userCookie) : null;
        } catch (e) {
          user = null;
        }
        setRole(user?.role ?? null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [navigate, hasRedirected]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
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
            <Route path="/dealer" element={<DealerHome />} />
            <Route path="/dealer/store/:storeId" element={<StoreDetail />} />
            <Route path="/product-upload/:id" element={<ProductUpload />} />
            <Route path="/product-upload/:id/:productId" element={<ProductUpload />} />
          </>
        )}
        <Route path="/user-signup" element={<Signup />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/login" element={<LoginUser />} />
        <Route path="/product/:id" element={<ProductPreview />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/orders" element={<Orders />} />
  <Route path="/blogs" element={<BlogsList />} />
  <Route path="/blogs/:idOrSlug" element={<BlogDetail />} />
      </Routes>
      <Chatbot />
    </div>
  );
};

export default App;
