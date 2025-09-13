import React, { useState } from "react";
import axios from "axios";
import { Building2, FileText, Phone, MapPin, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const DealerSignup = () => {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("dealer"); // "dealer" or "user"

  const [formData, setFormData] = useState({
    name: "",
    cnic: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate dealer form
  const validateForm = () => {
    let newErrors = {};

    if (accountType === "dealer") {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }
      if (!formData.cnic.trim()) {
        newErrors.cnic = "CNIC is required";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^[+]?[0-9]{7,15}$/.test(formData.phone)) {
        newErrors.phone = "Invalid phone number";
      }
      if (!formData.address.trim()) {
        newErrors.address = "Address is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (accountType === "dealer") {
        const submitData = {
          name: formData.name,
          cnic: formData.cnic,
          phone: formData.phone,
          address: formData.address,
        };

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/dealer/register`,
          submitData
        );

        console.log("Dealer registered:", response.data);
        navigate("/dealer-dashboard");
      } else {
        console.log("User registration coming soon...");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({
        general:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">
          {accountType === "dealer"
            ? "Dealer Account Registration"
            : "User Account Registration"}
        </h2>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          <h3 className="text-center text-lg font-semibold text-gray-800 mb-4">
            Choose Account Type
          </h3>
{/* toggle user and dealer */}
          <div className="grid grid-cols-2 gap-6">
            {/* User Signup */}
            <Link to="/user-signup">
              <div className="relative flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-500 transition duration-200 cursor-pointer">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mb-3">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
                  </svg>
                </div>
                <span className="block text-sm font-medium text-gray-900">
                  Customer
                </span>
                <span className="mt-1 text-center text-xs text-gray-500">
                  Buy auto parts and get support
                </span>
              </div>
            </Link>

            {/* Dealer Signup */}
            <Link to="/dealer-signup">
              <div className="relative flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-500 transition duration-200 cursor-pointer">
                <div className="w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-full mb-3">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 3a2 2 0 00-2 2v1h16V5a2 2 0 00-2-2H4zM2 9h16v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
                <span className="block text-sm font-medium text-gray-900">
                  Dealer
                </span>
                <span className="mt-1 text-center text-xs text-gray-500">
                  Sell auto parts and manage store
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {accountType === "dealer" ? (
            <>
              {/* Business Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Dealer Name
                </label>
                <div className="relative">
                  <Building2
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-indigo-500`}
                    placeholder="Enter your dealer name"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Tax ID */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  CNIC
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.cnic ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-indigo-500`}
                    placeholder="Enter your CNIC"
                  />
                </div>
                {errors.cnic && (
                  <p className="text-red-500 text-sm mt-1">{errors.cnic}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-indigo-500`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-indigo-500`}
                    placeholder="Enter your business address"
                  />
                </div>
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <User className="mx-auto mb-2" size={28} />
              <p>User signup form coming soon...</p>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <p className="text-red-500 text-sm text-center">{errors.general}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DealerSignup;
