import { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Cookie from "js-cookie";
import Navbar from "./components/Navbar";
import Signup from "./Pages/Signup";
import DealerSignup from "./Pages/DealerSignup";
import AdminDashboard from "./Pages/AdminDashboard";
import StoreSignup from "./Pages/StoreSignup";
import ProductUpload from "./Pages/ProductUpload";
import LoginUser from "./Pages/LoginUser";

const App = () => {
  //extract role from the cookies
  useEffect(() => {
    // const userValue = JSON.parse(Cookie.get("user"));
    // console.log("User cookie:", userValue);
    // console.log("role",userValue?.role);
  }, []);
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
              <h1 className="text-4xl font-bold text-blue-600 mb-4">
                AutoPartsHub
              </h1>
              <p className="text-gray-600 mb-8">
                Your one-stop shop for auto parts
              </p>
              <div className="space-x-4">
                <Link
                  to="/user-signup"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50"
                >
                  Sign In
                </Link>
              </div>
            </div>
          }
        />
        <Route path="/user-signup" element={<Signup />} />
        <Route path="/admin-panel" element={<AdminDashboard />} />
        <Route path="/store-signup" element={<StoreSignup />} />
        <Route path="/product-upload" element={<ProductUpload />} />
        <Route path="/login" element={<LoginUser />} />
        <Route
          path="/dealer-dashboard"
          element={
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Dealer Dashboard
              </h1>
              <p className="text-gray-600">Welcome to your dealer dashboard!</p>
              <Link to="/" className="mt-4 text-blue-600 hover:text-blue-500">
                Back to Home
              </Link>
            </div>
          }
        />
        <Route path="/dealer-signup" element={<DealerSignup />} />
      </Routes>
    </div>
  );
};

export default App;
