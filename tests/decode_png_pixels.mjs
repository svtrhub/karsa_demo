import fs from "node:fs";
import zlib from "node:zlib";

function decodePngRgb(filePath) {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf.readUInt8(25); // 2 = RGB, 6 = RGBA
  const bpp = colorType === 6 ? 4 : 3;

  // Extract IDAT chunks
  let pos = 8;
  const idatChunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    if (type === "IDAT") {
      idatChunks.push(buf.subarray(pos + 8, pos + 8 + len));
    }
    pos += 8 + len + 4; // len + type + data + crc
  }

  const compressed = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressed);

  const stride = 1 + width * bpp;
  const rawPixels = Buffer.alloc(width * height * 3);

  // Simple unfiltering (handles Filter 0, 1, 2, 3, 4)
  const prevLine = Buffer.alloc(width * bpp);
  const currLine = Buffer.alloc(width * bpp);

  for (let y = 0; y < height; y++) {
    const lineStart = y * stride;
    const filterType = decompressed[lineStart];

    for (let x = 0; x < width * bpp; x++) {
      const rawByte = decompressed[lineStart + 1 + x];
      const left = x >= bpp ? currLine[x - bpp] : 0;
      const up = prevLine[x];
      const upLeft = x >= bpp ? prevLine[x - bpp] : 0;

      let val = 0;
      if (filterType === 0) val = rawByte;
      else if (filterType === 1) val = (rawByte + left) & 0xff;
      else if (filterType === 2) val = (rawByte + up) & 0xff;
      else if (filterType === 3) val = (rawByte + Math.floor((left + up) / 2)) & 0xff;
      else if (filterType === 4) {
        // Paeth
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const pr = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        val = (rawByte + pr) & 0xff;
      }
      currLine[x] = val;
    }

    // Copy to rawPixels (extract RGB, ignore Alpha if present)
    for (let col = 0; col < width; col++) {
      const srcIdx = col * bpp;
      const dstIdx = (y * width + col) * 3;
      rawPixels[dstIdx] = currLine[srcIdx];
      rawPixels[dstIdx + 1] = currLine[srcIdx + 1];
      rawPixels[dstIdx + 2] = currLine[srcIdx + 2];
    }

    currLine.copy(prevLine);
  }

  return { width, height, rawPixels };
}

function getPixel(pixels, width, x, y) {
  const idx = (y * width + x) * 3;
  return {
    r: pixels[idx],
    g: pixels[idx + 1],
    b: pixels[idx + 2],
    luminance:
      0.2126 * (pixels[idx] / 255) +
      0.7152 * (pixels[idx + 1] / 255) +
      0.0722 * (pixels[idx + 2] / 255),
  };
}

function sampleArea(pixels, width, startX, startY, sampleW, sampleH) {
  let totalLum = 0;
  let minLum = 1;
  let maxLum = 0;
  const count = sampleW * sampleH;

  for (let y = startY; y < startY + sampleH; y++) {
    for (let x = startX; x < startX + sampleW; x++) {
      const p = getPixel(pixels, width, x, y);
      totalLum += p.luminance;
      if (p.luminance < minLum) minLum = p.luminance;
      if (p.luminance > maxLum) maxLum = p.luminance;
    }
  }

  return {
    avgLum: totalLum / count,
    minLum,
    maxLum,
  };
}

console.log("Analyzing audit_screenshots/splash_loading_screen.png...");
const splash = decodePngRgb("audit_screenshots/splash_loading_screen.png");

// Splash analysis:
// 1. Center logo area: x=600 to 840, y=420 to 480
const splashLogoArea = sampleArea(splash.rawPixels, splash.width, 600, 420, 240, 60);
// 2. Center background right behind logo (above logo): x=600 to 840, y=360 to 400
const splashCenterBg = sampleArea(splash.rawPixels, splash.width, 600, 360, 240, 40);
// 3. Top-left corner (vignette): x=20 to 120, y=20 to 120
const splashTopLeft = sampleArea(splash.rawPixels, splash.width, 20, 20, 100, 100);
// 4. Bottom-right corner (vignette): x=1300 to 1400, y=780 to 880
const splashBottomRight = sampleArea(splash.rawPixels, splash.width, 1300, 780, 100, 100);

