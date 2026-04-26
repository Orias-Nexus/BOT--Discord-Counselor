import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import api, { setAuthLogoutHandler } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('jwt_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [guilds, setGuilds] = useState([]);
  const [selectedServerId, setSelectedServerIdState] = useState(() => localStorage.getItem('selected_server_id'));
  const [isLoadingGuilds, setIsLoadingGuilds] = useState(false);
  const hasFetchedOnceRef = useRef(false);

  const setSelectedServerId = useCallback((id) => {
    setSelectedServerIdState(id);
    if (id) localStorage.setItem('selected_server_id', id);
    else localStorage.removeItem('selected_server_id');
  }, []);

  const logout = useCallback(async (options = {}) => {
    try {
      if (token && !options.skipServer) {
        await api.post('/auth/logout').catch(() => {});
      }
    } finally {
      setToken(null);
      setUser(null);
      setGuilds([]);
      setSelectedServerIdState(null);
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('selected_server_id');
      hasFetchedOnceRef.current = false;
      if (options.reason && options.reason !== 'manual') {
        toast.error(options.message || 'Session expired. Please login again.');
      }
    }
  }, [token]);

  useEffect(() => {
    setAuthLogoutHandler((info) => logout({ ...info, skipServer: true }));
    return () => setAuthLogoutHandler(null);
  }, [logout]);

  const fetchGuilds = useCallback(async () => {
    try {
      setIsLoadingGuilds(true);
      const { data } = await api.get('/auth/guilds');
      setGuilds(data);
      if (data.length > 0) {
        const saved = localStorage.getItem('selected_server_id');
        const stillValid = saved && data.some((g) => g.id === saved);
        if (!stillValid) setSelectedServerId(data[0].id);
        else setSelectedServerIdState(saved);
      } else {
        setSelectedServerId(null);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('[auth] Failed to fetch guilds:', err);
        toast.error('Failed to load servers from Discord');
      }
    } finally {
      setIsLoadingGuilds(false);
    }
  }, [setSelectedServerId]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token);
      if (!hasFetchedOnceRef.current) {
        hasFetchedOnceRef.current = true;
        fetchGuilds();
      }
    } else {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_data');
      setGuilds([]);
      setSelectedServerIdState(null);
    }
  }, [token, fetchGuilds]);

  const login = useCallback((newToken, userData) => {
    setToken(newToken);
    if (userData) {
      setUser(userData);
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
    hasFetchedOnceRef.current = false;
  }, []);

  const contextValue = {
    token,
    user,
    guilds,
    selectedServerId,
    setSelectedServerId,
    isLoadingGuilds,
    refreshGuilds: fetchGuilds,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
