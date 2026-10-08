import { normalizePartNumber, parsePrice, parseLeadDays } from "./ingest";
import { ingestQuotes } from "./ingest";
import { rawQuotes } from "./data/rawQuotes";
import { sampleRfq } from "./data/sampleRfq";

const { clean, rejected } = ingestQuotes(rawQuotes, sampleRfq);

console.log(`Clean: ${clean.length}`);
console.table(clean);

console.log(`Rejected: ${rejected.length}`);
console.table(rejected.map(r => ({ index: r.index, reason: r.reason })));
// console.log("--- parseLeadDays ---");
// console.log(parseLeadDays(21));          // 21
// console.log(parseLeadDays("14"));        // 14
// console.log(parseLeadDays("3 weeks"));   // 21
// console.log(parseLeadDays("2 wks"));     // 14
// console.log(parseLeadDays("ASAP"));      // null
// console.log(parseLeadDays(undefined));   // null
// console.log(parseLeadDays(""));          // null
// console.log(parseLeadDays(-3));          // null
// console.log(parseLeadDays(2.5));         // null (or 3 if you choose to round up, your call)
// console.log("--- parsePrice ---");
// console.log(42.5,         "->", parsePrice(42.5));          // expect 42.5
// console.log("$1,250.00",  "->", parsePrice("$1,250.00"));   // expect 1250
// console.log("TBD",        "->", parsePrice("TBD"));         // expect null
// console.log('""',         "->", parsePrice(""));            // expect null
// console.log(-5,           "->", parsePrice(-5));            // expect null
// console.log('"-5"',       "->", parsePrice("-5"));          // expect null

// console.log("--- normalizePartNumber ---");
// console.log(normalizePartNumber("  brkt-100 "));   // expect "BRKT-100"
// console.log(normalizePartNumber("   "));           // expect null
// console.log(normalizePartNumber(42));              // expect null