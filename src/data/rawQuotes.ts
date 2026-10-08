// Simulates quotes extracted from supplier emails, PDFs, and spreadsheets.
// Typed as unknown[] because external data can't be trusted.
export const rawQuotes: unknown[] = [
  // 0: CLEAN. Everything correct.
  { rfqId: "RFQ-1001", supplierId: "SUP-ACME", partNumber: "BRKT-100", revision: "C", unitPrice: 42.5, leadTime: 21 },

  // 1: CLEAN after normalizing. Lowercase part with spaces, price as "$" string, lead time as numeric string.
  { rfqId: "RFQ-1001", supplierId: "SUP-ORBIT", partNumber: "  brkt-100 ", revision: "c", unitPrice: "$40.00", leadTime: "14" },

  // 2: CLEAN after normalizing. Price with comma, lead time in weeks.
  { rfqId: "RFQ-1001", supplierId: "SUP-ZENITH", partNumber: "VALVE-7", revision: "B", unitPrice: "$1,250.00", leadTime: "3 weeks" },

  // 3: REJECT MISSING_SUPPLIER.
  { rfqId: "RFQ-1001", partNumber: "SEAL-22", revision: "A", unitPrice: 1.8, leadTime: 10 },

  // 4: REJECT MISSING_PART. Only whitespace.
  { rfqId: "RFQ-1001", supplierId: "SUP-ACME", partNumber: "   ", revision: "A", unitPrice: 2.0, leadTime: 7 },

  // 5: REJECT PART_NOT_ON_RFQ. Supplier quoted a part nobody asked for.
  { rfqId: "RFQ-1001", supplierId: "SUP-ORBIT", partNumber: "BOLT-9", revision: "A", unitPrice: 0.25, leadTime: 5 },

  // 6: REJECT WRONG_REVISION. Right part, outdated revision. Costly in aerospace.
  { rfqId: "RFQ-1001", supplierId: "SUP-ZENITH", partNumber: "BRKT-100", revision: "B", unitPrice: 38.0, leadTime: 10 },

  // 7: REJECT INVALID_PRICE. Supplier hasn't priced it yet.
  { rfqId: "RFQ-1001", supplierId: "SUP-ACME", partNumber: "VALVE-7", revision: "B", unitPrice: "TBD", leadTime: 30 },

  // 8: REJECT INVALID_PRICE. Negative price, a data entry error.
  { rfqId: "RFQ-1001", supplierId: "SUP-ORBIT", partNumber: "SEAL-22", revision: "A", unitPrice: -5, leadTime: 12 },

  // 9: REJECT INVALID_LEAD_TIME. Missing entirely.
  { rfqId: "RFQ-1001", supplierId: "SUP-ZENITH", partNumber: "SEAL-22", revision: "A", unitPrice: 1.65 },

  // 10: REJECT INVALID_LEAD_TIME. Vague text.
  { rfqId: "RFQ-1001", supplierId: "SUP-ACME", partNumber: "SEAL-22", revision: "A", unitPrice: 1.7, leadTime: "ASAP" },

  // 11: REJECT NOT_AN_OBJECT. A stray line from an email body.
  "Thanks for the RFQ, quote attached!",

  // 12: REJECT NOT_AN_OBJECT. Null from a failed parse.
  null,

  // 13: TRICKY. Empty string price. Remember Number("") === 0.
  //     Should this be INVALID_PRICE? (Yes: a $0 part is almost certainly bad data.)
  { rfqId: "RFQ-1001", supplierId: "SUP-ORBIT", partNumber: "VALVE-7", revision: "B", unitPrice: "", leadTime: 20 },

  // 14: TRICKY. Multiple problems: missing supplier AND invalid price.
  //     If you chose single reason, which one wins? If multiple, report both.
  { rfqId: "RFQ-1001", partNumber: "VALVE-7", revision: "B", unitPrice: "call us", leadTime: 15 },
];