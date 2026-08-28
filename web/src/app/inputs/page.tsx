"use client";

import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { API_BASE_URL } from "../apiConfig";

type Recommendation = {
  fertilizer: {
    crop: string;
    growth_stage: string;
    soil_type: string;
    area_acres: number;
    nitrogen_kg: number;
    phosphorus_kg: number;
    potassium_kg: number;
  };
  irrigation: {
    recommendation: "skip_irrigation" | "light_irrigation" | "irrigate_now";
    reason: string;
    total_rain_mm_next_5_days: number;
    avg_max_temp_c: number | null;
    forecast: { date: string; rain_mm: number; max_temp_c: number }[];
  };
};

export default function InputsPage() {
  const { t } = useLanguage();
  const [crop, setCrop] = useState("Wheat");
  const [growthStage, setGrowthStage] = useState("sowing");
  const [soilType, setSoilType] = useState("loamy");
  const [areaAcres, setAreaAcres] = useState("1");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [result, setResult] = useState<Recommendation | null>(null);
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
        body: JSON.stringify({ module: "inputs", summary, detail }),
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
      growth_stage: growthStage,
      soil_type: soilType,
      area_acres: areaAcres,
      latitude,
      longitude,
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/inputs/recommendation?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Something went wrong");
      } else {
        setResult(data);

        const irrigationLabel =
          data.irrigation.recommendation === "irrigate_now"
            ? "Irrigate now"
            : data.irrigation.recommendation === "light_irrigation"
            ? "Light irrigation"
            : "Skip irrigation";
        const summary = `${crop} (${growthStage}) — ${irrigationLabel}, ${data.fertilizer.nitrogen_kg}kg N recommended`;
        logActivity(summary, data.irrigation.recommendation);
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
        <h1 className="text-3xl font-bold text-navy">{t("inputsPageTitle")}</h1>
        <p className="mt-2 text-navy-light/70">{t("inputsPageSubtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 rounded-lg bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-navy">{t("cropLabel")}</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="mt-1 w-full rounded-md border border-navy/20 px-4 py-2 text-navy outline-none focus:border-saffron"
              >
                <option value="Wheat">Wheat</option>
                <option value="Rice">Rice</option>
                <option value="Maize">Maize</option>
                <option value="Cotton">Cotton</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-navy">{t("growthStageLabel")}</label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="mt-1 w-full rounded-md border border-navy/20 px-4 py-2 text-navy outline-none focus:border-saffron"
              >
                <option value="sowing">Sowing</option>
                <option value="tillering">Tillering</option>
                <option value="flowering">Flowering</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-navy">{t("soilTypeLabel")}</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="mt-1 w-full rounded-md border border-navy/20 px-4 py-2 text-navy outline-none focus:border-saffron"
              >
                <option value="sandy">Sandy</option>
                <option value="loamy">Loamy</option>
                <option value="clay">Clay</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-navy">{t("areaLabel")}</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={areaAcres}
                onChange={(e) => setAreaAcres(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-navy/20 px-4 py-2 text-navy outline-none focus:border-saffron"
              />
            </div>
          </div>

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
            {loading ? t("calculating") : t("getRecommendation")}
          </button>
        </form>

        {result && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-navy">{t("fertilizerRecommendation")}</h2>
              <p className="mt-1 text-xs text-navy-light/50">
                {result.fertilizer.crop} · {result.fertilizer.growth_stage} · {result.fertilizer.soil_type} soil · {result.fertilizer.area_acres} acres
              </p>
              <div className="mt-4 flex flex-col gap-2 text-sm">
                <NutrientRow label="Nitrogen (N)" value={result.fertilizer.nitrogen_kg} />
                <NutrientRow label="Phosphorus (P)" value={result.fertilizer.phosphorus_kg} />
                <NutrientRow label="Potassium (K)" value={result.fertilizer.potassium_kg} />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-navy">{t("irrigationRecommendation")}</h2>
              <IrrigationBadge
                recommendation={result.irrigation.recommendation}
                irrigateNowLabel={t("irrigateNow")}
                lightLabel={t("lightIrrigation")}
                skipLabel={t("skipIrrigation")}
              />
              <p className="mt-3 text-sm text-navy-light/70">{result.irrigation.reason}</p>
              <p className="mt-2 text-xs text-navy-light/50">
                5-day rain total: {result.irrigation.total_rain_mm_next_5_days}mm · Avg max temp: {result.irrigation.avg_max_temp_c}°C
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NutrientRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-navy/5 pb-2">
      <span className="text-navy-light/70">{label}</span>
      <span className="font-semibold text-navy">{value} kg</span>
    </div>
  );
}

function IrrigationBadge({ recommendation, irrigateNowLabel, lightLabel, skipLabel }: { recommendation: string; irrigateNowLabel: string; lightLabel: string; skipLabel: string }) {
  if (recommendation === "irrigate_now") {
    return <span className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">{irrigateNowLabel}</span>;
  }
  if (recommendation === "light_irrigation") {
    return <span className="mt-2 inline-block rounded-full bg-saffron/10 px-3 py-1 text-xs font-semibold text-saffron-dark">{lightLabel}</span>;
  }
  return <span className="mt-2 inline-block rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">{skipLabel}</span>;
}