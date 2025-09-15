import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Cookie from "js-cookie";
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState(null);
  const base = import.meta.env.VITE_BACKEND_URL || '';

  // try parse cookie first (local dev / same-origin). If not present, call backend /me endpoint (production when cookie is set on API domain)
  useEffect(() => {
    const load = async () => {
      const userCookie = Cookie.get('user');
      let parsed = null;
      try {
        parsed = userCookie ? JSON.parse(userCookie) : null;
      } catch (e) {
        parsed = null;
      }
      if (parsed) {
        setUser(parsed);
        return;
      }

      // fallback to calling API /me to detect logged-in user (requires backend /api/user/me)
      try {
        const res = await fetch(`${base}/api/user/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          return;
        }
      } catch (err) {
        // ignore
      }
      setUser(null);
    };
    load();
  }, []);

  console.log("User Cookie in Navbar:", user);
  const role = user?.role || null;
  const dashboardPath = role === 'dealer' ? '/dealer-dashboard' : role === 'admin' ? '/admin-panel' : '/user-dashboard';
  // close mobile menu on navigation change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
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
              <span className="text-xl font-bold text-gray-900">AutoPartsHub</span>
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                {location.pathname !== "/signup" && (
                  <Link to="/user-signup" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Sign Up</Link>
                )}
                {location.pathname !== "/login" && (
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Sign In</Link>
                )}
              </>
            ) : (
              <Link to={dashboardPath} className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Account</Link>
            )}
            {location.pathname !== "/" && (
              <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
            )}
          </div>

          {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label="Toggle menu"
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
              >
                {open ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  // explicit 3-bar hamburger
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect y="4" width="20" height="2" rx="1" fill="currentColor" />
                    <rect y="11" width="20" height="2" rx="1" fill="currentColor" />
                    <rect y="18" width="20" height="2" rx="1" fill="currentColor" />
                  </svg>
                )}
              </button>
            </div>
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!user ? (
              <>
                {location.pathname !== "/signup" && (
                  <Link to="/user-signup" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Sign Up</Link>
                )}
                {location.pathname !== "/login" && (
                  <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Sign In</Link>
                )}
              </>
            ) : (
              <Link to={dashboardPath} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Account</Link>
            )}
            {location.pathname !== "/" && (
              <Link to="/" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Home</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
