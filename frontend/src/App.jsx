import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Signup from './Pages/Signup'
import DealerSignup from './Pages/DealerSignup';
import AdminDashboard from './Pages/AdminDashboard';

const NavigationHeader = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">AutoPartsHub</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {location.pathname !== '/signup' && (
              <Link to="/user-signup" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Sign Up
              </Link>
            )}
            {location.pathname !== '/login' && (
              <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Sign In
              </Link>
            )}
            {location.pathname !== '/' && (
              <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <div className="app">
      <NavigationHeader />
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">AutoPartsHub</h1>
            <p className="text-gray-600 mb-8">Your one-stop shop for auto parts</p>
            <div className="space-x-4">
              <Link to="/user-signup" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Get Started
              </Link>
              <Link to="/login" className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50">
                Sign In
              </Link>
            </div>
          </div>
        } />
        <Route path="/user-signup" element={<Signup />} />
        <Route path='/admin-panel' element={<AdminDashboard />} />
        <Route path="/login" element={
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Page</h1>
            <p className="text-gray-600">Login functionality coming soon...</p>
            <Link to="/user-signup" className="mt-4 text-blue-600 hover:text-blue-500">
              Don't have an account? Sign up
            </Link>
          </div>
        } />
        <Route path="/dealer-dashboard" element={
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dealer Dashboard</h1>
            <p className="text-gray-600">Welcome to your dealer dashboard!</p>
            <Link to="/" className="mt-4 text-blue-600 hover:text-blue-500">
              Back to Home
            </Link>
          </div>
        } />
        <Route path="/dealer-signup" element={<DealerSignup />} />
      </Routes>
    </div>
  )
}

export default App