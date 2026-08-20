"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, register, logout } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      setError("Заполните все поля");
      return;
    }

    if (form.password.length < 6) {
      setError("Пароль должен быть не короче 6 символов");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      setIsLoading(true);

      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      router.push("/workspaces");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
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
            <h1 className="text-3xl font-bold text-neutral-900">Регистрация</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Создайте аккаунт в LineTasker
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-neutral-700">
                Имя пользователя
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="username"
                placeholder="your_name"
                value={form.name}
                onChange={handleChange}
                className="rounded-lg border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
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
                autoComplete="new-password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                className="rounded-lg border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-neutral-700"
              >
                Повторите пароль
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="********"
                value={form.confirmPassword}
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
              {isLoading ? "Создаем аккаунт..." : "Зарегистрироваться"}
            </button>
          </form>

          <div className="mt-6 text-sm text-neutral-500">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-neutral-900 underline">
              Войти
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
