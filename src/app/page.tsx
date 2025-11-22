"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Share2, Copy } from "lucide-react";

export default function HomePage() {
  const [date, setDate] = useState("");
  const [acrossYears, setAcrossYears] = useState(false);

  const [singleQuote, setSingleQuote] = useState("");
  const [singleUrl, setSingleUrl] = useState("");

  const [quotes, setQuotes] = useState<
    { year: number; quote: string; url: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const [copiedSingle, setCopiedSingle] = useState(false);
  const [copiedTimeline, setCopiedTimeline] = useState<number | null>(null);

  /* ------------------------------------------------
       FETCH QUOTE
  -------------------------------------------------- */
  async function fetchQuote() {
    if (!date) return;

    setLoading(true);
    setFetched(false);
    setSingleQuote("");
    setSingleUrl("");
    setQuotes([]);

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        body: JSON.stringify({ date, acrossYears }),
      });

      const data = await res.json();
      setLoading(false);
      setFetched(true);

      if (acrossYears) {
        if (data.quotes) setQuotes(data.quotes);
      } else {
        if (data.quote) setSingleQuote(data.quote);
        if (data.url) setSingleUrl(data.url);
      }

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch {
      setLoading(false);
      setFetched(true);
    }
  }

  /* ------------------------------------------------
     EFFECT 1 — Initialize state only once
  -------------------------------------------------- */
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    setAcrossYears(false);
  }, []);

  /* ------------------------------------------------
     EFFECT 2 — Fetch AFTER initial state is ready
  -------------------------------------------------- */
  useEffect(() => {
    if (date) fetchQuote();
  }, [date, acrossYears]);

  /* ------------------------------------------------
     RENDER
  -------------------------------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black to-slate-700 p-6">
      <Card className="w-full max-w-xl shadow-xl border border-slate-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Sadhguru Quote Finder
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select a Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between mt-4 p-3 rounded-xl bg-white shadow-sm border">
            <span className="text-sm font-medium">Search Across Years (2014 → Present)</span>

            <div className="relative">
              <Switch
                id="across-years"
                checked={acrossYears}
                onCheckedChange={setAcrossYears}
                className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-slate-300"
              />
              {acrossYears && (
                <div className="absolute inset-0 rounded-full blur-md bg-emerald-300 opacity-30 pointer-events-none"></div>
              )}
            </div>
          </div>

          <Button onClick={fetchQuote} disabled={loading} className="w-full py-3 text-[17px]">
            {loading ? "Fetching..." : acrossYears ? "Get Quotes Across Years" : "Get Quote for This Date"}
          </Button>

          <div ref={resultsRef} />

          {/* Loading */}
          {loading && (
            <>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </>
          )}

          {/* SINGLE QUOTE */}
          {!loading && fetched && !acrossYears && singleQuote && (
            <div className="mt-4 bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xl italic leading-relaxed">
                <span className="text-3xl text-slate-400">“</span>
                {singleQuote}
                <span className="text-3xl text-slate-400">”</span>
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(singleQuote);
                    setCopiedSingle(true);
                    setTimeout(() => setCopiedSingle(false), 1500);
                  }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg border text-sm ${
                    copiedSingle
                      ? "text-green-600 border-green-600 bg-green-50"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Copy size={16} />
                  {copiedSingle ? "Copied!" : "Copy"}
                </button>

                <a
                  href={singleUrl}
                  target="_blank"
                  className="flex items-center gap-1 text-sm px-3 py-1 rounded-lg border text-blue-600 hover:bg-blue-50"
                >
                  <Share2 size={16} />
                  Source
                </a>
              </div>
            </div>
          )}

          {/* TIMELINE QUOTES */}
          {!loading && fetched && acrossYears && quotes.length > 0 && (
            <div className="relative border-l border-slate-300 ml-4 mt-6 space-y-6">
              {quotes.map((item) => (
                <div key={item.year} className="relative pl-6">
                  <div className="absolute -left-[7px] w-3 h-3 bg-indigo-500 rounded-full shadow-lg" />
                  <p className="text-xs font-semibold text-slate-500">{item.year}</p>

                  <p className="text-lg bg-white p-4 italic leading-relaxed rounded-xl border shadow-sm">
                    {item.quote}
                  </p>

                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.quote);
                        setCopiedTimeline(item.year);
                        setTimeout(() => setCopiedTimeline(null), 1500);
                      }}
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg border ${
                        copiedTimeline === item.year
                          ? "text-green-600 border-green-600 bg-green-50"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Copy size={14} />
                      {copiedTimeline === item.year ? "Copied!" : "Copy"}
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border text-blue-600 hover:bg-blue-50"
                    >
                      <Share2 size={14} />
                      Source
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {fetched &&
            !loading &&
            ((acrossYears && quotes.length === 0) || (!acrossYears && singleQuote === "")) && (
              <p className="text-center text-slate-500 mt-4">No quotes found for that date.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
