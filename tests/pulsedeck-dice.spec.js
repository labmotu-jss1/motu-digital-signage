const { test, expect } = require("@playwright/test");

const makeDiceItems = (color) => ([
  { title: `${color} One`, diceValue: 1, color },
  { title: `${color} Two`, diceValue: 2, color },
  { title: `${color} Three`, diceValue: 3, color },
  { title: `${color} Four`, diceValue: 4, color },
  { title: `${color} Five`, diceValue: 5, color },
  { title: `${color} Six`, diceValue: 6, color }
]);

const mockDiceCatalogs = [
  { id: "dice-white", title: "Dice White", mode: "fan", items: makeDiceItems("white") },
  { id: "dice-red", title: "Dice Red", mode: "fan", items: makeDiceItems("red") },
  { id: "dice-black", title: "Dice Black", mode: "fan", items: makeDiceItems("black") }
];

async function getVisibleDiceCounts(page) {
  return page.evaluate(() => {
    const counts = {};
    for (const face of ["front", "right", "back", "left", "top", "bottom"]) {
      counts[face] = document.querySelectorAll(`.cube-face.${face} .dice-pip.visible`).length;
    }
    return counts;
  });
}

test.beforeEach(async ({ page }) => {
  await page.route("https://40-160-254-60.sslip.io/motu-lib/catalogs.json", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockDiceCatalogs)
    });
  });
});

test("dice sprite cube works across the three color catalogs", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "Desktop Chrome", "Visual dice comparison runs on desktop.");

  await page.goto("/nui/?diceDemo=sprite");

  await expect(page.locator("#stageTitle")).toHaveText("Dice White");
  await expect(page.locator(".dice-face[data-dice-render='sprite']")).toHaveCount(6);
  await expect(page.locator(".cube-face.front .dice-face.white")).toBeVisible();

  await page.locator("#nextButton").click();
  await expect(page.locator(".cube-face.front .dice-face.white")).toBeVisible();

  await page.locator("#dock .dock-card").nth(1).click();
  await expect(page.locator("#stageTitle")).toHaveText("Dice Red");
  await expect(page.locator(".cube-face.front .dice-face.red")).toBeVisible();

  await page.locator("#dock .dock-card").nth(2).click();
  await expect(page.locator("#stageTitle")).toHaveText("Dice Black");
  await expect(page.locator(".cube-face.front .dice-face.black")).toBeVisible();
});

test("dice css cube works across the three color catalogs", async ({ page }) => {
  await page.goto("/nui/?diceDemo=css");

  await expect(page.locator("#stageTitle")).toHaveText("Dice White");
  await expect(page.locator(".dice-face[data-dice-render='css']")).toHaveCount(6);
  await expect(page.locator(".cube-face.front .dice-face.white")).toBeVisible();
  await expect(page.locator(".cube-face.front .dice-pip.visible")).toHaveCount(1);
  await expect.poll(() => getVisibleDiceCounts(page)).toEqual({
    front: 1,
    right: 3,
    back: 6,
    left: 4,
    top: 2,
    bottom: 5
  });

  await page.locator("#nextButton").click();
  await expect(page.locator(".cube-face.front .dice-pip.visible")).toHaveCount(2);
  await expect.poll(() => getVisibleDiceCounts(page)).toEqual({
    front: 2,
    right: 1,
    back: 5,
    left: 6,
    top: 4,
    bottom: 3
  });

  await page.locator("#dock .dock-card").nth(1).click();
  await expect(page.locator(".cube-face.front .dice-face.red")).toBeVisible();

  await page.locator("#dock .dock-card").nth(2).click();
  await expect(page.locator(".cube-face.front .dice-face.black")).toBeVisible();
});

test("dice catalogs default to css rendering without a query param", async ({ page }) => {
  await page.goto("/nui/");

  await expect(page.locator("#stageTitle")).toHaveText("Dice White");
  await expect(page.locator(".dice-face[data-dice-render='css']")).toHaveCount(6);
  await expect(page.locator(".cube-face.front .dice-face.white")).toBeVisible();
});
