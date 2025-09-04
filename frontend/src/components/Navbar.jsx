import React from "react";
import { Link, useLocation } from "react-router-dom";
import Cookie from "js-cookie";
const Navbar = () => {
  const location = useLocation();
  const userCookie = Cookie.get("user");
  console.log("User Cookie in Navbar:", userCookie);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">
                AutoPartsHub
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* if no user cookie show signup/login, otherwise show account */}
            {!userCookie ? (
              <>
                {location.pathname !== "/signup" && (
                  <Link
                    to="/user-signup"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                )}
                {location.pathname !== "/login" && (
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/account"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Account
                </Link>
              </>
            )}
            {location.pathname !== "/" && (
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
