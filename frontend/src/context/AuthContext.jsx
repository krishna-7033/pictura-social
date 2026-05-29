import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";
import axios from "axios";
import { DEFAULT_TENANT_SLUG, resolveApiBaseUrl } from "../utils/apiConfig";

const AuthContext = createContext();

const AUTH_STORAGE_KEY = "ig_auth_state";
const API_BASE_URL = resolveApiBaseUrl();

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

const getAuthErrorMessage = (error, fallbackMessage) => {
  // Prioritize backend-provided message
  const backendMessage = error.response?.data?.message;
  if (backendMessage) return backendMessage;

  // HTTP status available
  const status = error.response?.status;
  const statusText = error.response?.statusText;
  if (status) return `Request failed: ${status} ${statusText || ""}`.trim();

  // Network / CORS errors
  if (error.code === "ERR_NETWORK" || /Network Error/i.test(error.message)) {
    return API_BASE_URL
      ? `Cannot reach the backend at ${API_BASE_URL}. Check the Render URL, DNS, and CORS settings.`
      : "Cannot reach the backend from this deployment. Set VITE_API_BASE_URL or add a Vercel rewrite to /api.";
  }

  // Fallback to axios error message or provided fallback
  return error.message || fallbackMessage;
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
        "/auth/login",
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
      console.error("Auth login error:", error);
      return {
        success: false,
        message: getAuthErrorMessage(error, "Login failed"),
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authApi.post(
        "/auth/signup",
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
      console.error("Auth signup error:", error);
      return {
        success: false,
        message: getAuthErrorMessage(error, "Signup failed"),
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
