// Captures the README screenshots and demo GIF from a running PostPilot.
// Usage: BASE_URL=http://localhost:3100 node scripts/screenshots.mjs
// Needs: playwright (npm i --no-save playwright) and ffmpeg. Run the app WITHOUT DATABASE_URL
// so the built-in demo database and demo account are used.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { chromium, devices } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = "docs/screenshots";
const DEMO = { email: "demo@postpilot.dev", password: "password123" };
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function signIn(page) {
  await page.goto(`${BASE}/login`);
  await page.fill("#email", DEMO.email);
  await page.fill("#password", DEMO.password);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/write/);
}

/** Types a topic once the page is interactive, then writes the post and waits for it to finish. */
async function writePost(page, topic, { tone, typeDelay = 0 } = {}) {
  await page.waitForLoadState("networkidle");
  for (let i = 0; i < 10; i++) {
    await page.fill("#topic", "");
    await page.locator("#topic").pressSequentially(topic, { delay: typeDelay });
    if (await page.locator("button[type=submit]:not([disabled])").count()) break;
    await page.waitForTimeout(500);
  }
  if (tone) await page.locator(`input[value=${tone}]`).locator("..").click();
  await page.getByRole("button", { name: /Write post/ }).click();
  await page.getByRole("button", { name: "Copy" }).waitFor({ timeout: 30_000 });
}

// Desktop: landing, write, history
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await desktop.newPage();
await page.goto(BASE);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: `${OUT}/landing.png` });
await signIn(page);
await writePost(page, "The bug that taught me to write tests first");
await page.waitForTimeout(5_000); // let the "Saved" toast fade
await page.screenshot({ path: `${OUT}/write.png` });
await page.goto(`${BASE}/history`);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: `${OUT}/history.png` });
const state = await desktop.storageState();
await desktop.close();

// Phone: write and history
const phone = await browser.newContext({ ...devices["iPhone 14"], storageState: state });
const mobile = await phone.newPage();
await mobile.goto(`${BASE}/write`);
await writePost(mobile, "Why I keep my pull requests small");
await mobile.waitForTimeout(5_000);
await mobile.getByText("show before").scrollIntoViewIfNeeded();
await mobile.evaluate(() => window.scrollBy(0, 150));
await mobile.screenshot({ path: `${OUT}/mobile-write.png` });
await mobile.goto(`${BASE}/history`);
await mobile.waitForLoadState("networkidle");
await mobile.screenshot({ path: `${OUT}/mobile-history.png` });
await phone.close();

// Demo GIF: type an idea, pick a tone, watch it stream
const VIDEO_DIR = "/tmp/postpilot-video";
rmSync(VIDEO_DIR, { recursive: true, force: true });
const recorder = await browser.newContext({ viewport: { width: 1280, height: 760 }, storageState: state, recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 760 } } });
const rec = await recorder.newPage();
await rec.goto(`${BASE}/write`);
await rec.waitForTimeout(800);
await writePost(rec, "What shipping my first SaaS taught me about scope", { tone: "story", typeDelay: 35 });
await rec.waitForTimeout(1_500);
await rec.getByText("...see more").click().catch(() => {}); // show the whole post
await rec.waitForTimeout(2_500);
await recorder.close();
await browser.close();

const video = `${VIDEO_DIR}/${readdirSync(VIDEO_DIR).find((f) => f.endsWith(".webm"))}`;
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", video, "-vf",
  "fps=12,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4",
  "docs/demo.gif"]);
console.log("Saved screenshots to docs/screenshots and docs/demo.gif");
