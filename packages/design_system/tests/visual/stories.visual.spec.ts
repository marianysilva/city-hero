import { readFileSync } from "node:fs";
import { join } from "node:path";

import { test, expect } from "@playwright/test";

type StoryIndexEntry = {
  id: string;
  type: "story" | "docs";
  title: string;
  name: string;
};

type StoryIndex = {
  entries: Record<string, StoryIndexEntry>;
};

// Read the index Storybook itself generates at build time — this is what
// makes the suite "any new story is snapshotted automatically" instead of a
// hand-maintained list that silently goes stale as components are added.
const indexPath = join(__dirname, "../../storybook-static/index.json");
const index: StoryIndex = JSON.parse(readFileSync(indexPath, "utf-8"));

const stories = Object.values(index.entries).filter((entry) => entry.type === "story");

test.describe("Storybook visual regression", () => {
  for (const story of stories) {
    test(`${story.title} · ${story.name}`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
      // Storybook's own root marker; waiting on it (rather than a fixed
      // timeout) avoids snapshotting a still-loading iframe.
      await page.locator("#storybook-root, #root").first().waitFor({ state: "visible" });
      await expect(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true });
    });
  }
});
