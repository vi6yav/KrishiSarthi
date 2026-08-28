"use client";

import { useState, useRef } from "react";
import { useLanguage } from "../LanguageContext";
import { API_BASE_URL } from "../apiConfig";

type Prediction = {
  label: string;
  confidence: number;
};

type DetectionResult = {
  predictions: Prediction[];
  top_label: string;
  top_confidence: number;
  is_healthy: boolean;
};

export default function PestPage() {
  const { t } = useLanguage();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setResult(null);
    setError("");
    setPreview(URL.createObjectURL(selected));
  }

  async function logActivity(summary: string, detail?: string) {
    const token = localStorage.getItem("krishisarthi_token");
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/activity/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ module: "pest", summary, detail }),
      });
    } catch {
      // Silent fail
    }
  }

  async function handleSubmit() {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/pest/detect`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Something went wrong");
      } else {
        setResult(data);

        const readableLabel = data.top_label.replace(/_+/g, " ").trim();
        const summary = data.is_healthy
          ? `Checked a crop leaf — looked healthy (${data.top_confidence}% confidence)`
          : `Detected ${readableLabel} (${data.top_confidence}% confidence)`;

        logActivity(summary, data.top_label);
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  function formatLabel(label: string) {
    return label.replace(/_+/g, " ").trim();
  }

  return (
    <div className="min-h-screen bg-offwhite px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-navy">{t("pestPageTitle")}</h1>
        <p className="mt-2 text-navy-light/70">{t("pestPageSubtitle")}</p>

        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {!preview ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-navy/20 py-16 text-navy-light/60 hover:border-saffron hover:text-saffron"
            >
              <span className="text-4xl">📷</span>
              <span className="mt-3 text-sm font-medium">{t("uploadPrompt")}</span>
              <span className="mt-1 text-xs">{t("uploadFormats")}</span>
            </button>
          ) : (
            <div className="flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Uploaded crop leaf" className="max-h-72 rounded-lg object-contain" />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-navy/20 px-4 py-2 text-sm font-medium text-navy hover:bg-offwhite"
                >
                  {t("chooseDifferentPhoto")}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="rounded-md bg-saffron px-4 py-2 text-sm font-semibold text-navy hover:bg-saffron-dark disabled:opacity-60"
                >
                  {loading ? t("analyzing") : t("checkForDisease")}
                </button>
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        {result && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-navy">{t("resultLabel")}</h2>
              <HealthBadge isHealthy={result.is_healthy} healthyLabel={t("healthyLabel")} issueLabel={t("issueDetectedLabel")} />
            </div>

            <div className="mt-4 rounded-md bg-offwhite p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-navy-light/50">{t("topMatch")}</p>
              <p className="mt-1 text-lg font-bold text-navy">{formatLabel(result.top_label)}</p>
              <p className="text-sm text-navy-light/60">{result.top_confidence}% {t("confidence")}</p>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-navy-light/50">{t("otherPossibilities")}</p>
              <div className="mt-2 flex flex-col gap-2">
                {result.predictions.slice(1).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-navy-light/70">{formatLabel(p.label)}</span>
                    <span className="font-medium text-navy">{p.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-5 text-xs text-navy-light/50">{t("aiDisclaimer")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HealthBadge({ isHealthy, healthyLabel, issueLabel }: { isHealthy: boolean; healthyLabel: string; issueLabel: string }) {
  if (isHealthy) {
    return <span className="rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">{healthyLabel}</span>;
  }
  return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">{issueLabel}</span>;
}