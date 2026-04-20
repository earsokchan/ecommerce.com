"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch('https://api.targetclothe.online/api/auth/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      setSuccess("Login successful! Redirecting...");
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      localStorage.setItem("role", data.role);
      
      // Also set cookie for middleware
      document.cookie = `token=${data.token}; path=/; max-age=86400`;

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Login error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-50 p-4">
      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Section - Illustration Area */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-500 via-purple-400 to-teal-400 items-center justify-center p-8 relative overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white opacity-10 rounded-full -ml-28 -mb-28"></div>
            
            {/* Illustration placeholder */}
            <div className="relative z-10 text-center">
              <div className="bg-white bg-opacity-90 rounded-2xl p-8 shadow-lg max-w-sm">
                {/* Simple security illustration */}
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-teal-400 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7.538-4a3 3 0 00-2.12-.882H5.604a3 3 0 00-2.12.882m15.716 0a3 3 0 012.12.882v10.882a3 3 0 01-3 3H5.604a3 3 0 01-3-3V5.882a3 3 0 013-3h12.682a3 3 0 013 3z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Secure Login</h3>
                <p className="text-gray-600 text-sm">Your account is protected with industry-leading security</p>
              </div>
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            {/* Logo/Company Name */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex gap-2">
                <img src="./imgs/logo.png" alt="Logo" className="w-10 h-10" />
                </div>
              </div>
              <p className="text-xs text-gray-500 tracking-widest font-semibold">TARGETCLOTHE</p>
            </div>

            {/* Form Title */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-teal-400 rounded"></div>
                <h2 className="text-2xl font-bold text-gray-800">Login as a Admin User</h2>
              </div>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email/Username Field */}
              <div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed bg-gray-50"
                  placeholder="john@xyz.com"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed bg-gray-50"
                  placeholder="Password"
                  required
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 hover:shadow-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-95 mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "L O G I N"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}