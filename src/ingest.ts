import type { Rfq, RfqLine, Quote, RejectedRow, RejectReason } from "./types";

// ---------- Helpers ----------

// Narrow unknown to "an object whose fields we can read".
// After this check, row.partNumber is allowed but its type is still unknown.
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// "  brkt-100 " -> "BRKT-100". Return null if not a string or empty after trim.
export function normalizePartNumber(value: unknown): string | null {
  if (typeof (value) === "string" && value.toUpperCase().replace(/\s+/g, "") === "") {
    return null
  }
  if (typeof (value) === "string") {
    const val = value.toUpperCase().replace(/\s+/g, "");
    return val
  }

  else {
    return null
  }

  // your code
}

// 42.5 -> 42.5, "$1,250.00" -> 1250, "TBD" -> null, "" -> null, -5 -> null
export function parsePrice(value: unknown): number | null {
  let n: number;

  if (typeof value === "number") {
    n = value;                                 // use it as is
  } else if (typeof value === "string") {
    const cleaned = value.replace(/[$, ]/g, "").trim();   // strip only $ and commas
    if (cleaned === "") return null;         // catches "" before Number("") turns it into 0
    n = Number(cleaned);
  } else {
    return null;                             // null, undefined, objects...
  }

  // one shared validation for both branches
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

const DAYS_PER_UNIT: Record<string, number> = {
  d: 1, day: 1, days: 1,
  w: 7, wk: 7, wks: 7, week: 7, weeks: 7,
  mo: 30, mos: 30, month: 30, months: 30,
};

// Matches: "21", "21 days", "3wks", "2 months", "8-10 weeks", "8 to 10 wks", "6 weeks ARO"
const LEAD_TIME_PATTERN =
  /(\d+(?:\.\d+)?)(?:\s*(?:-|to)\s*(\d+(?:\.\d+)?))?\s*(days?|d|weeks?|wks?|wk|w|months?|mos?|mo)?\b/i;

export function parseLeadDays(value: unknown): number | null {
  let days: number;

  if (typeof value === "number") {
    days = value;
  } else if (typeof value === "string") {
    const match = value.trim().match(LEAD_TIME_PATTERN);
    if (!match) return null;                       // "ASAP", "", "call us"

    const low = Number(match[1]);
    const high = match[2] !== undefined ? Number(match[2]) : low;
    const amount = Math.max(low, high);            // ranges: use the upper bound

    const unit = (match[3] ?? "days").toLowerCase();   // no unit = days
    const multiplier = DAYS_PER_UNIT[unit];
    if (multiplier === undefined) return null;

    days = Math.ceil(amount * multiplier);         // round partial days up
  } else {
    return null;
  }

  if (!Number.isInteger(days) || days <= 0) return null;
  return days;
}
// ---------- Main ----------

export function normalizeRevision(revision: unknown): string | null {
  let cleanRevision = ""
  const regex = /^[A-Z]+$/
  if (typeof revision === 'string') {
    cleanRevision = revision.toUpperCase().replace(/\s+/g, "")
    if (!regex.test(cleanRevision)) {
      return null
    }
    else {
      return cleanRevision
    }
  }

  else {
    return null
  }


}
export function normalizeIds(id: unknown): string | null {
  if (typeof id !== "string" || id.trim() === "") {
    return null
  }
  else {
    return id.trim()
  }
}
export function revisionToNumber(revision: unknown): number {
  let cleanRevision: string | null = ""
  let revisionValue = 0
  const regex = /^[A-Z]+$/
  if (typeof revision === 'string') {
    if (revision === "" || revision === " ") {
      return 0
    }

    cleanRevision = normalizeRevision(revision)
    if (cleanRevision !== null && regex.test(cleanRevision))
      for (let i = 0; i < cleanRevision.length; i++) {
        revisionValue = revisionValue * 26 + cleanRevision.charCodeAt(i) - 64
      }
  }
  return revisionValue

}
export function ingestQuotes(
  raw: unknown[],
  rfq: Rfq
): { clean: Quote[]; rejected: RejectedRow[] } {

  const clean: Quote[] = [];
  const rejected: RejectedRow[] = [];
  const linesByPart = new Map<string, RfqLine>()
  for (const line of rfq.lines) {
    const partNumber = normalizePartNumber(line.partNumber)
    if (partNumber === null) continue

    const existingLine = linesByPart.get(partNumber)
    if (existingLine === undefined || revisionToNumber(line.revision) > revisionToNumber(existingLine.revision)) {
      linesByPart.set(partNumber, line)
    }
  }


  for (const [index, row] of raw.entries()) {

    if (!isObject(row)) {
      // reject NOT_AN_OBJECT
      rejected.push({ index: index, reason: "NOT_AN_OBJECT", rawValue: row })
      continue;          // skip to the next row
    }
    const rfqId = normalizeIds(row.rfqId)
    const supplierId = normalizeIds(row.supplierId)
    const partNumber = normalizePartNumber(row.partNumber)
    const revision = normalizeRevision(row.revision)
    const unitPrice = parsePrice(row.unitPrice)
    const leadTime = parseLeadDays(row.leadTime)
    if (partNumber === null) {
      rejected.push({ index: index, reason: "MISSING_PART", rawValue: row })
    }
    else if (!linesByPart.has(partNumber)){
      rejected.push({ index: index, reason: "PART_NOT_ON_RFQ", rawValue: row })
    }
    else if (rfqId === null) {
      rejected.push({ index: index, reason: "NON_EXISTENT_RFQ", rawValue: row })
    }
    else if (rfqId !== rfq.id) {
      rejected.push({ index: index, reason: "NON_EXISTENT_RFQ", rawValue: row })
    }
    else if (supplierId === null) {
      rejected.push({ index: index, reason: "MISSING_SUPPLIER", rawValue: row })
    }
    else if (revision === null) {
      rejected.push({ index: index, reason: "MISSING_REVISION", rawValue: row })
    }
    else if(revisionToNumber(linesByPart.get(partNumber)?.revision)>revisionToNumber(revision)){
      rejected.push({ index: index, reason: "OUTDATED_REVISION", rawValue: row })
    }
    else if(revisionToNumber(linesByPart.get(partNumber)?.revision)<revisionToNumber(revision)){
      rejected.push({ index: index, reason: "WRONG_REVISION", rawValue: row })
    }
    else if (unitPrice === null) {
      rejected.push({ index: index, reason: "INVALID_PRICE", rawValue: row })
    }
    else if (leadTime === null) {
      rejected.push({ index: index, reason: "INVALID_LEAD_TIME", rawValue: row })
    }
    else if (leadTime !== null && rfqId !== null && supplierId !== null && partNumber !== null && revision !== null && unitPrice !== null) {

      clean.push({
        rfqId: rfqId,
        supplierId: supplierId,
        partNumber: partNumber,
        revisionQuoted: revision,
        unitPrice: unitPrice,
        leadTime: leadTime
      })
    }
    }
  return { clean, rejected };
}