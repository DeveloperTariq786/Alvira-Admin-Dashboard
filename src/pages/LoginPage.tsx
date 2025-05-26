import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resendOtp, verifyPhone, getToken } from '@/services/loginService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getToken()) {
      navigate('/'); // Redirect to dashboard or home if already logged in
    }
  }, [navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    if (!/^[0-9]{10}$/.test(phone)) {
        setError('Invalid phone number. Please enter a 10-digit number.');
        setIsLoading(false);
        return;
    }
    try {
      const data = await resendOtp(phone);
      setMessage(data.message);
      setOtpSent(true);
    } catch (err) {
      setError((err as Error).message || 'An unknown error occurred');
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsVerifying(true);
    setIsLoading(true);
     if (!/^[0-9]{6}$/.test(otp)) {
        setError('Invalid OTP. Please enter a 6-digit number.');
        setIsLoading(false);
        setIsVerifying(false);
        return;
    }
    try {
      const data = await verifyPhone({ phone, verificationToken: otp });
      if (data.token) {
        setTimeout(() => {
            setMessage('Login successful! Redirecting...');
            navigate('/');
        }, 1500);
      } else {
        setError('Login failed. Please try again.');
        setIsVerifying(false);
        setIsLoading(false);
      }
    } catch (err) {
      setError((err as Error).message || 'An unknown error occurred');
      setIsVerifying(false);
      setIsLoading(false);
    }
  };

  if (isVerifying && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 p-4 text-white">
        <LoadingSpinner />
        <p className="text-xl mt-4 font-semibold">Verifying OTP & Preparing Dashboard...</p>
        <p className="text-sm mt-1">Please wait a moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
      <div className="bg-white p-8 sm:p-10 md:p-12 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300">
        <img src="/logo.jpg" alt="Alvira Logo" className="w-24 h-24 mx-auto mb-6 rounded-full shadow-md" />
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Admin Login
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Access your Alvira Dashboard</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm shadow-sm">
            {error}
          </div>
        )}
        {message && !error && !isVerifying && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm shadow-sm">
            {message}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your 10-digit mobile number"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-sm"
                maxLength={10}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Sending OTP...</span>
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the 6-digit OTP"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-sm"
                maxLength={6}
                pattern="\d{6}"
                title="OTP must be 6 digits"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {isLoading && !isVerifying ? (
                 <>
                  <LoadingSpinner />
                  <span className="ml-2">Verifying...</span>
                </>
              ) : (
                'Verify OTP & Login'
              )}
            </button>
            <button
                type="button"
                onClick={() => { setOtpSent(false); setMessage(''); setError(''); setOtp(''); }}
                className="mt-2 w-full text-sm text-center text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
                Back to Mobile Number
            </button>
          </form>
        )}
        <p className="mt-8 text-xs text-gray-500 text-center">
          &copy; {new Date().getFullYear()} Alvira. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 