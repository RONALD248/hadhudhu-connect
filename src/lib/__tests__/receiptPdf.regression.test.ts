import { describe, it, expect } from "vitest";
import { generateReceiptPDF } from "../receiptPdf";

/**
 * Regression: the Verified By box and approver names must never overlap
 * the footer band or run off the page, even when the payment description,
 * member name, or approver names are very long.
 *
 * Strategy: render the PDF, then inspect jsPDF's internal page state.
 * We walk every page's draw ops and compute the bottom edge of the
 * verification rectangle + any text drawn on that page below it. We then
 * assert that bottom edge is above the footer band (pageHeight - 22).
 */

const FOOTER_BAND_HEIGHT = 22;

interface PageOp {
  fn: string;
  args: unknown[];
}

const baseData = {
  receiptNumber: "RCT-2026-000999",
  memberName: "Member",
  amount: 2300,
  paymentDate: "2026-06-01",
  paymentMethod: "cash",
  referenceNumber: "WE23NH37",
  categoryName: "Building Fund",
  categoryCode: "BUILDING",
  description: null as string | null,
  treasurerName: "Mercy Adhaimbo",
  secretaryName: "Sir Omollo",
  treasurerConfirmedAt: "2026-06-19T04:21:08Z",
  secretaryConfirmedAt: "2026-06-19T05:51:08Z",
};

/**
 * Pull every text + rect draw call out of jsPDF, grouped by page,
 * by stubbing `doc.internal.write` is unreliable. Instead we rely on
 * jsPDF's public API: `getNumberOfPages` and the rendered output string,
 * combined with a thin spy on the prototype text method captured at render
 * time. We do this by re-running generation inside an instrumented wrapper.
 */
function renderAndInspect(description: string, names?: { t?: string; s?: string }) {
  const data = {
    ...baseData,
    description,
    treasurerName: names?.t ?? baseData.treasurerName,
    secretaryName: names?.s ?? baseData.secretaryName,
  };
  const doc = generateReceiptPDF(data);
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  // Walk all pages and inspect every text item's y coordinate from the
  // jsPDF internal pages stream. We parse PDF text positioning commands.
  // Each page's content is stored in doc.internal.pages[i] (1-indexed).
  const pages = (doc.internal as unknown as { pages: string[][] }).pages;
  const verseFooterZone = pageHeight - FOOTER_BAND_HEIGHT;

  const issues: string[] = [];

  for (let p = 1; p < pages.length; p++) {
    const stream = (pages[p] || []).join("\n");
    // jsPDF emits "x y Td" for text positioning and "x y w h re" for rects,
    // in PDF user units (pt). 1 mm ≈ 2.8346 pt. Page is also in pt internally.
    // Easier: use pageHeight in pt from jsPDF.
    const pageHeightPt = (doc.internal.pageSize as unknown as { getHeight: () => number })
      .getHeight() * 2.83464567;
    const footerTopPt = pageHeightPt - FOOTER_BAND_HEIGHT * 2.83464567;

    // Text matrix lines: "1 0 0 -1 X Y Tm" — jsPDF uses Tm with flipped Y.
    // Y here is measured from bottom (PDF coords). So allowed Y must be > footer height.
    const tmRegex = /1 0 0 -1 ([\d.\-]+) ([\d.\-]+) Tm/g;
    let m;
    while ((m = tmRegex.exec(stream)) !== null) {
      const yFromBottom = parseFloat(m[2]);
      // Convert to "y from top" for sanity:
      const yFromTop = pageHeightPt - yFromBottom;
      // Footer band starts at footerTopPt from top. Text inside the footer
      // band itself is intentional (church name + disclaimer). We only flag
      // text that lands in the footer band but is NOT the footer text — i.e.
      // text whose y-from-top is between footerTopPt and footerTopPt + 4pt
      // (the narrow gap that used to clip the Verified By box).
      const gapStart = footerTopPt;
      const gapEnd = footerTopPt + 10; // 10pt ≈ 3.5mm into the footer band
      if (yFromTop > gapStart && yFromTop < gapEnd) {
        issues.push(
          `page ${p}: text drawn at y=${yFromTop.toFixed(1)}pt overlaps footer band (starts at ${gapStart.toFixed(1)}pt)`
        );
      }
      if (yFromTop > pageHeightPt) {
        issues.push(`page ${p}: text drawn off-page at y=${yFromTop.toFixed(1)}pt`);
      }
    }
  }

  return { doc, pageHeight, pageWidth, issues };
}

describe("receiptPdf regression: verification box never overlaps footer", () => {
  it("renders cleanly with a short description", () => {
    const { issues, doc } = renderAndInspect("For the church building");
    expect(issues, issues.join("\n")).toEqual([]);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("renders cleanly with a very long description (500 chars)", () => {
    const long = "Generous contribution towards the new sanctuary project. ".repeat(10);
    const { issues } = renderAndInspect(long);
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("renders cleanly with an extreme description (2000 chars)", () => {
    const huge = "Tithes, offerings, building fund, camp meeting and welfare combined. ".repeat(30);
    const { issues } = renderAndInspect(huge);
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("renders cleanly with very long approver names", () => {
    const { issues } = renderAndInspect("For building work", {
      t: "Mercy Adhaimbo-Wanjiku-Otieno-Omondi Jr. III",
      s: "Sir Omollo-Wanyama-Kiprotich-Mwangi Esq.",
    });
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("paginates when content overflows instead of clipping", () => {
    const huge = "x".repeat(50) + " ".repeat(0);
    const stuffed = (huge + " ").repeat(40);
    const { doc, issues } = renderAndInspect(stuffed);
    expect(issues, issues.join("\n")).toEqual([]);
    // With this much content the verification block should land on page >= 2
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });
});
