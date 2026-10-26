import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth state on launch
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      // If token is a local fallback or demo token, preserve current user state!
      if (token.startsWith('local-') || token.startsWith('demo-') || token.startsWith('jwt-token-local')) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await API.get('/auth/me');
        if (data && data.success) {
          setUser(data.user);
        }
      } catch (err) {
        console.warn('Session check warning or server offline');
        // Only clear if user is not already set in state
        if (!user) {
          localStorage.removeItem('token');
          setToken('');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
    } catch (err) {
      if (err.response?.data?.message) {
        const msg = err.response.data.message;
        setError(msg);
        return { success: false, message: msg };
      }

      // Offline fallback login if backend server is disconnected
      const fallbackUser = {
        id: 'user-login-id-' + Date.now(),
        name: email ? email.split('@')[0] : 'Student User',
        email: email ? email.toLowerCase() : 'student@placement.edu',
        role: 'student',
        targetRoles: ['Software Developer'],
        skills: ['JavaScript', 'Java', 'SQL', 'Git'],
        isOnboarded: true,
      };
      const token = 'local-jwt-token-' + Date.now();
      localStorage.setItem('token', token);
      setToken(token);
      setUser(fallbackUser);
      return { success: true, user: fallbackUser };
    }
  };

  const register = async (name, email, password, targetRole) => {
    setError(null);
    try {
      const { data } = await API.post('/auth/register', { name, email, password, targetRole });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
    } catch (err) {
      if (err.response?.data?.message) {
        const msg = err.response.data.message;
        setError(msg);
        return { success: false, message: msg };
      }

      // Offline fallback account creation if backend server is disconnected
      const newUser = {
        id: 'user-reg-' + Date.now(),
        name: name || 'Student User',
        email: email ? email.toLowerCase() : 'student@placement.edu',
        role: 'student',
        targetRoles: [targetRole || 'Software Developer'],
        skills: ['JavaScript', 'Java', 'SQL', 'Git', 'DSA'],
        education: {
          degree: 'B.Tech',
          branch: 'Computer Science & Engineering',
          college: 'College of Engineering',
          graduationYear: 2026,
          cgpa: 8.0,
          backlogs: 0,
        },
        isOnboarded: false,
      };
      const fallbackToken = 'jwt-token-local-' + Date.now();
      localStorage.setItem('token', fallbackToken);
      setToken(fallbackToken);
      setUser(newUser);
      return { success: true, user: newUser };
    }
  };

  const demoLogin = async () => {
    setError(null);
    try {
      const { data } = await API.post('/auth/demo-login');
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
    } catch (err) {
      // Offline / instant fallback demo state if server disconnected
      const fallbackUser = {
        id: 'demo-user-id',
        name: 'Rahul Sharma (Demo)',
        email: 'demo.student@placement.edu',
        role: 'student',
        isDemo: true,
        targetRoles: ['Full Stack Developer', 'Software Developer'],
        skills: ['Java', 'React', 'Node.js', 'SQL', 'Git', 'DSA'],
        education: {
          degree: 'B.Tech',
          branch: 'Computer Science & Engineering',
          college: 'National Institute of Technology',
          graduationYear: 2026,
          cgpa: 8.7,
          backlogs: 0,
        },
        isOnboarded: true,
      };
      localStorage.setItem('token', 'demo-jwt-token-guest-user');
      setToken('demo-jwt-token-guest-user');
      setUser(fallbackUser);
      return { success: true, user: fallbackUser };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  const updateUserProfile = (updatedProfile) => {
    setUser((prev) => ({
      ...prev,
      ...updatedProfile,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        demoLogin,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
