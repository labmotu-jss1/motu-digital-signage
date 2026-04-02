const { test, expect } = require("@playwright/test");

const mockCatalogs = [
  {
    id: "media-gallery",
    title: "Media Gallery",
    mode: "fan",
    badge: "Images + Video",
    description: "Wall-scale visual browsing for reels, photo sets, site footage, and campaign assets.",
    accent: "cyan",
    items: [
      {
        title: "Construction Reel",
        description: "Swipe through daily progress clips and stills without dropping into a file browser.",
        meta: ["video", "field", "progress"],
        preview: "media"
      },
      {
        title: "Product Closeups",
        description: "A fan-open gallery for campaign imagery, installed shots, and high-resolution stills.",
        meta: ["images", "catalog", "retail"],
        preview: "media"
      },
      {
        title: "Promo Cuts",
        description: "Spin through short launch edits and teaser loops arranged as a wall carousel.",
        meta: ["reel", "shortform", "playback"],
        preview: "media"
      },
      {
        title: "Site Archive",
        description: "Large thumbnails and swipe gestures tuned for fast visual comparison from a standing distance.",
        meta: ["archive", "compare", "touch"],
        preview: "media"
      }
    ]
  },
  {
    id: "folder-matrix",
    title: "Folder Matrix",
    mode: "carousel",
    badge: "Folders + Trees",
    description: "Pull structured folder groups off the wall and rotate through nested project trees.",
    accent: "lime",
    items: [
      {
        title: "Projects Hub",
        description: "Nested folders for active jobs, deliverables, and client-specific content groups.",
        meta: ["folders", "jobs", "projects"],
        preview: "folder",
        tree: ["Projects", "Detroit Campus", "Media Deliverables"]
      },
      {
        title: "Operations",
        description: "Field ops, scheduling, reporting, and review folders presented as a navigable rack.",
        meta: ["ops", "reports", "live"],
        preview: "folder",
        tree: ["Operations", "Weekly Reports", "Pending Review"]
      }
    ]
  },
  {
    id: "field-binder",
    title: "Field Binder",
    mode: "binder",
    badge: "Pages + Packets",
    description: "Flip through file packets, safety sheets, and inspection pages like a physical binder.",
    accent: "amber",
    items: [
      {
        title: "Safety Packet",
        description: "Page-turn animation for field procedures, hazard notes, and compliance reminders.",
        meta: ["safety", "packet", "pages"],
        preview: "binder"
      },
      {
        title: "Inspection Checklist",
        description: "Move page by page through structured checklists with a tactile binder metaphor.",
        meta: ["inspection", "checklist", "forms"],
        preview: "binder"
      }
    ]
  },
  {
    id: "video-ribbon",
    title: "Video Ribbon",
    mode: "carousel",
    badge: "Playback Wall",
    description: "A more cinematic ribbon for quick swiping across clips, loops, and highlight cuts.",
    accent: "rose",
    items: [
      {
        title: "Lobby Welcome",
        description: "Open a highlight loop, swipe to the next cut, and fling the whole ribbon back to the wall.",
        meta: ["lobby", "loop", "welcome"],
        preview: "media"
      },
      {
        title: "Event Recap",
        description: "Short recap clips grouped for quick live presentation and touch browsing.",
        meta: ["event", "recap", "clips"],
        preview: "media"
      }
    ]
  }
];

test.beforeEach(async ({ page }) => {
  await page.route("https://40-160-254-60.sslip.io/motu-lib/catalogs.json", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockCatalogs)
    });
  });
});

test("PulseDeck keeps the same layout on phones", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Desktop Chrome", "Phone-layout assertions are only for mobile projects.");

  await page.goto("/nui/");

  const controls = page.locator(".topbar-actions .control-button");
  await expect(controls).toHaveCount(11);
  await expect(page.locator("#viewToggleButton")).toHaveText("Mobile");
  await expect(page.locator("#dock .dock-card")).toHaveCount(4);
  await expect(page.locator("#catalogCount")).toHaveText("4 Catalogs");
  await expect(page.locator("#stageTitle")).toHaveText("Media Gallery");
  await expect(page.locator("#cubeScene")).toBeVisible();

  await page.locator("#dock .dock-card").nth(1).click();
  await expect(page.locator("#stageTitle")).toHaveText("Folder Matrix");
  await expect(page.locator("#cubeScene")).toBeVisible();

  await page.locator("#fanButton").click();
  await expect(page.locator(".stack-card.top")).toBeVisible();

  await page.locator("#spinButton").click();
  await expect(page.locator("#spinButton")).toHaveClass(/mode-active/);
  await expect(page.locator(".stack-card.carousel-card")).toHaveCount(2);

  await page.locator("#cubeButton").click();
  await expect(page.locator("#cubeScene")).toBeVisible();

  await page.reload();
  await expect(page.locator("#stageTitle")).toHaveText("Media Gallery");
  await expect(page.locator("#cubeScene")).toBeVisible();

  const stageMetrics = await page.locator("#stage").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      right: rect.right,
      bottom: rect.bottom
    };
  });
  const viewport = page.viewportSize();

  expect(stageMetrics.x).toBeGreaterThanOrEqual(0);
  expect(stageMetrics.y).toBeGreaterThanOrEqual(0);
  expect(stageMetrics.right).toBeLessThanOrEqual(viewport.width);
  expect(stageMetrics.bottom).toBeLessThanOrEqual(viewport.height);
  expect(stageMetrics.width).toBeGreaterThan(250);
  expect(stageMetrics.height).toBeGreaterThan(350);

  test.info().annotations.push({
    type: "stage-metrics",
    description: `${stageMetrics.width} x ${stageMetrics.height}`
  });
});

test("PulseDeck toggles between desktop and forced mobile views", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "Desktop Chrome", "Forced-view toggle is validated on the desktop project.");

  await page.goto("/nui/");
  await expect(page.locator("#viewToggleButton")).toHaveText("Mobile");

  await page.locator("#viewToggleButton").click();
  await expect(page).toHaveURL(/\/nui\/\?view=mobile$/);
  await expect(page.locator("#viewToggleButton")).toHaveText("Desktop");
  await expect(page.locator("body")).toHaveClass(/force-mobile-view/);

  const cubeMetrics = await page.evaluate(() => {
    const cube = document.querySelector(".catalog-cube");
    const front = document.querySelector(".cube-face.front");
    const scene = document.querySelector(".cube-scene");
    const rect = (el) => el ? el.getBoundingClientRect() : null;
    return { cube: rect(cube), front: rect(front), scene: rect(scene) };
  });

  expect(cubeMetrics.front.width).toBeLessThanOrEqual(cubeMetrics.cube.width * 1.05);
  expect(cubeMetrics.front.height).toBeLessThanOrEqual(cubeMetrics.cube.height * 1.18);
  expect(cubeMetrics.front.right).toBeLessThanOrEqual(cubeMetrics.scene.right + 14);
  expect(cubeMetrics.front.left).toBeGreaterThanOrEqual(cubeMetrics.scene.left - 14);

  const forcedShell = await page.locator(".wall-app").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width
    };
  });

  expect(forcedShell.width).toBeLessThanOrEqual(430);

  await page.locator("#viewToggleButton").click();
  await expect(page).toHaveURL(/\/nui\/\?view=desktop$/);
  await expect(page.locator("#viewToggleButton")).toHaveText("Mobile");
  await expect(page.locator("body")).toHaveClass(/force-desktop-view/);
});
