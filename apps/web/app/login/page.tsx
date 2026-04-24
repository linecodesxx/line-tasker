"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const LoginPage = () => {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, login, logout } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Введите email или имя пользователя и пароль");
      return;
    }

    try {
      setIsLoading(true);

      await login({
        email: form.email.trim(),
        password: form.password,
      });

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-neutral-100">
        <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
          <div className="w-full rounded-lg bg-white p-8 text-center shadow-lg">
            <p className="text-sm text-neutral-500">Проверяем сессию...</p>
          </div>
        </div>
      </main>
    );
  }

  if (user) {
    return (
      <main className="min-h-screen bg-neutral-100">
        <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
          <div className="w-full rounded-lg bg-white p-8 shadow-lg">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-neutral-900">Вы уже вошли</h1>
              <p className="mt-2 text-sm text-neutral-500">
                Сейчас вы вошли как {user.name} ({user.email})
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-white transition hover:bg-neutral-800"
            >
              Выйти
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
        <div className="w-full rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-neutral-900">Вход</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Войдите в аккаунт LineTasker
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Email или имя пользователя
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="rounded-lg border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-neutral-700">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                className="rounded-lg border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
              />
            </div>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 rounded-lg bg-neutral-900 px-4 py-3 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Входим..." : "Войти"}
            </button>
          </form>

          <div className="mt-6 text-sm text-neutral-500">
            Нет аккаунта?{" "}
            <Link href="/register" className="font-medium text-neutral-900 underline">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
