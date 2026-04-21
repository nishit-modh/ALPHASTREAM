import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, getToken, setToken, removeToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    authApi.getProfile()
      .then((res) => setUser(res.data))
      .catch(() => removeToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res;
  }, []);

  const register = useCallback(async (email, password, role) => {
    const res = await authApi.register({ email, password, role });
    setToken(res.data.token);
    setUser(res.data.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
