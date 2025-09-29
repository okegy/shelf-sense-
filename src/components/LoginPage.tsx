import React, { useState } from 'react';
import { ShoppingCart, LogIn, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

interface LoginPageProps {
  onLogin: (userData: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'staff'>('staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!username.trim() || !password.trim()) {
        throw new Error('Please enter both username and password');
      }

      if (isRegistering) {
        // Registration logic
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const response = await apiService.register({ username, password, role });

        if (response.success) {
          setIsRegistering(false);
          setError(null);
          // Auto-login after successful registration
          const loginResponse = await apiService.login({ username, password });
          if (loginResponse.success) {
            onLogin(loginResponse.user);
          } else {
            setError('Registration successful, but login failed. Please try logging in manually.');
          }
        } else {
          setError(response.message || response.error || 'Registration failed');
        }
      } else {
        // Login logic
        const response = await apiService.login({ username, password });

        if (response.success) {
          onLogin(response.user);
        } else {
          setError(response.message || response.error || 'Login failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : isRegistering ? 'Registration failed' : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md transform hover:scale-105 transition-transform duration-300">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ShoppingCart className="w-12 h-12 text-blue-500 mr-2" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              ShelfSense
            </h1>
          </div>
          <p className="text-gray-600 italic">Smart Inventory • Zero Waste • Maximum Profit</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          {isRegistering && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          {isRegistering && (
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'manager' | 'staff')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isRegistering ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                {isRegistering ? 'Create Account' : 'Sign In to Dashboard'}
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <div className="text-red-600 font-semibold">{error}</div>
            </div>
          )}
        </form>

        <div className="mt-6 text-center space-y-3">
          <div className="text-sm text-gray-500">
            Demo credentials: Any username and password
          </div>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setConfirmPassword('');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
          >
            {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}