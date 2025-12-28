/**
 * Extract possible medicine phrases and match them against known medicine names.
 * This is intentionally conservative to reduce false positives.
 */
export function matchMedicinesFromText(rawText, knownMedicines) {
  const text = (rawText || "").toLowerCase();
  const matches = [];

  for (const med of knownMedicines) {
    const name = med.name.toLowerCase();
    // word-boundary-ish match: allow spaces and dosage numbers
    const rx = new RegExp(`(^|\\b)${escapeRegExp(name)}(\\b|$)`, "i");
    if (rx.test(text)) matches.push(med);
  }

  // Also try to detect common "name + dosage" formats in OCR output
  const candidates = new Set();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  for (const ln of lines) {
    // keep short-ish strings
    if (ln.length >= 3 && ln.length <= 40) {
      const cleaned = ln.replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
      if (cleaned) candidates.add(cleaned);
    }
  }

  return { matched: uniqueBy(matches, (m) => m._id?.toString?.() || m.id || m.name), candidates: Array.from(candidates).slice(0, 25) };
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uniqueBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const a of arr) {
    const k = keyFn(a);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(a);
  }
  return out;
}
