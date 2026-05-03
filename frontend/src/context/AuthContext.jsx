import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";
import axios from "axios";

const AuthContext = createContext();

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const DEFAULT_TENANT_SLUG = import.meta.env.VITE_DEFAULT_TENANT_SLUG || "demo";
const AUTH_STORAGE_KEY = "ig_auth_state";

const authApi = axios.create({
  baseURL: API_BASE_URL,
});

const normalizeUser = (payload, email) => ({
  id: payload.userId,
  username: payload.username,
  avatar: payload.avatar,
  email: email || payload.email || "",
  token: payload.token,
  tenant: payload.tenant,
});

const persistAuthState = (authState) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  localStorage.setItem("ig_current_user", authState.id);
  authApi.defaults.headers.common.Authorization = `Bearer ${authState.token}`;
};

const clearAuthState = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("ig_current_user");
  delete authApi.defaults.headers.common.Authorization;
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        if (parsedAuth?.token) {
          setCurrentUser(parsedAuth);
          authApi.defaults.headers.common.Authorization = `Bearer ${parsedAuth.token}`;
        }
      } catch {
        clearAuthState();
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.post(
        "/api/auth/login",
        {
          email,
          password,
          tenantSlug: DEFAULT_TENANT_SLUG,
        },
        {
          headers: {
            "x-tenant-slug": DEFAULT_TENANT_SLUG,
          },
        },
      );

      const authState = normalizeUser(response.data, email);
      persistAuthState(authState);
      setCurrentUser(authState);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authApi.post(
        "/api/auth/signup",
        {
          email: userData.email,
          username: userData.username,
          password: userData.password,
          tenantSlug: DEFAULT_TENANT_SLUG,
        },
        {
          headers: {
            "x-tenant-slug": DEFAULT_TENANT_SLUG,
          },
        },
      );

      const authState = normalizeUser(response.data, userData.email);
      persistAuthState(authState);
      setCurrentUser(authState);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Signup failed",
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    clearAuthState();
  };

  const value = useMemo(
    () => ({
      currentUser,
      login,
      signup,
      logout,
    }),
    [currentUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
