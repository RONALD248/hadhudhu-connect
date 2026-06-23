import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type jsPDF from "jspdf";

/**
 * When a regression test detects layout issues, dump the offending PDF plus
 * a JSON/HTML diagnostic into ./test-artifacts so CI can upload them and
 * developers can inspect the layout immediately.
 */
export const ARTIFACT_DIR = join(process.cwd(), "test-artifacts");

export function dumpArtifacts(
  name: string,
  doc: jsPDF,
  diagnostics: {
    issues: string[];
    pageHeightPt: number;
    footerTopPt: number;
    testName: string;
    extra?: Record<string, unknown>;
  },
) {
  try {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
    const safe = name.replace(/[^a-z0-9-_]+/gi, "_").slice(0, 120);

    // PDF
    const buf = Buffer.from(doc.output("arraybuffer"));
    writeFileSync(join(ARTIFACT_DIR, `${safe}.pdf`), buf);

    // JSON diagnostic
    writeFileSync(
      join(ARTIFACT_DIR, `${safe}.json`),
      JSON.stringify(
        {
          test: diagnostics.testName,
          numPages: doc.getNumberOfPages(),
          pageHeightPt: diagnostics.pageHeightPt,
          footerTopPt: diagnostics.footerTopPt,
          issueCount: diagnostics.issues.length,
          issues: diagnostics.issues,
          ...diagnostics.extra,
        },
        null,
        2,
      ),
    );

    // HTML viewer that embeds the PDF + lists issues for quick triage
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${safe} — regression artifact</title>
<style>
  body{font-family:system-ui,sans-serif;margin:0;display:grid;grid-template-columns:380px 1fr;height:100vh}
  aside{padding:16px;border-right:1px solid #ddd;overflow:auto;background:#fafafa}
  h1{font-size:16px;margin:0 0 12px}
  code{background:#eee;padding:2px 4px;border-radius:3px}
  li{margin:6px 0;font-size:13px;color:#a00}
  embed{width:100%;height:100%}
  dl{font-size:13px}dt{font-weight:600;margin-top:8px}
</style></head>
<body>
  <aside>
    <h1>${diagnostics.testName}</h1>
    <dl>
      <dt>Pages</dt><dd>${doc.getNumberOfPages()}</dd>
      <dt>Page height (pt)</dt><dd>${diagnostics.pageHeightPt.toFixed(2)}</dd>
      <dt>Footer top (pt)</dt><dd>${diagnostics.footerTopPt.toFixed(2)}</dd>
      <dt>Issues (${diagnostics.issues.length})</dt>
      <dd><ul>${diagnostics.issues.map((i) => `<li>${i.replace(/</g, "&lt;")}</li>`).join("") || "<li style='color:#080'>none</li>"}</ul></dd>
    </dl>
  </aside>
  <embed src="${safe}.pdf" type="application/pdf">
</body></html>`;
    writeFileSync(join(ARTIFACT_DIR, `${safe}.html`), html);
  } catch (err) {
    // Never let artifact dumping mask the original test failure.
    console.warn(`[artifacts] failed to dump ${name}:`, err);
  }
}
