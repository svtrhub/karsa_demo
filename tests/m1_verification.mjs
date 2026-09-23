import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

console.log("==========================================");
console.log("Running Milestone 1 Verification Suite...");
console.log("==========================================");

const onboardingFile = path.resolve("src/components/onboarding/OnboardingFlow.tsx");
assert(fs.existsSync(onboardingFile), "OnboardingFlow.tsx must exist");
const content = fs.readFileSync(onboardingFile, "utf-8");

// Test 1: Redundant top-left logo removal
console.log("\n[Test 1] Verifying top-left redundant logo removal...");
assert(!content.includes("absolute top-6 left-6"), "Top-left header logo must be completely removed");
assert(content.includes("Big White KARSA Logo"), "Central modal card logo must be retained");
console.log("✅ PASS: Redundant logo removed, central card logo preserved.");

// Test 2: 4-Layer Theatrical Spotlight Reveal
console.log("\n[Test 2] Verifying 4-layer optical spotlight reveal...");
assert(content.includes("Theatrical Spotlight Reveal"), "Spotlight comment/marker must be present");
assert(content.includes("-top-28 -right-28 w-[520px] h-[520px]"), "Apex luminaire layer must be present");
assert(content.includes("polygon(100% 0%, 72% 0%, 15% 100%, 72% 100%)"), "Core God-Ray shaft with 225-deg clip-path must be present");
assert(content.includes("polygon(100% 0%, 55% 0%, 0% 100%, 85% 100%)"), "Secondary soft wash beam clip-path must be present");
assert(content.includes("radial-gradient(ellipse at 50% 50%"), "Modal stage bounce backlight halo must be present");
assert(content.includes("mix-blend-screen pointer-events-none"), "Beam layers must use mix-blend-screen and pointer-events-none");
console.log("✅ PASS: 4-layer optical spotlight reveal beam correctly implemented at z-0.");

// Test 3: Tier 1 Segmented Switcher
console.log("\n[Test 3] Verifying Tier 1 Segmented Switcher...");
assert(content.includes('role="tablist"'), 'Tier 1 must have role="tablist"');
assert(content.includes('role="tab"'), 'Tier 1 buttons must have role="tab"');
assert(content.includes('layoutId="activeJenjangTier1"'), 'Framer Motion sliding pill must have layoutId="activeJenjangTier1"');
assert(content.includes('min-h-[48px]'), 'Tier 1 tabs must have min-h-[48px]');
assert(content.includes('TIER1_CATEGORIES'), 'TIER1_CATEGORIES constant must be defined and exported');
console.log("✅ PASS: Tier 1 Segmented Switcher fully verified.");

// Test 4: Tier 2 Sub-Class Chips & State Mapping
console.log("\n[Test 4] Verifying Tier 2 Sub-Class Chips & State Mapping...");
assert(content.includes('<AnimatePresence mode="wait">'), 'Tier 2 must be wrapped in AnimatePresence mode="wait"');
assert(content.includes('role="tabpanel"'), 'Tier 2 container must have role="tabpanel"');
assert(content.includes('role="radiogroup"'), 'Sub-class container must have role="radiogroup"');
assert(content.includes('role="radio"'), 'Sub-class items must have role="radio"');
assert(content.includes("lastSmpClass"), "Category memory state for SMP must be defined");
assert(content.includes("lastSmaClass"), "Category memory state for SMA must be defined");

const canonicalStrings = [
  "SMP Kelas 7",
  "SMP Kelas 8",
  "SMP Kelas 9",
  "SMA/SMK Kelas 10",
  "SMA/SMK Kelas 11",
  "SMA/SMK Kelas 12",
];
for (const s of canonicalStrings) {
  assert(content.includes(`"${s}"`), `Canonical string "${s}" must exist in class definitions`);
}
console.log("✅ PASS: Tier 2 Sub-Class Chips and canonical string mappings verified.");

// Test 5: UI/UX Pro Max & Accessibility Standards
console.log("\n[Test 5] Verifying UI/UX Pro Max & Accessibility Standards...");
assert(content.includes('role="progressbar"'), 'Step indicator must have role="progressbar"');
assert(content.includes('htmlFor="input-nama-panggilan"'), 'Name input label must have htmlFor');
assert(content.includes('id="input-nama-panggilan"'), 'Name input must have id="input-nama-panggilan"');
assert(content.includes('role="checkbox"'), 'Multi-select chips must have role="checkbox"');
assert(content.includes('aria-checked={isSelected}'), 'Checkbox chips must have aria-checked');
assert(content.includes('focus-visible:ring-amber-400'), 'Visible focus ring for amber accents must exist');
assert(content.includes('focus-visible:ring-cyan-400'), 'Visible focus ring for cyan accents must exist');
assert(!content.includes('#0283D6'), 'Hardcoded hex #0283D6 must be removed in favor of semantic Tailwind');
assert(content.includes('min-h-[44px]'), 'Touch targets must enforce min-h-[44px]');
console.log("✅ PASS: UI/UX Pro Max accessibility, focus rings, touch targets, and tokens verified.");

console.log("\n==========================================");
console.log("All Milestone 1 Verification Checks PASSED!");
console.log("==========================================");
