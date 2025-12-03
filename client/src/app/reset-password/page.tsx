'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setMessage({
        type: 'error',
        text: 'Invalid or missing reset token. Please request a new password reset link.'
      });
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!token) {
      setMessage({
        type: 'error',
        text: 'Reset token is missing. Please request a new password reset link.'
      });
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long.'
      });
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match.'
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5224/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        responseData = { message: 'Invalid response from server' };
      }

      if (response.ok) {
        setMessage({
          type: 'success',
          text: responseData.message || 'Password reset successful! You can now login with your new password.'
        });
        
        setFormData({
          newPassword: '',
          confirmPassword: ''
        });

        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: responseData.message || 'Password reset failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check if the server is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#c8d5c0] to-[#a8b8a0] p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h2>
          <p className="text-white/80 mb-6">
            The password reset link is invalid or has expired. Please request a new password reset link.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white py-3 rounded-lg border border-white/30 transition-all duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#c8d5c0] to-[#a8b8a0] p-4">
      <div className="max-w-md w-full relative rounded-2xl overflow-hidden shadow-2xl">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/background-image.png')`
          }}
        />
        
        {/* Content */}
        <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Your Password</h1>
            <p className="text-white/80">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/90 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                placeholder="Enter new password"
                required
                minLength={6}
              />
              <p className="text-white/60 text-xs mt-1">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label className="block text-white/90 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg text-sm text-center backdrop-blur-sm ${
                message.type === 'success' 
                  ? 'bg-green-500/20 text-green-200 border border-green-300/30' 
                  : 'bg-red-500/20 text-red-200 border border-red-300/30'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !tokenValid}
              className="w-full bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white py-3 rounded-lg border border-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full text-white/80 hover:text-white py-2 text-sm transition-colors duration-200"
            >
              ← Back to Login
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm text-center">
              Need help? Contact support@tourismhub.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;