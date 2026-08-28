"use client";

import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { API_BASE_URL } from "../apiConfig";

type RiskResult = {
  crop: string;
  days_since_harvest: number;
  has_cold_storage: boolean;
  current_temp_c: number | null;
  estimated_shelf_life_days: number;
  days_remaining: number;
  risk_level: "low" | "medium" | "high" | "critical";
};

export default function StoragePage() {
  const { t } = useLanguage();
  const [crop, setCrop] = useState("Tomato");
  const [harvestDate, setHarvestDate] = useState("");
  const [hasColdStorage, setHasColdStorage] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location access.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toString());
        setLongitude(pos.coords.longitude.toString());
      },
      () => setError("Could not get your location. Enter latitude/longitude manually.")
    );
  }

  async function logActivity(summary: string, detail?: string) {
    const token = localStorage.getItem("krishisarthi_token");
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/activity/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ module: "storage", summary, detail }),
      });
    } catch {
      // Silent fail
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    const params = new URLSearchParams({
      crop,
      harvest_date: harvestDate,
      has_cold_storage: hasColdStorage.toString(),
      latitude,
      longitude,
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/storage/risk?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Something went wrong");
      } else {
        setResult(data);

        const summary = `${crop} — ${data.risk_level} spoilage risk (${data.days_remaining} days remaining)`;
        logActivity(summary, data.risk_level);
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-offwhite px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-navy">{t("storagePageTitle")}</h1>
        <p className="mt-2 text-navy-light/70">{t("storagePageSubtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 rounded-lg bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-navy">{t("cropLabel")}</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="mt-1 w-full rounded-md border border-navy/20 px-4 py-2 text-navy outline-none focus:border-saffron"
              >
                <option value="Tomato">Tomato</option>
                <option value="Onion">Onion</option>
                <option value="Potato">Potato</option>
                <option value="Banana">Banana</option>
                <option value="Mango">Mango</option>
                <option value="Leafy Greens">Leafy Greens</option>
                <option value="Cabbage">Cabbage</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-navy">{t("harvestDateLabel")}</label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-navy/20 px-4 py-2 text-navy outline-none focus:border-saffron"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-navy">
            <input
              type="checkbox"
              checked={hasColdStorage}
              onChange={(e) => setHasColdStorage(e.target.checked)}
              className="h-4 w-4 rounded border-navy/30"
            />
            {t("hasColdStorageLabel")}
          </label>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-navy">{t("yourLocation")}</label>
              <button type="button" onClick={useMyLocation} className="text-xs font-semibold text-chakra hover:underline">
                {t("useMyLocation")}
              </button>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
                className="rounded-md border border-navy/20 px-4 py-2 text-navy outline-none focus:border-saffron"
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
                className="rounded-md border border-navy/20 px-4 py-2 text-navy outline-none focus:border-saffron"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-saffron px-6 py-2 font-semibold text-navy hover:bg-saffron-dark disabled:opacity-60"
          >
            {loading ? t("checking") : t("checkSpoilageRisk")}
          </button>
        </form>

        {result && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-navy">{result.crop}</h2>
              <RiskBadge
                level={result.risk_level}
                lowLabel={t("riskLow")}
                mediumLabel={t("riskMedium")}
                highLabel={t("riskHigh")}
                criticalLabel={t("riskCritical")}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label={t("daysSinceHarvest")} value={result.days_since_harvest.toString()} />
              <Stat label={t("estShelfLife")} value={`${result.estimated_shelf_life_days} days`} />
              <Stat label={t("daysRemaining")} value={result.days_remaining.toString()} />
              <Stat label={t("currentTemp")} value={result.current_temp_c !== null ? `${result.current_temp_c}°C` : "—"} />
            </div>

            <p className="mt-5 text-sm text-navy-light/70">
              {result.has_cold_storage ? t("hasStorageNote") : t("noStorageNote")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-navy-light/50">{label}</p>
      <p className="mt-1 text-lg font-bold text-navy">{value}</p>
    </div>
  );
}

function RiskBadge({ level, lowLabel, mediumLabel, highLabel, criticalLabel }: { level: "low" | "medium" | "high" | "critical"; lowLabel: string; mediumLabel: string; highLabel: string; criticalLabel: string }) {
  const styles: Record<string, string> = {
    low: "bg-green/10 text-green",
    medium: "bg-saffron/10 text-saffron-dark",
    high: "bg-orange-100 text-orange-600",
    critical: "bg-red-100 text-red-600",
  };
  const labels: Record<string, string> = {
    low: lowLabel,
    medium: mediumLabel,
    high: highLabel,
    critical: criticalLabel,
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}