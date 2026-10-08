export interface Part {
    partNumber: string      // normalized, e.g. "BRKT-100"
    description: string
    revision: string      // engineering revision, e.g. "C"
}

export interface Supplier {
    id: string
    name: string
    email?: string
    certifications: Certification[]
}
export type Certification ="AS9100" | "ISO9001" | "ITAR_REGISTERED"

export interface RfqLine {
    partNumber: string
    revision: string
    quantity: number
    needByDate: string//(use string for dates for now)
}
export interface Rfq {
    id: string
    lines: RfqLine[]
    supplierIds: string[]
    status: "DRAFT" | "SENT" | "CLOSED"
}
export interface Quote {
    rfqId: string
    supplierId: string
    partNumber: string
    revisionQuoted: string
    unitPrice: number
    leadTime: number
}
export type RejectReason= "NOT_AN_OBJECT"        // row isn't an object at all
    | "MISSING_SUPPLIER"     // no supplier ID
    | "MISSING_PART"         // no part number, or empty after trimming
    | "PART_NOT_ON_RFQ"      // supplier quoted a part you never asked for
    | "WRONG_REVISION"       // right part, wrong engineering revision
    | "INVALID_PRICE"        // "TBD", empty, negative, unparseable
    | "INVALID_LEAD_TIME"
    | "NON_EXISTENT_RFQ"
    | "MISSING_REVISION"
    | "OUTDATED_REVISION"
export interface RejectedRow {
    index: number
    reason: RejectReason
    rawValue: unknown
}