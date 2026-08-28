"use client";

import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { API_BASE_URL } from "../apiConfig";

type PriceRecord = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  msp: number | null;
  comparison: "above_msp" | "below_msp" | "equal_to_msp" | null;
};

export default function PricesPage() {
  const { t } = useLanguage();
  const [state, setState] = useState("");
  const [commodity, setCommodity] = useState("");
  const [results, setResults] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function logActivity(summary: string, detail?: string) {
    const token = localStorage.getItem("krishisarthi_token");
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/activity/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ module: "prices", summary, detail }),
      });
    } catch {
      // Silent fail
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);

    const params = new URLSearchParams();
    if (state) params.append("state", state);
    if (commodity) params.append("commodity", commodity);
    params.append("limit", "20");

    try {
      const res = await fetch(`${API_BASE_URL}/api/prices/live?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Something went wrong");
        setResults([]);
      } else {
        setResults(data.results);

        if (data.results.length > 0) {
          const top = data.results[0];
          const summary = `Checked ${top.commodity} — ₹${top.modal_price} at ${top.market}`;
          logActivity(summary, top.comparison || undefined);
        }
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-offwhite px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-navy">{t("pricesPageTitle")}</h1>
        <p className="mt-2 text-navy-light/70">{t("pricesPageSubtitle")}</p>

        <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-4 rounded-lg bg-white p-6 shadow-sm sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-navy">{t("stateLabel")}</label>
            <input
              type="text"
              placeholder="e.g. Gujarat"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="mt-1 w-full rounded-md border border-navy/20 px-4 py-2 text-navy outline-none focus:border-saffron"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-navy">{t("commodityLabel")}</label>
            <input
              type="text"
              placeholder="e.g. Wheat"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="mt-1 w-full rounded-md border border-navy/20 px-4 py-2 text-navy outline-none focus:border-saffron"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-saffron px-6 py-2 font-semibold text-navy hover:bg-saffron-dark disabled:opacity-60"
          >
            {loading ? t("searching") : t("searchButton")}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {searched && !loading && !error && results.length === 0 && (
          <p className="mt-8 text-navy-light/60">{t("noResultsFound")}</p>
        )}

        {results.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-navy/10 text-navy-light/60">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("marketColumn")}</th>
                  <th className="px-4 py-3 font-medium">{t("commodityColumn")}</th>
                  <th className="px-4 py-3 font-medium">{t("modalPriceColumn")}</th>
                  <th className="px-4 py-3 font-medium">{t("mspColumn")}</th>
                  <th className="px-4 py-3 font-medium">{t("statusColumn")}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-navy/5 last:border-0">
                    <td className="px-4 py-3 text-navy">
                      {r.market}
                      <div className="text-xs text-navy-light/50">{r.district}, {r.state}</div>
                    </td>
                    <td className="px-4 py-3 text-navy">
                      {r.commodity}
                      <div className="text-xs text-navy-light/50">{r.variety}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy">₹{r.modal_price}</td>
                    <td className="px-4 py-3 text-navy-light/70">{r.msp ? `₹${r.msp}` : "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        comparison={r.comparison}
                        aboveLabel={t("aboveMsp")}
                        belowLabel={t("belowMsp")}
                        atLabel={t("atMsp")}
                        noneLabel={t("noMspData")}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ comparison, aboveLabel, belowLabel, atLabel, noneLabel }: { comparison: PriceRecord["comparison"]; aboveLabel: string; belowLabel: string; atLabel: string; noneLabel: string }) {
  if (comparison === "above_msp") {
    return <span className="rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">{aboveLabel}</span>;
  }
  if (comparison === "below_msp") {
    return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">{belowLabel}</span>;
  }
  if (comparison === "equal_to_msp") {
    return <span className="rounded-full bg-saffron/10 px-3 py-1 text-xs font-semibold text-saffron-dark">{atLabel}</span>;
  }
  return <span className="text-xs text-navy-light/40">{noneLabel}</span>;
}