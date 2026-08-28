"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../LanguageContext";
import { API_BASE_URL } from "../apiConfig";

type User = {
  id: number;
  name: string;
  email: string;
};

type Activity = {
  id: number;
  module: string;
  summary: string;
  detail: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("krishisarthi_token");
    const storedUser = localStorage.getItem("krishisarthi_user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(storedUser));

    fetch(`${API_BASE_URL}/api/activity/recent`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setActivities(data.activities || []))
      .catch(() => setActivities([]))
      .finally(() => setLoadingActivity(false));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("krishisarthi_token");
    localStorage.removeItem("krishisarthi_user");
    router.push("/login");
  }

  function timeAgo(dateString: string) {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const latestByModule = (moduleName: string) =>
    activities.find((a) => a.module === moduleName);

  const pestAlerts = activities.filter(
    (a) => a.module === "pest" && !a.summary.toLowerCase().includes("healthy")
  ).length;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-offwhite">
        <p className="text-navy-light/70">{t("loadingText")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight">
            Krishi<span className="text-saffron">Sarthi</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/80">{t("hi")}, {user.name}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-white/30 px-3 py-1.5 text-sm text-white hover:bg-white/10"
            >
              {t("logOut")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-bold text-navy">{t("welcomeBack")}, {user.name}</h1>
        <p className="mt-1 text-sm text-navy-light/70">{t("dashboardSubtitle")}</p>

        {/* Top stats row */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t("statPestAlerts")}
            value={loadingActivity ? "…" : pestAlerts.toString()}
            color="saffron"
            note={pestAlerts > 0 ? t("checkPestModule") : t("noThreatsDetected")}
          />
          <StatCard
            label={t("statPriceCheck")}
            value={loadingActivity ? "…" : latestByModule("prices") ? "✓" : "—"}
            color="chakra"
            note={latestByModule("prices")?.summary || t("addCropToCompare")}
          />
          <StatCard
            label={t("statIrrigation")}
            value={loadingActivity ? "…" : latestByModule("inputs") ? "✓" : "—"}
            color="green"
            note={latestByModule("inputs")?.summary || t("notScheduledYet")}
          />
          <StatCard
            label={t("statStorage")}
            value={loadingActivity ? "…" : latestByModule("storage") ? "✓" : "—"}
            color="navy"
            note={latestByModule("storage")?.summary || t("noBatchesTracked")}
          />
        </div>

        {/* Module status list */}
        <h2 className="mt-10 text-lg font-semibold text-navy">{t("yourModules")}</h2>
        <div className="mt-4 flex flex-col divide-y divide-navy/10 rounded-lg bg-white shadow-sm">
          <ModuleRow href="/pest" color="saffron" title={t("navPest")} activity={latestByModule("pest")} noDataLabel={t("noDataYet")} />
          <ModuleRow href="/inputs" color="green" title={t("navInputs")} activity={latestByModule("inputs")} noDataLabel={t("noDataYet")} />
          <ModuleRow href="/prices" color="chakra" title={t("navPrices")} activity={latestByModule("prices")} noDataLabel={t("noDataYet")} />
          <ModuleRow href="/storage" color="navy" title={t("navStorage")} activity={latestByModule("storage")} noDataLabel={t("noDataYet")} />
        </div>

        {/* Recent activity */}
        <h2 className="mt-10 text-lg font-semibold text-navy">{t("recentActivity")}</h2>
        <div className="mt-4 rounded-lg bg-white shadow-sm">
          {loadingActivity ? (
            <p className="p-6 text-sm text-navy-light/60">{t("loadingText")}</p>
          ) : activities.length === 0 ? (
            <p className="p-6 text-sm text-navy-light/60">{t("noActivityYet")}</p>
          ) : (
            <div className="flex flex-col divide-y divide-navy/5">
              {activities.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-3 text-sm">
                  <span className="text-navy">{a.summary}</span>
                  <span className="text-xs text-navy-light/50">{timeAgo(a.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, note, color }: { label: string; value: string; note: string; color: "saffron" | "green" | "chakra" | "navy" }) {
  const colorMap: Record<string, string> = {
    saffron: "text-saffron",
    green: "text-green",
    chakra: "text-chakra",
    navy: "text-navy",
  };

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-navy-light/60">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${colorMap[color]}`}>{value}</p>
      <p className="mt-1 truncate text-xs text-navy-light/50">{note}</p>
    </div>
  );
}

function ModuleRow({ href, color, title, activity, noDataLabel }: { href: string; color: "saffron" | "green" | "chakra" | "navy"; title: string; activity?: Activity; noDataLabel: string }) {
  const dotMap: Record<string, string> = {
    saffron: "bg-saffron",
    green: "bg-green",
    chakra: "bg-chakra",
    navy: "bg-navy",
  };

  return (
    <Link href={href} className="flex items-center justify-between px-6 py-4 hover:bg-offwhite/60 transition-colors">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${dotMap[color]}`} />
        <span className="font-medium text-navy">{title}</span>
      </div>
      <span className="max-w-xs truncate text-sm text-navy-light/50">
        {activity ? activity.summary : noDataLabel} →
      </span>
    </Link>
  );
}