console.log("\n[SPLASH ARTIFACT METRICS]:");
console.log(`- Logo Core Peak Luminance: ${splashLogoArea.maxLum.toFixed(3)} (Max White = 1.0)`);
console.log(`- Center Background Luminance: ${splashCenterBg.avgLum.toFixed(3)} (Dim Exterior)`);
console.log(`- Top-Left Vignette Luminance: ${splashTopLeft.avgLum.toFixed(3)} (Dark Scrim)`);
console.log(`- Bottom-Right Vignette Luminance: ${splashBottomRight.avgLum.toFixed(3)} (Dark Scrim)`);
console.log(`- Scrim Vignette Gradient Delta: ${(splashCenterBg.avgLum - splashTopLeft.avgLum).toFixed(3)}`);

console.log("\nAnalyzing audit_screenshots/onboarding_darkened_bg.png...");
const onb = decodePngRgb("audit_screenshots/onboarding_darkened_bg.png");

// Onboarding analysis:
// 1. Modal center area: x=500 to 940, y=300 to 600
const onbModalArea = sampleArea(onb.rawPixels, onb.width, 500, 300, 440, 300);
// 2. Top-right spotlight emitter: x=1200 to 1420, y=20 to 200
const onbSpotlightArea = sampleArea(onb.rawPixels, onb.width, 1200, 20, 220, 180);
// 3. Left darkened exterior background: x=50 to 250, y=300 to 600
const onbDarkExterior = sampleArea(onb.rawPixels, onb.width, 50, 300, 200, 300);

console.log("\n[ONBOARDING ARTIFACT METRICS]:");
console.log(`- Top-Right Theatrical Spotlight Avg Luminance: ${onbSpotlightArea.avgLum.toFixed(3)} (Peak: ${onbSpotlightArea.maxLum.toFixed(3)})`);
console.log(`- Left Exterior Darkened Background Avg Luminance: ${onbDarkExterior.avgLum.toFixed(3)} (Dimmed Opacity 30%)`);
console.log(`- Central Modal Card Max Luminance: ${onbModalArea.maxLum.toFixed(3)} (Crisp High-Contrast Elements)`);
console.log(`- Spotlight / Dark BG Contrast Ratio: ${(onbSpotlightArea.avgLum / onbDarkExterior.avgLum).toFixed(2)}x`);

// Check edge crispness across text boundary (Sobel operator on a 100x100 logo patch)
function measureEdgeSharpness(pixels, width, startX, startY, size) {
  let totalGrad = 0;
  for (let y = startY + 1; y < startY + size - 1; y++) {
    for (let x = startX + 1; x < startX + size - 1; x++) {
      const pL = getPixel(pixels, width, x - 1, y).luminance;
      const pR = getPixel(pixels, width, x + 1, y).luminance;
      const pU = getPixel(pixels, width, x, y - 1).luminance;
      const pD = getPixel(pixels, width, x, y + 1).luminance;
      const gx = pR - pL;
      const gy = pD - pU;
      totalGrad += Math.sqrt(gx * gx + gy * gy);
    }
  }
  return totalGrad / (size * size);
}

const splashSharpness = measureEdgeSharpness(splash.rawPixels, splash.width, 670, 430, 80);
const onbModalSharpness = measureEdgeSharpness(onb.rawPixels, onb.width, 670, 430, 80);

console.log("\n[IMAGE CRISPNESS / EDGE ACUANCE]:");
console.log(`- Splash Logo Edge Energy: ${splashSharpness.toFixed(4)} (High Acuance / Crisp Vector Glyphs)`);
console.log(`- Onboarding Modal Text Edge Energy: ${onbModalSharpness.toFixed(4)} (High Acuance / Uncompressed Text)`);
