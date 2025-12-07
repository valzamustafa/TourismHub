'use client';

import { useState, useEffect } from "react"; 
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Tourist'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setMessage('');
    
    if (!formData.email.trim()) {
      setMessage('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Please enter a valid email address');
      return;
    }

    setForgotPasswordLoading(true);
    
    try {
      console.log('Sending forgot password request for:', formData.email);
      
      const response = await fetch('http://localhost:5224/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: formData.email.trim() 
        })
      });

      console.log('Response status:', response.status);
      
      let responseData;
      
      try {
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Parse error:', parseError);
        responseData = { message: 'Invalid response from server' };
      }

      console.log('Response data:', responseData);

      if (response.ok) {
        setMessage(`✅ ${responseData.message || 'Password reset link sent to your email. Check your inbox!'}`);
        
        setFormData(prev => ({
          ...prev,
          email: ''
        }));
      } else {
        setMessage(`❌ ${responseData.message || 'Error sending reset link. Please try again.'}`);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage('❌ Network error. Please check: 1) Server is running, 2) CORS is configured, 3) API endpoint exists');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
    
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          setMessage('Passwords do not match');
          setLoading(false);
          return;
        }
        
        if (formData.password.length < 6) {
          setMessage('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
      }

      const endpoint = isLogin ? 'login' : 'register';
      const url = `http://localhost:5224/api/auth/${endpoint}`;
      
      let body;
      
      if (isLogin) {
        body = {
          email: formData.email.trim(),
          password: formData.password
        };
      } else {
        body = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role
        };
      }

      console.log('Sending request to:', url, 'with body:', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      let responseData;
      const responseText = await response.text();
      console.log('Login/Register response:', response.status, responseText);
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Parse error:', parseError);
        responseData = { message: 'Invalid response from server' };
      }

if (response.ok) {
  setMessage(`✅ ${isLogin ? 'Login' : 'Registration'} successful! Redirecting...`);

  if (responseData.accessToken) {
    localStorage.setItem('token', responseData.accessToken);
    localStorage.setItem('refreshToken', responseData.refreshToken);
    localStorage.setItem('user', JSON.stringify({
      id: responseData.userId,
      name: responseData.fullName,
      email: responseData.email,
      role: responseData.role,
      profileImage: responseData.profileImage
    }));
    
    if (rememberMe && isLogin) {
      localStorage.setItem('rememberedEmail', formData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
   
    setTimeout(() => {
      if (responseData.role === 'Admin') {
        window.location.href = '/';
      } else if (responseData.role === 'Provider') {
        window.location.href ='/';
      } else {
        window.location.href = '/';
      }
    }, 1500);
  }
} else {
        setMessage(`❌ ${responseData.message || `Error: ${response.status}`}`);
      }
    } catch (error) {
      console.error('Login/Register error:', error);
      setMessage('❌ Network error. Please check if the server is running at http://localhost:5224');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail && isLogin) {
        setFormData(prev => ({
          ...prev,
          email: rememberedEmail
        }));
        setRememberMe(true);
      }
    }
  }, [isLogin]); 
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#c8d5c0] p-4 sm:p-8">
      <div className="w-full max-w-7xl relative rounded-2xl overflow-hidden shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/background-image.png')`  
          }}
        />
        
        {/* Content */}
        <div className="relative grid lg:grid-cols-2 gap-8 p-8 lg:p-16 min-h-[600px]">
          <div className="flex items-center justify-center lg:justify-start">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <h1 className="text-white text-2xl font-bold mb-2">TourismHub</h1>
              <p className="text-white/90 text-lg mb-8">
                {isLogin ? 'Login to Your Account' : 'Create Your Account'}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div>
                    <label className="block text-white/90 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-white/90 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>


                <div>
                  <label className="block text-white/90 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-white/90 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                      placeholder="Confirm your password"
                      required
                      minLength={6}
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-white/30 bg-white/20 cursor-pointer"
                      />
                      <label htmlFor="remember" className="ml-2 text-white/90 cursor-pointer text-sm">
                        Remember me
                      </label>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={forgotPasswordLoading}
                      className="text-white/80 hover:text-white text-sm underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {forgotPasswordLoading ? 'Sending...' : 'Forgot Password?'}
                    </button>
                  </div>
                )}

                {!isLogin && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      required
                      className="w-4 h-4 rounded border-white/30 bg-white/20 cursor-pointer"
                    />
                    <label htmlFor="agreeTerms" className="ml-2 text-white/90 cursor-pointer text-sm">
                      I agree to the terms and conditions
                    </label>
                  </div>
                )}

                {message && (
                  <div className={`p-4 rounded-lg text-sm text-center backdrop-blur-sm ${
                    message.includes('✅') 
                      ? 'bg-green-500/20 text-green-200 border border-green-300/30' 
                      : 'bg-red-500/20 text-red-200 border border-red-300/30'
                  }`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white py-3 rounded-lg border border-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    isLogin ? 'Login to Your Account' : 'Create Account'
                  )}
                </button>
              </form>

              <div className="text-center mt-6 pt-6 border-t border-white/20">
                <p className="text-white/90 text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setMessage('');
                      setFormData({
                        fullName: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        role: 'Tourist'
                      });
                    }}
                    className="ml-2 text-white font-semibold hover:text-white/80 transition-colors duration-200 text-sm"
                  >
                    {isLogin ? 'Create Account' : 'Login'}
                  </button>
                </p>
              </div>
            </div>
          </div>
          
          {/* Quote Section */}
          <div className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
            <blockquote className="mb-8">
              <p className="text-white text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-wide font-bold">
                THE GOAL OF LIFE IS
                <br />
                <span className="text-green-300">LIVING IN AGREEMENT</span>
                <br />
                WITH NATURE
              </p>
            </blockquote>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300 mb-1">12+</div>
                <div className="text-green-100 text-sm">Activities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300 mb-1">50K+</div>
                <div className="text-green-100 text-sm">Happy Tourists</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300 mb-1">4.9</div>
                <div className="text-green-100 text-sm">Average Rating</div>
              </div>
            </div>

            <p className="text-green-100 text-lg leading-relaxed mb-6">
              Discover amazing experiences and create unforgettable memories with TourismHub. 
              Explore the world in harmony with nature.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;