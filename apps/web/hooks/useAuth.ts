"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UseAuthOptions = {
  redirectIfUnauthenticated?: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: string;
};

type AuthResponse = {
  access_token: string;
  user: User;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  name: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
export const AUTH_TOKEN_KEY = "line-tasker-token";

async function parseError(response: Response) {
  const fallback = "Ошибка авторизации";

  try {
    const data = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(data.message)) {
      return data.message.join(", ");
    }

    return data.message ?? fallback;
  } catch {
    return fallback;
  }
}

export function useAuth(options?: UseAuthOptions) {
  const router = useRouter();
  const redirectIfUnauthenticated = options?.redirectIfUnauthenticated;

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saveSession = useCallback((data: AuthResponse) => {
    localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
    setUser(data.user);
  }, []);

  const requestAuth = useCallback(
    async (path: string, payload: LoginPayload | RegisterPayload) => {
      setError(null);

      const response = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseError(response);
        setError(message);
        throw new Error(message);
      }

      const data = (await response.json()) as AuthResponse;
      saveSession(data);
      return data.user;
    },
    [saveSession],
  );

  const login = useCallback(
    (payload: LoginPayload) => requestAuth("/auth/login", payload),
    [requestAuth],
  );

  const register = useCallback(
    (payload: RegisterPayload) => requestAuth("/auth/register", payload),
    [requestAuth],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      queueMicrotask(() => {
        setIsLoading(false);
      });

      if (redirectIfUnauthenticated) {
        router.replace(redirectIfUnauthenticated);
      }

      return;
    }

    let cancelled = false;

    async function loadUser() {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          throw new Error(await parseError(response));
        }

        const data = (await response.json()) as User;

        if (!cancelled) {
          setUser(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setUser(null);
          setError(err instanceof Error ? err.message : "Ошибка авторизации");

          if (redirectIfUnauthenticated) {
            router.replace(redirectIfUnauthenticated);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [redirectIfUnauthenticated, router]);

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
