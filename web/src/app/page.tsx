"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { API_BASE_URL } from "./apiConfig";

export default function Home() {
  const { language, toggleLanguage, t } = useLanguage();
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "healthy") {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      })
      .catch(() => setBackendStatus("offline"));
  }, []);

  const backendLabel =
    backendStatus === "online" ? t("backendOnline") : backendStatus === "offline" ? t("backendOffline") : t("backendChecking");

  return (
    <div className="flex min-h-screen flex-col bg-offwhite">
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-saffron" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-green" />
      </div>

      <header className="bg-navy text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight">
            Krishi<span className="text-saffron">Sarthi</span>
          </span>
          <div className="hidden gap-8 text-sm font-medium text-white/80 md:flex">
            <Link className="hover:text-white" href="/pest">{t("navPest")}</Link>
            <Link className="hover:text-white" href="/prices">{t("navPrices")}</Link>
            <Link className="hover:text-white" href="/inputs">{t("navInputs")}</Link>
            <Link className="hover:text-white" href="/storage">{t("navStorage")}</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs text-white/70">
              <span className={`h-2 w-2 rounded-full ${backendStatus === "online" ? "bg-green" : backendStatus === "offline" ? "bg-red-500" : "bg-white/40"}`} />
              {backendLabel}
            </span>
            <Link href="/login" className="rounded-md bg-saffron px-4 py-2 text-sm font-semibold text-navy hover:bg-saffron-dark">
              {t("getStarted")}
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-navy md:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-navy-light/80">
          {t("heroSubtitle")}
        </p>

        <div className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ModuleCard href="/pest" color="saffron" title={t("cardPestTitle")} desc={t("cardPestDesc")} />
          <ModuleCard href="/inputs" color="green" title={t("cardInputsTitle")} desc={t("cardInputsDesc")} />
          <ModuleCard href="/prices" color="chakra" title={t("cardPricesTitle")} desc={t("cardPricesDesc")} />
          <ModuleCard href="/storage" color="navy" title={t("cardStorageTitle")} desc={t("cardStorageDesc")} />
        </div>
      </main>

      <footer className="bg-navy py-6 text-center text-sm text-white/60">
        {t("footerText")}
      </footer>
    </div>
  );
}

function ModuleCard({ href, color, title, desc }: { href: string; color: "saffron" | "green" | "chakra" | "navy"; title: string; desc: string }) {
  const colorMap: Record<string, string> = {
    saffron: "border-t-saffron",
    green: "border-t-green",
    chakra: "border-t-chakra",
    navy: "border-t-navy",
  };

  return (
    <Link href={href} className={`rounded-lg border-t-4 ${colorMap[color]} bg-white p-6 text-left shadow-sm block hover:shadow-md transition-shadow`}>
      <h3 className="font-semibold text-navy">{title}</h3>
      <p className="mt-2 text-sm text-navy-light/70">{desc}</p>
    </Link>
  );
}