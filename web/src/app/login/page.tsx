"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../LanguageContext";
import { API_BASE_URL } from "../apiConfig";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
        if (mode === "signup" && !agreed) {
      setError("Please confirm you are 18 or older and accept the Terms and Privacy Policy.");
      return;
    }
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const body =
      mode === "login"
        ? { email, password }
        : { name, email, password };

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Something went wrong");
        setLoading(false);
        return;
      }

      localStorage.setItem("krishisarthi_token", data.access_token);
      localStorage.setItem("krishisarthi_user", JSON.stringify(data.user));

      window.location.href = "/dashboard";
    } catch {
      setError("Could not reach the server. Is the backend running?");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-offwhite px-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-navy">
          Krishi<span className="text-saffron">Sarthi</span>
        </h1>

        {/* Login / Sign Up toggle */}
        <div className="mt-6 flex rounded-md border border-navy/20">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-l-md py-2 text-sm font-semibold ${
              mode === "login" ? "bg-navy text-white" : "text-navy"
            }`}
          >
            {t("loginTitle")}
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-r-md py-2 text-sm font-semibold ${
              mode === "signup" ? "bg-navy text-white" : "text-navy"
            }`}
          >
            {t("signupTitle")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {mode === "signup" && (
            <input
              type="text"
              placeholder={t("fullNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-md border border-navy/20 px-4 py-2 text-navy outline-none focus:border-saffron"
            />
          )}
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-md border border-navy/20 px-4 py-2 text-navy outline-none focus:border-saffron"
          />
          <input
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="rounded-md border border-navy/20 px-4 py-2 text-navy outline-none focus:border-saffron"
          />

          {mode === "signup" && (
            <label className="flex items-start gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1"
              />
              <span>
                I am 18 or older and I accept the{" "}
                <Link href="/terms" target="_blank" className="underline">Terms</Link> and{" "}
                <Link href="/privacy" target="_blank" className="underline">Privacy Policy</Link>.
              </span>
            </label>
          )}
          
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-saffron py-2 font-semibold text-navy hover:bg-saffron-dark disabled:opacity-60"
          >
            {loading ? t("pleaseWait") : mode === "login" ? t("loginButton") : t("createAccountButton")}
          </button>
        </form>
      </div>
    </div>
  );
}