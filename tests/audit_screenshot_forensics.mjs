import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function analyzePng(filePath) {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf.readUInt8(24);
  const colorType = buf.readUInt8(25);
  const compression = buf.readUInt8(26);
  const filter = buf.readUInt8(27);
  const interlace = buf.readUInt8(28);
  const hash = crypto.createHash("sha256").update(buf).digest("hex");

  return {
    filePath,
    sizeBytes: buf.length,
    sizeKB: (buf.length / 1024).toFixed(1),
    width,
    height,
    aspectRatio: (width / height).toFixed(2),
    bitDepth,
    colorType: colorType === 6 ? "RGBA" : colorType === 2 ? "RGB" : `Type ${colorType}`,
    compression,
    filter,
    interlace: interlace === 0 ? "Non-interlaced" : "Interlaced",
    sha256: hash,
  };
}

const files = [
  "audit_screenshots/splash_loading_screen.png",
  "splash_loading_screen.png",
  "audit_screenshots/onboarding_darkened_bg.png",
  "onboarding_darkened_bg.png",
];

console.log("==================================================================");
console.log("SCREENSHOT ARTIFACT FORENSICS & INTEGRITY AUDIT");
console.log("==================================================================");

const results = files.map(analyzePng);
console.log(JSON.stringify(results, null, 2));

// Compare parity
const splashAuditVsRoot = results[0].sha256 === results[1].sha256;
const onbAuditVsRoot = results[2].sha256 === results[3].sha256;

console.log("\nPARITY REPORT:");
console.log(`Splash (audit vs root): ${splashAuditVsRoot ? "IDENTICAL (SHA-256 match)" : "MISMATCH"}`);
console.log(`Onboarding (audit vs root): ${onbAuditVsRoot ? "IDENTICAL (SHA-256 match)" : "MISMATCH"}`);
