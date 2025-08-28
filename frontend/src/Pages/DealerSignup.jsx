import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building, Mail, Lock, Phone, MapPin, FileText, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
const DealerSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    // User account fields
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Business information
    businessName: '',
    taxId: '',
    businessAddress: '',
    
    // Additional business details
    businessType: 'auto-parts',
    yearsInBusiness: '',
    description: '',
    
    // Terms and agreements
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToVerification: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Username validation
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }

      // Email validation
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      // Password validation
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 2) {
      // Business name validation
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'Business name is required';
      } else if (formData.businessName.length < 2) {
        newErrors.businessName = 'Business name must be at least 2 characters';
      }

      // Phone validation
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }

      // Business address validation
      if (!formData.businessAddress.trim()) {
        newErrors.businessAddress = 'Business address is required';
      }
    }

    if (step === 3) {
      // Terms validation
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the Terms of Service';
      }
      if (!formData.agreeToPrivacy) {
        newErrors.agreeToPrivacy = 'You must agree to the Privacy Policy';
      }
      if (!formData.agreeToVerification) {
        newErrors.agreeToVerification = 'You must agree to the verification process';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare data for submission
      const submitData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'dealer',
        businessName: formData.businessName,
        taxId: formData.taxId,
        address: formData.businessAddress,
        businessType: formData.businessType,
        yearsInBusiness: formData.yearsInBusiness,
        description: formData.description
      };

      // API call would go here
      console.log('Dealer signup data:', submitData);
      
      // Simulate API call
      const response =axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/dealer/register`,submitData)
      console.log(response)
      // Redirect to dealer dashboard
      navigate('/dealer-dashboard');
      
    } catch (error) {
      console.error('Dealer signup error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step < currentStep 
                ? 'bg-green-500 text-white' 
                : step === currentStep 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-300 text-gray-600'
            }`}>
              {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            {step < totalSteps && (
              <div className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-2">
        <p className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Create Your Account</h3>
        <p className="text-sm text-gray-600">Set up your dealer account credentials</p>
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={formData.username}
            onChange={handleInputChange}
            className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.username ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Choose a unique username"
          />
        </div>
        {errors.username && (
          <p className="mt-2 text-sm text-red-600">{errors.username}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Business Email
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your business email"
          />
        </div>
        {errors.email && (
          <p className="mt-2 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Create a strong password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-2 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
        <p className="text-sm text-gray-600">Tell us about your business</p>
      </div>

      {/* Business Name */}
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
          Business Name *
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="businessName"
            name="businessName"
            type="text"
            required
            value={formData.businessName}
            onChange={handleInputChange}
            className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.businessName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your business name"
          />
        </div>
        {errors.businessName && (
          <p className="mt-2 text-sm text-red-600">{errors.businessName}</p>
        )}
      </div>

      {/* Business Type */}
      <div>
        <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
          Business Type
        </label>
        <select
          id="businessType"
          name="businessType"
          value={formData.businessType}
          onChange={handleInputChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="auto-parts">Auto Parts Store</option>
          <option value="garage">Garage/Service Center</option>
          <option value="dealership">Car Dealership</option>
          <option value="wholesale">Wholesale Distributor</option>
          <option value="online">Online Store</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Tax ID */}
      <div>
        <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
          Tax ID (Optional)
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="taxId"
            name="taxId"
            type="text"
            value={formData.taxId}
            onChange={handleInputChange}
            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your tax ID number"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Business Phone *
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={formData.phone}
            onChange={handleInputChange}
            className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your business phone number"
          />
        </div>
        {errors.phone && (
          <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Business Address */}
      <div>
        <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
          Business Address *
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            id="businessAddress"
            name="businessAddress"
            rows={3}
            required
            value={formData.businessAddress}
            onChange={handleInputChange}
            className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.businessAddress ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your complete business address"
          />
        </div>
        {errors.businessAddress && (
          <p className="mt-2 text-sm text-red-600">{errors.businessAddress}</p>
        )}
      </div>

      {/* Years in Business */}
      <div>
        <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700">
          Years in Business
        </label>
        <select
          id="yearsInBusiness"
          name="yearsInBusiness"
          value={formData.yearsInBusiness}
          onChange={handleInputChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select years</option>
          <option value="less-than-1">Less than 1 year</option>
          <option value="1-2">1-2 years</option>
          <option value="3-5">3-5 years</option>
          <option value="6-10">6-10 years</option>
          <option value="more-than-10">More than 10 years</option>
        </select>
      </div>

      {/* Business Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Business Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Briefly describe your business, specialties, and what makes you unique..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Terms & Verification</h3>
        <p className="text-sm text-gray-600">Review and accept our terms</p>
      </div>

      {/* Verification Process Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Verification Process</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>After submitting your application, our team will review your business information. This process typically takes 2-3 business days.</p>
              <p className="mt-1">You'll receive an email notification once your account is verified.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Agreements */}
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </a>
            </label>
            {errors.agreeToTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
            )}
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="agreeToPrivacy"
              name="agreeToPrivacy"
              type="checkbox"
              checked={formData.agreeToPrivacy}
              onChange={handleInputChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeToPrivacy" className="font-medium text-gray-700">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </label>
            {errors.agreeToPrivacy && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeToPrivacy}</p>
            )}
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="agreeToVerification"
              name="agreeToVerification"
              type="checkbox"
              checked={formData.agreeToVerification}
              onChange={handleInputChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeToVerification" className="font-medium text-gray-700">
              I understand and agree to the verification process
            </label>
            {errors.agreeToVerification && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeToVerification}</p>
            )}
          </div>
        </div>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {errors.general}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Building className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Dealer Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join AutoPartsHub as a verified dealer and start selling auto parts
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
  <h3 className="text-center text-lg font-semibold text-gray-800 mb-4">
    Choose Account Type
  </h3>

  <div className="grid grid-cols-2 gap-6">
    {/* User Signup */}
    <Link to="/user-signup">
      <div className="relative flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-500 transition duration-200 cursor-pointer">
        <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mb-3">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
          </svg>
        </div>
        <span className="block text-sm font-medium text-gray-900">Customer</span>
        <span className="mt-1 text-center text-xs text-gray-500">
          Buy auto parts and get support
        </span>
      </div>
    </Link>

    {/* Dealer Signup */}
    <Link to="/dealer-signup">
      <div className="relative flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-500 transition duration-200 cursor-pointer">
        <div className="w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-full mb-3">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v1h16V5a2 2 0 00-2-2H4zM2 9h16v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
          </svg>
        </div>
        <span className="block text-sm font-medium text-gray-900">Dealer</span>
        <span className="mt-1 text-center text-xs text-gray-500">
          Sell auto parts and manage store
        </span>
      </div>
    </Link>
  </div>
</div>



      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderStepIndicator()}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {renderCurrentStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Previous
                </button>
              )}
              
              <div className="flex-1" />
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              )}
            </div>

            {/* Back to regular signup */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Looking for a customer account?{' '}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DealerSignup;
