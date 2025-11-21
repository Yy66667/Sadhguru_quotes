import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { date, acrossYears } = await req.json();

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const d = new Date(date);
    const month = d.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const day = String(d.getDate()).padStart(2, "0");

    /* -------------------------------------------
       SINGLE-DAY MODE
    --------------------------------------------*/
    if (!acrossYears) {
      const year = d.getFullYear();
      const formatted = `${month}-${day}-${year}`;
      const url = `https://isha.sadhguru.org/en/wisdom/quotes/date/${formatted}`;

      try {
        const html = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          cache: "no-store",
        }).then((r) => r.text());

        const $ = cheerio.load(html);
        const scriptTags = $("script[type='application/json']");

        let foundQuote = "";

        scriptTags.each((_, el) => {
          const jsonText = $(el).html();
          if (!jsonText) return;

          const data = JSON.parse(jsonText);
          const summary =
            data?.props?.pageProps?.pageDataDetail?.summary?.[0]?.value ||
            data?.pageDataDetail?.summary?.[0]?.value;

          if (summary) foundQuote = summary.trim();
        });

        if (!foundQuote) {
          return NextResponse.json({ quote: "" });
        }

        return NextResponse.json({
          quote: foundQuote,
          url,
        });
      } catch (_) {
        return NextResponse.json({ quote: "" });
      }
    }

    /* -------------------------------------------
       ACROSS-YEARS MODE
    --------------------------------------------*/
    const startYear = 2014;
    const endYear = 2025;

    const results: { year: number; quote: string; url: string }[] = [];

    for (let year = startYear; year <= endYear; year++) {
      const formatted = `${month}-${day}-${year}`;
      const url = `https://isha.sadhguru.org/en/wisdom/quotes/date/${formatted}`;

      try {
        const html = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          cache: "no-store",
        }).then((r) => r.text());

        const $ = cheerio.load(html);
        const scriptTags = $("script[type='application/json']");

        let foundQuote = "";

        scriptTags.each((_, el) => {
          const jsonText = $(el).html();
          if (!jsonText) return;

          const data = JSON.parse(jsonText);
          const summary =
            data?.props?.pageProps?.pageDataDetail?.summary?.[0]?.value ||
            data?.pageDataDetail?.summary?.[0]?.value;

          if (summary) foundQuote = summary.trim();
        });

        if (foundQuote) {
          results.push({
            year,
            quote: foundQuote,
            url,
          });
        }
      } catch (_) {}
    }

    return NextResponse.json({ quotes: results });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal error", detail: String(error) },
      { status: 500 }
    );
  }
}
