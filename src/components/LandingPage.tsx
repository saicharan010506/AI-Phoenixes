import React, { useState } from 'react';
import { Palette, Users, Award, ArrowRight, Mail, Phone, User, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [loginWithOTP, setLoginWithOTP] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    primaryCraft: '',
    password: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginWithOTP: authLoginWithOTP, sendOTP, createAccount } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await sendOTP(formData.email, formData.mobile);
      if (success) {
        setShowOTPVerification(true);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await createAccount({
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        primaryCraft: formData.primaryCraft
      }, formData.otp);

      if (!success) {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let success = false;
      
      if (loginWithOTP) {
        if (!formData.otp) {
          // Send OTP first
          success = await sendOTP(formData.email);
          if (success) {
            setError('OTP sent to your email. Please enter it below.');
            setLoading(false);
            return;
          }
        } else {
          // Verify OTP
          success = await authLoginWithOTP(formData.email, formData.otp);
        }
      } else {
        success = await login(formData.email, formData.password);
      }

      if (!success) {
        setError(loginWithOTP ? 'Invalid OTP or email.' : 'Invalid email or password.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setShowLogin(false);
    setShowCreateAccount(false);
    setShowOTPVerification(false);
    setLoginWithOTP(false);
    setFormData({
      fullName: '',
      email: '',
      mobile: '',
      primaryCraft: '',
      password: '',
      otp: ''
    });
    setError('');
  };

  if (showOTPVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
          <div className="text-center mb-8">
            <Logo size="lg" />
            <h2 className="text-2xl font-bold text-white mt-4">Verify Your Account</h2>
            <p className="text-gray-300 mt-2">Enter the OTP sent to {formData.email}</p>
          </div>

          <form onSubmit={handleOTPVerification} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <button
              type="button"
              onClick={resetForms}
              className="w-full text-gray-400 hover:text-white transition-colors"
            >
              Back to Landing Page
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showCreateAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
          <div className="text-center mb-8">
            <Logo size="lg" />
            <h2 className="text-2xl font-bold text-white mt-4">Create Your Account</h2>
            <p className="text-gray-300 mt-2">Join the KalaHasta community</p>
          </div>

          <form onSubmit={handleCreateAccount} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="inline w-4 h-4 mr-2" />
                Mobile Number (Optional)
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Enter your mobile number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Briefcase className="inline w-4 h-4 mr-2" />
                Primary Craft
              </label>
              <select
                name="primaryCraft"
                value={formData.primaryCraft}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              >
                <option value="">Select your craft</option>
                <option value="Kalamkari Painting">Kalamkari Painting</option>
                <option value="Pottery">Pottery</option>
                <option value="Weaving">Weaving</option>
                <option value="Wood Carving">Wood Carving</option>
                <option value="Metalwork">Metalwork</option>
                <option value="Textile Art">Textile Art</option>
                <option value="Jewelry Making">Jewelry Making</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={resetForms}
              className="w-full text-gray-400 hover:text-white transition-colors"
            >
              Back to Landing Page
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
          <div className="text-center mb-8">
            <Logo size="lg" />
            <h2 className="text-2xl font-bold text-white mt-4">Welcome Back</h2>
            <p className="text-gray-300 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            {!loginWithOTP ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  OTP (if received)
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter OTP (leave empty to request)"
                  maxLength={6}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setLoginWithOTP(!loginWithOTP)}
                className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
              >
                {loginWithOTP ? 'Use Password Instead' : 'Login with OTP'}
              </button>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={resetForms}
              className="w-full text-gray-400 hover:text-white transition-colors"
            >
              Back to Landing Page
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="lg" />
          <div className="flex space-x-4">
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-2 text-white border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => setShowCreateAccount(true)}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200"
            >
              Create Account
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
              KalaHasta
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Empowering traditional artisans to share their craft with the world. 
            Your story is your power. Let's share it together.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <button
              onClick={() => setShowCreateAccount(true)}
              className="group px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-4 text-white border-2 border-gray-600 rounded-xl hover:bg-gray-800 hover:border-gray-500 transition-all duration-200"
            >
              Sign In
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Showcase Your Art</h3>
              <p className="text-gray-300">
                Upload your creations and let our AI enhance them with professional staging and pricing guidance.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Connect Globally</h3>
              <p className="text-gray-300">
                Reach customers worldwide with AI-powered translation and cultural adaptation of your communications.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Certify Authenticity</h3>
              <p className="text-gray-300">
                Create digital certificates for your work with our Living Heritage Ledger technology.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>
    </div>
  );
};

export default LandingPage;