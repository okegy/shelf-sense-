import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { User } from './types/index';
import { apiService } from './services/api';

function App() {
  const [user, setUser] = useState<User>({
    username: '',
    isAuthenticated: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          setUser({
            ...userData,
            isAuthenticated: true
          });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData: any) => {
    setUser({
      id: userData.id,
      username: userData.username,
      role: userData.role,
      isAuthenticated: true,
      isActive: userData.isActive,
      createdAt: userData.createdAt,
      lastLogin: userData.lastLogin
    });
  };

  const handleLogout = () => {
    apiService.logout();
    setUser({
      username: '',
      isAuthenticated: false
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {user.isAuthenticated ? (
          <Dashboard user={user} onLogout={handleLogout} />
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;