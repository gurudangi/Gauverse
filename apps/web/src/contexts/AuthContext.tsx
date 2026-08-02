import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
  type AuthUser,
} from "../lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  permissions: string[];
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateProfile: (input: { name?: string; phone?: string }) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(
    (payload: {
      user: AuthUser;
      permissions: string[];
      accessToken: string;
      refreshToken: string;
    }) => {
      setTokens(payload.accessToken, payload.refreshToken);
      setUser(payload.user);
      setPermissions(payload.permissions);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const access = getAccessToken();
      const refresh = getRefreshToken();
      if (!access && !refresh) {
        setLoading(false);
        return;
      }

      try {
        if (access) {
          const me = await api.me();
          if (!cancelled && me.data) {
            setUser(me.data.user);
            setPermissions(me.data.permissions);
            return;
          }
        }
      } catch {
        // try refresh below
      }

      if (refresh) {
        try {
          const refreshed = await api.refresh(refresh);
          if (!cancelled && refreshed.data) {
            applySession(refreshed.data);
            return;
          }
        } catch {
          clearTokens();
        }
      } else {
        clearTokens();
      }
    }

    void bootstrap().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [applySession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login({ email, password });
      if (!res.data) throw new Error("Login failed");
      applySession(res.data);
      return res.data.user;
    },
    [applySession],
  );

  const register = useCallback(
    async (input: { name: string; email: string; phone?: string; password: string }) => {
      const res = await api.register(input);
      if (!res.data) throw new Error("Registration failed");
      applySession(res.data);
      return res.data.user;
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // still clear local session
    }
    clearTokens();
    setUser(null);
    setPermissions([]);
  }, []);

  const updateProfile = useCallback(async (input: { name?: string; phone?: string }) => {
    const res = await api.updateProfile(input);
    if (!res.data?.user) throw new Error("Profile update failed");
    setUser(res.data.user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      permissions,
      loading,
      login,
      register,
      logout,
      updateProfile,
      hasPermission: (permission: string) => permissions.includes(permission),
    }),
    [user, permissions, loading, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
