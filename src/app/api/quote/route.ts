import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { connectDB } from "@/lib/db";
import Quote from "@/app/models/Quote";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { date, acrossYears } = await req.json();

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const d = new Date(date);
    const month = d.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const day = String(d.getDate()).padStart(2, "0");

    /* #############################################################
       SINGLE DAY MODE
    ###############################################################*/
    if (!acrossYears) {
      const year = d.getFullYear();

      // 1. CHECK DB
      const existing = await Quote.findOne({ month, day, year });
      if (existing) {
        return NextResponse.json({
          quote: existing.quote,
          url: existing.url,
        });
      }

      // 2. SCRAPE
      const formatted = `${month}-${day}-${year}`;
      const url = `https://isha.sadhguru.org/en/wisdom/quotes/date/${formatted}`;

      const quote = await scrapeQuote(url);
      if (!quote) {
        return NextResponse.json({ quote: "" });
      }

      // 3. SAVE TO DB
      await Quote.create({
        month,
        day,
        year,
        quote,
        url,
      });

      // 4. RETURN
      return NextResponse.json({ quote, url });
    }

    /* #############################################################
       ACROSS YEARS MODE (2014 - 2025)
    ###############################################################*/

    const startYear = 2014;
    const endYear = 2025;

    let results: any[] = [];

    // 1. GET FROM DB FIRST
    const existingQuotes = await Quote.find({ month, day });

    const existingYears = new Set(existingQuotes.map((q: any) => q.year));

    results = [...existingQuotes].map((q: any) => ({
      year: q.year,
      quote: q.quote,
      url: q.url,
    }));

    // 2. SCRAPE ONLY MISSING YEARS
    const missingYears = [];
    for (let year = startYear; year <= endYear; year++) {
      if (!existingYears.has(year)) missingYears.push(year);
    }

    for (const year of missingYears) {
      const formatted = `${month}-${day}-${year}`;
      const url = `https://isha.sadhguru.org/en/wisdom/quotes/date/${formatted}`;

      const quote = await scrapeQuote(url);
      if (!quote) continue;

      // SAVE
      await Quote.create({ month, day, year, quote, url });

      // PUSH TO RESULTS
      results.push({ year, quote, url });
    }

    // 3. SORT RESULTS BY YEAR
    results.sort((a, b) => a.year - b.year);

    return NextResponse.json({ quotes: results });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal error", detail: String(error) },
      { status: 500 }
    );
  }
}

/* #############################################################
   SCRAPER FUNCTION
###############################################################*/
async function scrapeQuote(url: string): Promise<string | null> {
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

    return foundQuote || null;
  } catch (e) {
    return null;
  }
}
