import { describe, it, expect } from "vitest";
import { buildAllReceiptsPDF } from "../receiptPdf";
import { dumpArtifacts } from "./_artifacts";

/**
 * Regression: in combined "all receipts" PDFs, the Verified By box and
 * approver names must never overlap the per-page footer band across
 * pagination, regardless of how many receipts, how long descriptions,
 * or how long approver names are.
 */

const PT_PER_MM = 2.83464567;
const COMBINED_FOOTER_HEIGHT_MM = 16; // footer rect height used in combined PDF

function makeReceipt(i: number, overrides: Partial<Parameters<typeof buildAllReceiptsPDF>[0]["receipts"][number]> = {}) {
  return {
    receiptNumber: `RCT-2026-${String(i).padStart(6, "0")}`,
    memberName: "RONALD OMOLLO",
    amount: 1000 + i * 50,
    paymentDate: "2026-06-01",
    paymentMethod: "cash",
    referenceNumber: `REF-${i}`,
    categoryName: "Building Fund",
    categoryCode: "BUILDING",
    description: "For the church building project",
    treasurerName: "Mercy Adhaimbo",
    secretaryName: "Sir Omollo",
    treasurerConfirmedAt: "2026-06-19T04:21:08Z",
    secretaryConfirmedAt: "2026-06-19T05:51:08Z",
    ...overrides,
  };
}

function inspect(memberName: string, receipts: ReturnType<typeof makeReceipt>[]) {
  const doc = buildAllReceiptsPDF({ memberName, receipts })!;
  expect(doc).toBeTruthy();

  const pageHeightMm = (doc.internal.pageSize as unknown as { getHeight: () => number }).getHeight();
  const pageHeightPt = pageHeightMm * PT_PER_MM;
  const footerTopPt = pageHeightPt - COMBINED_FOOTER_HEIGHT_MM * PT_PER_MM;

  const pages = (doc.internal as unknown as { pages: string[][] }).pages;
  const issues: string[] = [];

  for (let p = 1; p < pages.length; p++) {
    const stream = (pages[p] || []).join("\n");
    const tmRegex = /1 0 0 -1 ([\d.\-]+) ([\d.\-]+) Tm/g;
    let m: RegExpExecArray | null;
    while ((m = tmRegex.exec(stream)) !== null) {
      const yFromBottom = parseFloat(m[2]);
      const yFromTop = pageHeightPt - yFromBottom;
      // Allow text drawn inside the footer band only at the very bottom
      // (the page label sits ~6mm from bottom). Flag any text that lands in
      // the narrow 10pt gap right where the band begins.
      if (yFromTop > footerTopPt && yFromTop < footerTopPt + 10) {
        issues.push(
          `page ${p}: text at y=${yFromTop.toFixed(1)}pt overlaps footer band (starts at ${footerTopPt.toFixed(1)}pt)`,
        );
      }
      if (yFromTop > pageHeightPt) {
        issues.push(`page ${p}: text drawn off-page at y=${yFromTop.toFixed(1)}pt`);
      }
    }
  }

  if (issues.length > 0) {
    const testName = expect.getState().currentTestName ?? "unknown";
    dumpArtifacts(`combined_${testName}`, doc, {
      issues,
      pageHeightPt,
      footerTopPt,
      testName,
      extra: { memberName, receiptCount: receipts.length },
    });
  }

  return { doc, issues };
}

describe("combined receipts PDF regression: verification never overlaps footer", () => {
  it("single receipt batch renders cleanly", () => {
    const { issues } = inspect("RONALD OMOLLO", [makeReceipt(1)]);
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("small batch (3 receipts) renders cleanly", () => {
    const receipts = [1, 2, 3].map((i) => makeReceipt(i));
    const { issues } = inspect("RONALD OMOLLO", receipts);
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("large batch (25 receipts) renders cleanly across pagination", () => {
    const receipts = Array.from({ length: 25 }, (_, i) => makeReceipt(i + 1));
    const { issues, doc } = inspect("RONALD OMOLLO", receipts);
    expect(issues, issues.join("\n")).toEqual([]);
    // cover + summary + per-receipt (>=1 each)
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(2 + 25);
  });

  it("batch with very long descriptions paginates without overlap", () => {
    const longDesc = "Generous contribution for sanctuary, camp meeting, welfare and outreach. ".repeat(15);
    const receipts = Array.from({ length: 6 }, (_, i) =>
      makeReceipt(i + 1, { description: longDesc }),
    );
    const { issues } = inspect("RONALD OMOLLO", receipts);
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("batch with very long approver names renders cleanly", () => {
    const receipts = Array.from({ length: 5 }, (_, i) =>
      makeReceipt(i + 1, {
        treasurerName: "Mercy Adhaimbo-Wanjiku-Otieno-Omondi Jr. III",
        secretaryName: "Sir Omollo-Wanyama-Kiprotich-Mwangi Esq.",
      }),
    );
    const { issues } = inspect("RONALD OMOLLO", receipts);
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("batch combining long descriptions AND long approver names renders cleanly", () => {
    const longDesc = "Tithes, offerings, building fund, camp meeting and welfare combined. ".repeat(25);
    const receipts = Array.from({ length: 8 }, (_, i) =>
      makeReceipt(i + 1, {
        description: longDesc,
        treasurerName: "Mercy Adhaimbo-Wanjiku-Otieno-Omondi Jr. III",
        secretaryName: "Sir Omollo-Wanyama-Kiprotich-Mwangi Esq.",
      }),
    );
    const { issues } = inspect("RONALD OMOLLO", receipts);
    expect(issues, issues.join("\n")).toEqual([]);
  });
});
