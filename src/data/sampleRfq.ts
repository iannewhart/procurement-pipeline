import type { Rfq } from '../types.ts';

export const sampleRfq: Rfq = {
  id: "RFQ-1001",
  lines: [
    { partNumber: "BRKT-100", revision: "C", quantity: 50,  needByDate: "2026-11-15" },
    { partNumber: "VALVE-7",  revision: "B", quantity: 10,  needByDate: "2026-11-30" },
    { partNumber: "SEAL-22",  revision: "A", quantity: 200, needByDate: "2026-12-01" },
  ],
  supplierIds: ["SUP-ACME", "SUP-ORBIT", "SUP-ZENITH"],
  status: "SENT",
};