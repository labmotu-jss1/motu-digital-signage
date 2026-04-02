const fallbackCatalogs = [
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
      },
      {
        title: "Sales Packets",
        description: "Proposal and estimate folders you can spin past like cards on a physical track.",
        meta: ["sales", "estimates", "packets"],
        preview: "folder",
        tree: ["Sales", "Q2 Proposals", "Client Drafts"]
      },
      {
        title: "Archive Shelf",
        description: "Push old folders back, keep current work forward, and maintain spatial memory on the wall.",
        meta: ["archive", "history", "storage"],
        preview: "folder",
        tree: ["Archive", "2025", "Completed Sites"]
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
      },
      {
        title: "Client Binder",
        description: "Flip through customer documents, signoff sheets, and reference inserts on a large touch wall.",
        meta: ["client", "docs", "review"],
        preview: "binder"
      },
      {
        title: "Reference Pack",
        description: "Fast page-flip movement for manuals, notes, and bookmarked document sets.",
        meta: ["reference", "manual", "flip"],
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
      },
      {
        title: "Proofing Sequence",
        description: "Review multiple edits in order without a small-screen timeline or desktop controls.",
        meta: ["proof", "sequence", "review"],
        preview: "media"
      }
    ]
  }
];

let catalogs = [];
const remoteCatalogsUrl = "https://40-160-254-60.sslip.io/motu-lib/catalogs.json";
const catalogRefreshMs = 15000;
const viewParams = new URLSearchParams(window.location.search);
const forcedView = viewParams.get("view");
const diceDemoVariant = viewParams.get("diceDemo") || "css";
const isForcedMobileView = forcedView === "mobile";
const isForcedDesktopView = forcedView === "desktop";
const userAgent = navigator.userAgent || "";
const isIPhoneWebKit = /iPhone/i.test(userAgent) && /AppleWebKit/i.test(userAgent);

const dock = document.getElementById("dock");
const stackLayer = document.getElementById("stackLayer");
const stageTitle = document.getElementById("stageTitle");
const gestureHint = document.getElementById("gestureHint");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const demoButton = document.getElementById("demoButton");
const homeButton = document.getElementById("homeButton");
const viewToggleButton = document.getElementById("viewToggleButton");
const cubeButton = document.getElementById("cubeButton");
const spinButton = document.getElementById("spinButton");
const resetButton = document.getElementById("resetButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const expandItemButton = document.getElementById("expandItemButton");
const zoomOverlay = document.getElementById("zoomOverlay");
const zoomTitle = document.getElementById("zoomTitle");
const zoomImage = document.getElementById("zoomImage");
const zoomPreviousButton = document.getElementById("zoomPreviousButton");
const zoomHomeButton = document.getElementById("zoomHomeButton");
const zoomNextButton = document.getElementById("zoomNextButton");
const zoomInButton = document.getElementById("zoomInButton");
const zoomOutButton = document.getElementById("zoomOutButton");
const zoomCloseButton = document.getElementById("zoomCloseButton");
const catalogCount = document.getElementById("catalogCount");

const gestureConfig = {
  swipeDistance: 110,
  flingDistance: 130,
  velocityThreshold: 0.55
};

const soundState = {
  context: null,
  unlocked: false
};

const state = {
  activeCatalogId: null,
  activeIndex: 0,
  fanOpen: false,
  interactionMode: "carousel",
  cubeRotationX: -18,
  cubeRotationY: 24,
  cubePointer: null,
  cubeResumeTimer: null,
  pointer: null,
  suppressCardClickUntil: 0,
  lastGesture: "Waiting",
  pendingBinderTurn: null,
  demoTimer: null,
  demoRunning: false,
  focusClickTimer: null,
  lastTapAt: 0,
  zoomOpen: false,
  zoomScale: 1,
  refreshTimer: null
};

document.body.classList.toggle("force-mobile-view", isForcedMobileView);
document.body.classList.toggle("force-desktop-view", isForcedDesktopView);
document.body.classList.toggle("iphone-webkit", isIPhoneWebKit);
syncViewToggleButton();

setLoadingState();
void init();

viewToggleButton?.addEventListener("click", () => {
  const nextParams = new URLSearchParams(window.location.search);

  if (document.body.classList.contains("force-mobile-view")) {
    nextParams.set("view", "desktop");
  } else {
    nextParams.set("view", "mobile");
  }

  const nextQuery = nextParams.toString();
  window.location.href = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
});

homeButton.addEventListener("click", () => {
  playUiSound("return");
  goHome();
});

cubeButton.addEventListener("click", () => {
  setInteractionMode("cube");
});

spinButton.addEventListener("click", () => {
  setInteractionMode("carousel");
});

resetButton.addEventListener("click", () => {
  if (!getActiveCatalog()) return;
  playUiSound("return");
  resetCubeMotion();
  state.activeIndex = 0;
  state.interactionMode = "cube";
  state.lastGesture = "Returned to cube";
  renderModes();
  renderStage();
});

expandItemButton.addEventListener("click", () => {
  if (!getActiveCatalog()) return;
  stopDemo();
  playUiSound("expand");
  if (state.zoomOpen) {
    closeZoomView();
    return;
  }
  openZoomView();
});

zoomInButton.addEventListener("click", () => adjustZoom(0.25));
zoomOutButton.addEventListener("click", () => adjustZoom(-0.25));
zoomPreviousButton.addEventListener("click", () => stepZoomItem(-1));
zoomNextButton.addEventListener("click", () => stepZoomItem(1));
zoomHomeButton.addEventListener("click", goHomeFromZoom);
zoomCloseButton.addEventListener("click", closeZoomView);
zoomOverlay.addEventListener("click", (event) => {
  if (event.target === zoomOverlay || event.target.classList.contains("zoom-backdrop")) {
    closeZoomView();
  }
});

previousButton.addEventListener("click", () => {
  if (!getActiveCatalog()) return;
  stopDemo();
  playUiSound("swipe");
  if (state.zoomOpen) {
    stepZoomItem(-1);
    return;
  }
  turnCatalog(-1);
});

nextButton.addEventListener("click", () => {
  if (!getActiveCatalog()) return;
  stopDemo();
  playUiSound("swipe");
  if (state.zoomOpen) {
    stepZoomItem(1);
    return;
  }
  turnCatalog(1);
});

demoButton.addEventListener("click", () => {
  if (state.demoRunning) {
    stopDemo();
    renderStage();
    return;
  }
  startDemo();
});

fullscreenButton.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await enterFullscreenIfNeeded();
  } else {
    await document.exitFullscreen();
    document.body.classList.remove("fullscreen-on");
    fullscreenButton.textContent = "Full";
  }
});

document.addEventListener("fullscreenchange", () => {
  const inFullscreen = Boolean(document.fullscreenElement);
  document.body.classList.toggle("fullscreen-on", inFullscreen);
  fullscreenButton.textContent = inFullscreen ? "Exit" : "Full";
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (state.zoomOpen) {
      goHomeFromZoom();
      return;
    }
    if (getActiveCatalog() && state.interactionMode !== "cube") {
      stopDemo();
      state.interactionMode = "cube";
      state.lastGesture = "Returned to cube";
      renderModes();
      renderStage();
    }
    return;
  }

  if (!state.zoomOpen && state.interactionMode === "carousel") {
    if (event.key === "ArrowLeft") {
      stopDemo();
      turnCatalog(-1);
      return;
    }
    if (event.key === "ArrowRight") {
      stopDemo();
      turnCatalog(1);
      return;
    }
    if (event.key === "Enter") {
      stopDemo();
      playUiSound("expand");
      openZoomView();
      return;
    }
  }

  if (!state.zoomOpen) return;
  if (event.key === "ArrowLeft") {
    stepZoomItem(-1);
  } else if (event.key === "ArrowRight") {
    stepZoomItem(1);
  } else if (event.key === "+" || event.key === "=") {
    adjustZoom(0.25);
  } else if (event.key === "-") {
    adjustZoom(-0.25);
  } else if (event.key.toLowerCase() === "h") {
    goHomeFromZoom();
  }
});

function resetCubeMotion() {
  state.cubeRotationX = -18;
  state.cubeRotationY = 24;
  if (state.cubeResumeTimer) {
    clearTimeout(state.cubeResumeTimer);
    state.cubeResumeTimer = null;
  }
}

function queueCubeAutoSpin(scene) {
  if (state.cubeResumeTimer) {
    clearTimeout(state.cubeResumeTimer);
  }
  state.cubeResumeTimer = setTimeout(() => {
    scene.classList.remove("manual");
    state.cubeResumeTimer = null;
  }, 1400);
}

document.addEventListener("pointerdown", unlockAudio, { passive: true });

function unlockAudio() {
  if (soundState.unlocked) return;

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return;

  try {
    soundState.context = soundState.context || new AudioContextCtor();
    if (soundState.context.state === "suspended") {
      void soundState.context.resume();
    }
    soundState.unlocked = true;
  } catch (error) {
    console.warn("Audio unlock failed.", error);
  }
}

function playUiSound(kind) {
  if (!soundState.unlocked || !soundState.context) return;

  const context = soundState.context;
  const now = context.currentTime;
  const tones = {
    select: [
      { type: "triangle", start: 540, end: 760, duration: 0.07, gain: 0.05 },
      { type: "sine", start: 760, end: 900, duration: 0.09, gain: 0.022, delay: 0.014 }
    ],
    focus: [
      { type: "sine", start: 420, end: 560, duration: 0.08, gain: 0.03 },
      { type: "triangle", start: 760, end: 620, duration: 0.1, gain: 0.018, delay: 0.01 }
    ],
    swipe: [
      { type: "triangle", start: 920, end: 380, duration: 0.11, gain: 0.04 }
    ],
    expand: [
      { type: "triangle", start: 420, end: 1220, duration: 0.18, gain: 0.055 },
      { type: "sine", start: 860, end: 1280, duration: 0.2, gain: 0.022, delay: 0.03 }
    ],
    open: [
      { type: "triangle", start: 760, end: 1120, duration: 0.11, gain: 0.045 },
      { type: "sine", start: 1120, end: 1380, duration: 0.12, gain: 0.018, delay: 0.02 }
    ],
    return: [
      { type: "triangle", start: 520, end: 180, duration: 0.18, gain: 0.05 }
    ]
  };

  const recipe = tones[kind];
  if (!recipe) return;

  recipe.forEach((tone) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const startAt = now + (tone.delay || 0);
    const stopAt = startAt + tone.duration;

    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.start, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, tone.end), stopAt);
    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(tone.gain, startAt + 0.018);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, stopAt);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(stopAt);
  });
}

function getActiveCatalog() {
  return catalogs.find((catalog) => catalog.id === state.activeCatalogId) || null;
}

async function init() {
  catalogs = await loadCatalogs();
  if (catalogCount) catalogCount.textContent = `${catalogs.length} Catalogs`;
  renderDock();
  renderModes();

  if (catalogs.length === 0) {
    renderEmpty();
    return;
  }

  activateCatalog(catalogs[0].id, catalogs === fallbackCatalogs ? "Sample loaded" : "Library synced");

  if (!state.refreshTimer) {
    state.refreshTimer = setInterval(() => {
      void refreshCatalogs();
    }, catalogRefreshMs);
  }
}

async function loadCatalogs() {
  try {
    const response = await fetch(remoteCatalogsUrl, { cache: "no-store", mode: "cors" });
    if (!response.ok) {
      throw new Error(`Catalog request failed: ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload) || payload.length === 0) {
      return normalizeCatalogs(withInjectedCatalogs(fallbackCatalogs));
    }

    return normalizeCatalogs(withInjectedCatalogs(payload));
  } catch (error) {
    console.warn("Falling back to bundled sample catalogs.", error);
    return normalizeCatalogs(withInjectedCatalogs(fallbackCatalogs));
  }
}

function withInjectedCatalogs(nextCatalogs) {
  return Array.isArray(nextCatalogs) ? [...nextCatalogs] : [];
}

function normalizeCatalogs(nextCatalogs) {
  if (!Array.isArray(nextCatalogs)) return [];

  const diceCatalogs = nextCatalogs.filter((catalog) => isLegacyDiceCatalog(catalog));
  const nonDiceCatalogs = nextCatalogs.filter((catalog) => !isLegacyDiceCatalog(catalog));

  if (!diceCatalogs.length) {
    return nonDiceCatalogs;
  }

  const diceItems = Array.from({ length: 6 }, (_, index) => ({
    title: `Dice ${index + 1}`,
    description: `Synthetic mixed-color dice face ${index + 1}.`,
    meta: ["DICE", "MIXED", "Live VM"],
    preview: "media",
    assetType: "dice",
    extension: ".dice",
    diceValue: index + 1,
    color: "mixed"
  }));

  return [
    {
      id: "dice",
      title: "Dice",
      mode: "fan",
      badge: "Dice Cube · 6",
      description: "Single dice catalog with color rotation across white, red, and black faces.",
      accent: "lime",
      items: diceItems
    },
    ...nonDiceCatalogs
  ];
}

function isLegacyDiceCatalog(catalog) {
  const id = `${catalog?.id || ""}`.toLowerCase();
  const title = `${catalog?.title || ""}`.toLowerCase();
  return id.startsWith("dice-") || title.startsWith("dice ");
}

function setLoadingState() {
  if (catalogCount) catalogCount.textContent = "Loading";
  if (stageTitle) stageTitle.textContent = "Loading catalog";
  expandItemButton.disabled = true;
}

async function refreshCatalogs() {
  const nextCatalogs = await loadCatalogs();
  if (!Array.isArray(nextCatalogs) || nextCatalogs.length === 0) return;

  const changed = JSON.stringify(nextCatalogs.map((catalog) => ({
    id: catalog.id,
    title: catalog.title,
    items: catalog.items?.length || 0
  }))) !== JSON.stringify(catalogs.map((catalog) => ({
    id: catalog.id,
    title: catalog.title,
    items: catalog.items?.length || 0
  })));

  if (!changed) return;

  const currentId = state.activeCatalogId;
  catalogs = nextCatalogs;
  if (catalogCount) catalogCount.textContent = `${catalogs.length} Catalogs`;

  if (!currentId || !catalogs.some((catalog) => catalog.id === currentId)) {
    renderDock();
    renderModes();
    activateCatalog(catalogs[0].id, "Library refreshed");
    return;
  }

  const activeCatalog = getActiveCatalog();
  state.activeIndex = Math.min(state.activeIndex, Math.max(0, (activeCatalog?.items?.length || 1) - 1));
  renderDock();
  renderModes();
  renderStage();
}

function renderDock() {
  dock.innerHTML = catalogs.map((catalog) => `
    <article class="dock-card ${state.activeCatalogId === catalog.id ? "active" : ""}" data-catalog-id="${catalog.id}">
      <label class="dock-check">
        <input class="dock-check-input" type="radio" ${state.activeCatalogId === catalog.id ? "checked" : ""} />
        <span class="dock-check-indicator" aria-hidden="true"></span>
      </label>
      <h4>${catalog.title}</h4>
    </article>
  `).join("");

  dock.querySelectorAll(".dock-card").forEach((card) => {
    card.addEventListener("click", () => {
      stopDemo();
      playUiSound("select");
      activateCatalog(card.dataset.catalogId, "Pulled from wall");
    });
  });
}

function renderModes() {
  const catalog = getActiveCatalog();
  [
    { element: cubeButton, mode: "cube" },
    { element: spinButton, mode: "carousel" }
  ].forEach(({ element, mode }) => {
    if (!element) return;
    const enabled = Boolean(catalog && canUseMode(catalog, mode));
    element.disabled = !enabled;
    element.classList.toggle("mode-active", enabled && state.interactionMode === mode);
  });
}

function canUseMode(catalog, mode) {
  return Boolean(catalog && mode);
}

function renderEmpty() {
  state.activeCatalogId = null;
  state.zoomOpen = false;
  state.zoomScale = 1;
  if (stageTitle) stageTitle.textContent = "Select a catalog";
  if (catalogCount) catalogCount.textContent = `${catalogs.length} Catalogs`;
  stackLayer.innerHTML = "";
  expandItemButton.disabled = true;
  previousButton.disabled = true;
  nextButton.disabled = true;
  demoButton.classList.remove("active-demo");
  demoButton.textContent = "Demo";
  expandItemButton.textContent = "Expand";
  zoomOverlay.hidden = true;
  document.body.classList.remove("zoom-open");
  renderDock();
  renderModes();
}

function setInteractionMode(mode) {
  const catalog = getActiveCatalog();
  if (!catalog || !canUseMode(catalog, mode)) return;
  stopDemo();
  playUiSound("select");
  state.interactionMode = mode;
  state.lastGesture = `Mode: ${mode}`;
  renderModes();
  renderStage();
}

function renderStage() {
  const catalog = getActiveCatalog();
  if (!catalog) {
    renderEmpty();
    return;
  }

  const stageElement = document.getElementById("stage");
  stageElement?.classList.toggle("expanded-mode", state.zoomOpen);

  if (stageTitle) stageTitle.textContent = catalog.title;
  demoButton.classList.toggle("active-demo", state.demoRunning);
  demoButton.textContent = state.demoRunning ? "Stop" : "Demo";
  previousButton.disabled = state.zoomOpen ? state.activeIndex <= 0 : false;
  nextButton.disabled = state.zoomOpen ? state.activeIndex >= catalog.items.length - 1 : false;
  expandItemButton.textContent = state.zoomOpen ? "Close" : "Expand";

  if (state.interactionMode === "cube") {
    renderCubeStage(catalog);
    expandItemButton.disabled = true;
    renderZoomView();
    return;
  }

  if (state.interactionMode === "carousel" && !state.zoomOpen) {
    renderCarouselStage(catalog);
    expandItemButton.disabled = false;
    renderZoomView();
    return;
  }

  if (state.zoomOpen) {
    renderExpandedStage(catalog);
    expandItemButton.disabled = false;
    renderZoomView();
    return;
  }

  const items = buildOrderedItems(catalog);
  stackLayer.innerHTML = items.map((item) => renderCard(catalog, item)).join("");

  stackLayer.querySelectorAll(".stack-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (Date.now() < state.suppressCardClickUntil) return;

      const cardIndex = Number(card.dataset.index);
      stopDemo();

      if (cardIndex === state.activeIndex) {
        playUiSound("expand");
        openZoomView();
        return;
      }

      if (state.focusClickTimer) {
        clearTimeout(state.focusClickTimer);
        state.focusClickTimer = null;
      }

      playUiSound("select");
      state.activeIndex = cardIndex;
      state.lastGesture = "Selected item";
      renderStage();
    });
  });

  const topCard = stackLayer.querySelector(".stack-card.top");
  if (topCard) {
    attachGesture(topCard);
  }

  expandItemButton.disabled = false;
  renderZoomView();
}

function renderCarouselStage(catalog) {
  const items = buildCarouselItems(catalog);
  stackLayer.innerHTML = `
    <div class="carousel-ring-stage">
      <div class="carousel-floor"></div>
      <div class="carousel-ring">
        ${items.map((item, position) => renderCarouselCard(catalog, item, position, items.length)).join("")}
      </div>
    </div>
  `;

  const stage = stackLayer.querySelector(".carousel-ring-stage");
  stage?.addEventListener("wheel", (event) => {
    event.preventDefault();
    stopDemo();
    if (Math.abs(event.deltaY) < 4) return;
    turnCatalog(event.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  stackLayer.querySelectorAll(".carousel-ring-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      const cardIndex = Number(card.dataset.index);
      if (cardIndex === state.activeIndex) return;
      stopDemo();
      state.activeIndex = cardIndex;
      state.lastGesture = "Hovered item";
      renderStage();
    });

    card.addEventListener("click", () => {
      if (Date.now() < state.suppressCardClickUntil) return;
      const cardIndex = Number(card.dataset.index);
      stopDemo();
      if (cardIndex === state.activeIndex) {
        playUiSound("expand");
        openZoomView();
        return;
      }
      playUiSound("select");
      state.activeIndex = cardIndex;
      state.lastGesture = "Selected item";
      renderStage();
    });
  });
}

function buildCarouselItems(catalog) {
  return catalog.items.map((item, index) => ({
    ...item,
    index
  }));
}

function renderCarouselCard(catalog, item, position, total) {
  const offset = getCarouselOffset(position, total, state.activeIndex);
  const angleStep = (Math.PI * 2) / Math.max(total, 1);
  const angle = offset * angleStep;
  const viewportWidth = window.innerWidth || 1440;
  const viewportHeight = window.innerHeight || 900;
  const radiusX = Math.min(Math.max(viewportWidth * 0.26, 320), 470);
  const radiusZ = Math.min(Math.max(viewportWidth * 0.13, 150), 220);
  const backLift = Math.min(Math.max(viewportHeight * 0.11, 76), 128);
  const x = Math.sin(angle) * radiusX;
  const z = Math.cos(angle) * radiusZ;
  const y = (z < 0 ? -((-z / radiusZ) * backLift) : 0) + (offset === 0 ? -22 : 0);
  const normalizedDepth = (z + radiusZ) / (radiusZ * 2);
  const scale = 0.84 + (normalizedDepth * 0.18) + (offset === 0 ? 0.05 : 0);
  const rotateY = -Math.sin(angle) * 14;
  const opacity = getCarouselOpacity(offset, normalizedDepth);
  const zIndex = Math.round((normalizedDepth * 100) + (offset === 0 ? 100 : 0));
  return `
    <article
      class="carousel-ring-card ${offset === 0 ? "center" : ""}"
      data-index="${item.index}"
      style="transform: translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px); opacity:${opacity}; z-index:${zIndex};"
    >
      <div class="carousel-card-face" style="transform: rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(3)});">
        ${renderPreview(catalog, item)}
      </div>
    </article>
  `;
}

function getCarouselOffset(position, total, activeIndex) {
  let offset = position - activeIndex;
  if (offset > total / 2) offset -= total;
  if (offset < -(total / 2)) offset += total;
  return offset;
}

function getCarouselOpacity(offset, normalizedDepth = 0.5) {
  const distance = Math.abs(offset);
  if (distance === 0) return 1;
  if (distance === 1) return Math.max(0.8, 0.82 + (normalizedDepth * 0.14));
  if (distance === 2) return Math.max(0.62, 0.68 + (normalizedDepth * 0.12));
  if (distance === 3) return Math.max(0.48, 0.56 + (normalizedDepth * 0.1));
  return 0.42;
}

function renderCubeStage(catalog) {
  stackLayer.innerHTML = renderCubeScene(catalog, {
    rotationX: state.cubeRotationX,
    rotationY: state.cubeRotationY,
    interactive: true,
    cubeId: "catalogCube",
    sceneId: "cubeScene"
  });

  const scene = document.getElementById("cubeScene");
  const cube = document.getElementById("catalogCube");
  attachCubeInteraction(scene, cube, catalog.id);
}

function renderCubeScene(catalog, options = {}) {
  const faces = isDiceCatalog(catalog)
    ? buildDiceCubeFaces(catalog)
    : Array.from({ length: 6 }, (_, faceIndex) => {
        const itemIndex = (state.activeIndex + faceIndex) % catalog.items.length;
        const item = catalog.items[itemIndex];
        return {
          ...item,
          index: itemIndex
        };
      });
  const faceClasses = ["front", "right", "back", "left", "top", "bottom"];
  const {
    rotationX = state.cubeRotationX,
    rotationY = state.cubeRotationY,
    interactive = false,
    sceneId = "",
    cubeId = "",
    sceneClass = "cube-scene auto-spin",
    cubeClass = "catalog-cube",
    sceneStyle = "",
    catalogIndex = 0
  } = options;

  return `
    <div class="${sceneClass}" ${sceneId ? `id="${sceneId}"` : ""} data-catalog-id="${catalog.id}" style="${sceneStyle}">
      <div
        class="${cubeClass}"
        ${cubeId ? `id="${cubeId}"` : ""}
        style="transform: rotateX(${rotationX}deg) rotateY(${rotationY}deg);"
      >
        ${faces.map((item, faceIndex) => `
          <article
            class="cube-face ${faceClasses[faceIndex]} ${faceIndex === 0 ? "active" : ""}"
            data-index="${item.index}"
            data-catalog-id="${catalog.id}"
          >
            <div class="cube-face-clip" style="${getCubeFaceStyle(item)}">
              <div class="cube-face-glow"></div>
              ${(item.assetUrl && getAssetType(item) === "image") ? "" : renderCubeFacePreview(catalog, item, faceIndex, catalogIndex)}
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

function renderExpandedStage(catalog) {
  const activeItem = getActiveItem();
  if (stageTitle) stageTitle.textContent = activeItem?.title || catalog.title;

  if (!activeItem) {
    stackLayer.innerHTML = "";
    return;
  }

  stackLayer.innerHTML = `
    <article class="expanded-stage-card ${activeItem.assetUrl ? "" : "fallback"}">
      ${renderExpandedAsset(activeItem)}
    </article>
  `;
}

function openCubeFace(index, catalogId = state.activeCatalogId) {
  if (Date.now() < state.suppressCardClickUntil) return;
  stopDemo();
  playUiSound("select");
  state.activeCatalogId = catalogId;
  state.activeIndex = Number(index) || 0;
  state.interactionMode = "carousel";
  state.lastGesture = "Cube face opened";
  renderModes();
  renderStage();
}

function renderCubeFacePreview(catalog, item, faceIndex, catalogIndex = 0) {
  if (isDiceCatalog(catalog)) {
    return renderDiceFace(catalog, item, faceIndex, catalogIndex);
  }
  if ((item.assetUrl || item.youtubeEmbedId) && getAssetType(item) === "video") {
    return renderCubeVideoFace(item);
  }
  return renderPreview(catalog, item);
}

function renderCubeVideoFace(item) {
  const sourceLabel = item.sourceLabel || "Live video";
  const poster = item.posterUrl ? ` poster="${item.posterUrl}"` : "";

  if (item.youtubeEmbedId) {
    const embedUrl = getYouTubeEmbedUrl(item.youtubeEmbedId);
    return `
      <div class="cube-video-shell youtube">
        <iframe
          class="cube-face-video cube-face-video-embed"
          src="${embedUrl}"
          title="${item.title}"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
        <div class="cube-video-overlay">
          <span class="cube-video-pill">${sourceLabel}</span>
          <strong>${item.title}</strong>
        </div>
      </div>
    `;
  }

  return `
    <div class="cube-video-shell">
      <video
        class="cube-face-video"
        src="${item.assetUrl}"
        autoplay
        muted
        loop
        playsinline
        webkit-playsinline="true"
        preload="metadata"${poster}
      ></video>
      <div class="cube-video-overlay">
        <span class="cube-video-pill">${sourceLabel}</span>
        <strong>${item.title}</strong>
      </div>
    </div>
  `;
}

function getYouTubeEmbedUrl(videoId) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: videoId,
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    enablejsapi: "1"
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function getCubeFaceStyle(item) {
  if (!item.assetUrl || getAssetType(item) !== "image") return "";
  return `background-image: linear-gradient(145deg, rgba(97, 231, 255, 0.1), rgba(4, 12, 22, 0.08)), url('${item.assetUrl}'); background-size: cover; background-position: center;`;
}

function isDiceCatalog(catalog) {
  const source = `${catalog?.id || ""} ${catalog?.title || ""}`.toLowerCase();
  return source.includes("dice");
}

function buildDiceCubeFaces(catalog) {
  const activeValue = normalizeDiceValue(catalog.items[state.activeIndex]?.diceValue || 1);
  const faceValues = getDiceFaceLayout(activeValue);

  return faceValues.map((faceValue) => {
    const itemIndex = catalog.items.findIndex((item) => normalizeDiceValue(item.diceValue) === faceValue);
    const item = catalog.items[itemIndex >= 0 ? itemIndex : 0] || {};
    return {
      ...item,
      index: itemIndex >= 0 ? itemIndex : 0,
      diceValue: faceValue
    };
  });
}

function normalizeDiceValue(value) {
  const numeric = Number(value);
  if (numeric >= 1 && numeric <= 6) return numeric;
  return 1;
}

function getDiceFaceLayout(frontValue) {
  const layouts = {
    1: [1, 3, 6, 4, 2, 5],
    2: [2, 1, 5, 6, 4, 3],
    3: [3, 5, 4, 1, 2, 6],
    4: [4, 6, 3, 2, 1, 5],
    5: [5, 3, 2, 4, 6, 1],
    6: [6, 3, 1, 2, 4, 5]
  };
  return layouts[frontValue] || layouts[1];
}

function renderDiceFace(catalog, item, faceIndex, catalogIndex = 0) {
  const faceValue = normalizeDiceValue(item.diceValue) || [1, 3, 6, 4, 2, 5][faceIndex] || 1;
  const faceLabel = item.title || `Dice ${faceValue}`;
  const color = getDiceColor(catalog, item, faceIndex, catalogIndex);

  if (diceDemoVariant === "css") {
    return renderCssDiceFace(faceValue, color, faceLabel);
  }

  return renderSpriteDiceFace(faceValue, color, faceLabel);
}

function getDiceColor(catalog, item, faceIndex = 0, catalogIndex = 0) {
  const source = `${item?.color || ""} ${catalog?.id || ""} ${catalog?.title || ""}`.toLowerCase();
  if (source.includes("mixed") || catalog?.id === "dice") {
    const cycle = ["white", "red", "black"];
    return cycle[(faceIndex + catalogIndex) % cycle.length];
  }
  if (source.includes("red")) return "red";
  if (source.includes("black")) return "black";
  if (source.includes("blue")) return "blue";
  return "white";
}

function renderSpriteDiceFace(faceValue, color, faceLabel) {
  return `
    <div class="dice-face dice-face-sprite ${color}" data-dice-render="sprite" aria-label="${faceLabel}">
      <div
        class="dice-sprite-face"
        style="background-image:url('${getDiceSpriteDataUrl(color)}'); background-position:${getDiceSpritePosition(faceValue)} 50%;"
      ></div>
    </div>
  `;
}

function renderCssDiceFace(faceValue, color, faceLabel) {
  return `
    <div class="dice-face dice-face-css ${color}" data-dice-render="css" aria-label="${faceLabel}">
      <div class="dice-pip-grid face-${faceValue}">
        ${Array.from({ length: 9 }, (_, index) => `
          <span class="dice-pip slot-${index + 1} ${shouldShowPip(faceValue, index + 1) ? "visible" : ""}"></span>
        `).join("")}
      </div>
    </div>
  `;
}

function shouldShowPip(faceValue, slot) {
  const slotMap = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };
  return (slotMap[faceValue] || []).includes(slot);
}

function getDiceSpritePosition(faceValue) {
  const offset = Math.max(0, Math.min(faceValue - 1, 5));
  return `${offset * 20}%`;
}

function getDiceSpriteDataUrl(color) {
  const palettes = {
    white: {
      face: "#f7f7f5",
      edge: "#d5d9df",
      pip: "#1f2328",
      glow: "#ffffff"
    },
    red: {
      face: "#d84a4a",
      edge: "#a52828",
      pip: "#fbfbfb",
      glow: "#ffb1b1"
    },
    black: {
      face: "#2b2e33",
      edge: "#0f1114",
      pip: "#f4f6f8",
      glow: "#939aa3"
    },
    blue: {
      face: "#4f7ff5",
      edge: "#1e49a8",
      pip: "#f7fbff",
      glow: "#a7c8ff"
    }
  };
  const palette = palettes[color] || palettes.white;
  const pipSets = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };
  const positions = {
    1: [28, 28],
    3: [72, 28],
    4: [28, 50],
    5: [50, 50],
    6: [72, 50],
    7: [28, 72],
    9: [72, 72]
  };
  const faces = Array.from({ length: 6 }, (_, index) => {
    const faceValue = index + 1;
    const x = index * 100;
    const pips = pipSets[faceValue].map((slot) => {
      const [cx, cy] = positions[slot];
      return `<circle cx="${x + cx}" cy="${cy}" r="6.5" fill="${palette.pip}" />`;
    }).join("");
    return `
      <g transform="translate(${x},0)">
        <rect x="9" y="9" width="82" height="82" rx="18" fill="${palette.face}" />
        <rect x="9" y="9" width="82" height="82" rx="18" fill="url(#shine)" opacity="0.55" />
        <rect x="9" y="9" width="82" height="82" rx="18" fill="none" stroke="${palette.edge}" stroke-width="2.5" />
        ${pips}
      </g>
    `;
  }).join("");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="100" viewBox="0 0 600 100">
      <defs>
        <linearGradient id="shine" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${palette.glow}" />
          <stop offset="0.35" stop-color="${palette.glow}" stop-opacity="0.35" />
          <stop offset="1" stop-color="#000000" stop-opacity="0.08" />
        </linearGradient>
      </defs>
      ${faces}
    </svg>
  `.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getAssetType(item) {
  if (item.assetType) return item.assetType;
  const source = (item.extension || item.assetUrl || "").toLowerCase();
  if (/\.(png|jpg|jpeg|webp|gif|bmp)$/.test(source)) return "image";
  if (/\.(mp4|mov|m4v|webm)$/.test(source)) return "video";
  if (/\.(mp3|wav|m4a|aac|ogg)$/.test(source)) return "audio";
  if (/\.(txt|log|md)$/.test(source)) return "text";
  if (/\.pdf$/.test(source)) return "pdf";
  return "file";
}

function buildOrderedItems(catalog) {
  if (state.interactionMode === "carousel") {
    const offsets = [-2, -1, 0, 1, 2, 3];
    return offsets
      .filter((offset, position, array) => position < catalog.items.length && array.indexOf(offset) === position)
      .map((offset) => {
        const index = (state.activeIndex + offset + catalog.items.length) % catalog.items.length;
        return {
          ...catalog.items[index],
          index,
          relative: offset
        };
      });
  }

  return catalog.items
    .map((item, index) => ({
      ...item,
      index,
      relative: (index - state.activeIndex + catalog.items.length) % catalog.items.length
    }))
    .sort((a, b) => a.relative - b.relative)
    .slice(0, Math.min(catalog.items.length, 9));
}

function renderCard(catalog, item) {
  const layout = computeLayout(catalog, item.relative);
  const classes = [
    "stack-card",
    item.relative === 0 ? "top" : "",
    state.interactionMode === "carousel" ? "carousel-card" : "",
    catalog.mode === "binder" ? "binder" : "",
    catalog.mode === "carousel" && catalog.id !== "media-gallery" ? "folder" : ""
  ].filter(Boolean).join(" ");

  return `
    <article
      class="${classes}"
      data-index="${item.index}"
      style="transform:${layout.transform}; opacity:${layout.opacity}; z-index:${layout.zIndex};"
    >
      ${renderPreview(catalog, item)}
    </article>
  `;
}

function computeLayout(catalog, relative) {
  if (state.interactionMode === "carousel") {
    const slot = Math.max(0, Math.min(relative + 2, 5));
    const xMap = [-520, -290, -18, 256, 486, 646];
    const yMap = [146, 60, 0, 32, 104, 174];
    const rotateMap = [-12, -7, 0, 5, 9, 13];
    const yawMap = [70, 44, 0, -34, -56, -70];
    const scaleMap = [0.28, 0.62, 1.34, 0.78, 0.48, 0.24];
    return {
      transform: `translateX(${xMap[slot]}px) translateY(${yMap[slot]}px) rotateY(${yawMap[slot]}deg) rotate(${rotateMap[slot]}deg) scale(${scaleMap[slot]})`,
      opacity: [0.08, 0.44, 1, 0.66, 0.28, 0.06][slot],
      zIndex: [10, 45, 120, 70, 28, 8][slot]
    };
  }

  if (state.interactionMode === "binder" || catalog.mode === "binder") {
    const x = (relative * 22) - 18;
    const y = relative * 6;
    const rotate = (relative * 2.6) - 3;
    const scale = Math.max(0.82, 1 - (relative * 0.05));
    return {
      transform: `translateX(${x}px) translateY(${y}px) rotate(${rotate}deg) scale(${scale})`,
      opacity: Math.max(0.3, 1 - (relative * 0.1)),
      zIndex: 100 - relative
    };
  }

  const x = (relative * 82) - 132;
  const y = relative * 12;
  const rotate = (relative * 10) - 17;
  const scale = Math.max(0.74, 1 - (relative * 0.065));
  return {
    transform: `translateX(${x}px) translateY(${y}px) rotate(${rotate}deg) scale(${scale})`,
    opacity: Math.max(0.28, 1 - (relative * 0.14)),
    zIndex: 100 - relative
  };
}

function renderPreview(catalog, item) {
  if (item.assetUrl && getAssetType(item) === "image") {
    return `
      <div class="preview-shell asset">
        <img src="${item.assetUrl}" alt="${item.title}" loading="lazy" />
      </div>
    `;
  }

  if (item.assetUrl && getAssetType(item) === "video") {
    if (state.interactionMode === "carousel") {
      return `
        <div class="preview-shell video live-carousel-video">
          <video
            class="carousel-card-video"
            src="${item.assetUrl}"
            autoplay
            muted
            loop
            playsinline
            webkit-playsinline="true"
            preload="metadata"
          ></video>
          <div class="carousel-video-sheen"></div>
          <div class="asset-title">${item.title}</div>
        </div>
      `;
    }

    return `
      <div class="preview-shell video">
        <div class="asset-badge">Video</div>
        <div class="asset-icon video-icon"></div>
        <div class="asset-title">${item.title}</div>
      </div>
    `;
  }

  if (item.assetUrl && getAssetType(item) === "audio") {
    return `
      <div class="preview-shell audio">
        <div class="asset-badge">Audio</div>
        <div class="asset-wave"><span></span><span></span><span></span><span></span><span></span></div>
        <div class="asset-title">${item.title}</div>
      </div>
    `;
  }

  if (item.assetUrl && getAssetType(item) === "text") {
    return `
      <div class="preview-shell text">
        <div class="asset-badge">Text</div>
        <div class="text-lines"><span></span><span></span><span></span><span></span></div>
        <div class="asset-title">${item.title}</div>
      </div>
    `;
  }

  if (item.assetUrl && getAssetType(item) === "pdf") {
    return `
      <div class="preview-shell pdf">
        <div class="asset-badge">PDF</div>
        <div class="pdf-sheet"></div>
        <div class="asset-title">${item.title}</div>
      </div>
    `;
  }

  if (item.preview === "folder") {
    const tree = item.tree || ["Root", "Folder", "Current"];
    return `
      <div class="preview-shell folder">
        <div class="folder-tree">
          ${tree.map((label, index) => `
            <div class="folder-row level-${index}">
              <span class="folder-icon"></span>
              <span>${label}</span>
              <small>${index === tree.length - 1 ? "open" : "branch"}</small>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (item.preview === "binder") {
    return `
      <div class="preview-shell binder">
        <div class="binder-rings"><span></span><span></span><span></span></div>
        <div class="binder-page ${state.pendingBinderTurn || ""}">
          <div class="binder-line short"></div>
          <div class="binder-line"></div>
          <div class="binder-line"></div>
          <div class="binder-line short"></div>
          <div class="binder-line"></div>
          <div class="binder-line short"></div>
          <div class="binder-line"></div>
          <div class="binder-line short"></div>
        </div>
      </div>
    `;
  }

  return `
    <div class="preview-shell media">
      <span class="play-badge"></span>
      <div class="thumb-strip"><span></span><span></span><span></span></div>
    </div>
  `;
}

function renderExpandedAsset(item) {
  if (!item.assetUrl) {
    if (item.youtubeEmbedId) {
      return `
        <div class="expanded-stage-media">
          <iframe
            class="expanded-stage-frame"
            src="${getYouTubeEmbedUrl(item.youtubeEmbedId)}"
            title="${item.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }
    return renderPreview(null, item);
  }

  switch (getAssetType(item)) {
    case "image":
      return `
        <div class="expanded-stage-media">
          <img src="${item.assetUrl}" alt="${item.title}" class="expanded-stage-image" />
        </div>
      `;
    case "video":
      return `
        <div class="expanded-stage-media">
          <video class="expanded-stage-video" src="${item.assetUrl}" controls playsinline preload="metadata"></video>
        </div>
      `;
    case "audio":
      return `
        <div class="expanded-stage-media audio-stage">
          <div class="audio-stage-card">
            <h4>${item.title}</h4>
            <audio class="expanded-stage-audio" src="${item.assetUrl}" controls preload="metadata"></audio>
          </div>
        </div>
      `;
    case "text":
    case "pdf":
    case "file":
      return `
        <div class="expanded-stage-media">
          <iframe class="expanded-stage-frame" src="${item.assetUrl}" title="${item.title}"></iframe>
        </div>
      `;
    default:
      return renderPreview(null, item);
  }
}

function attachCubeInteraction(scene, cube, catalogId = state.activeCatalogId) {
  scene.addEventListener("pointerdown", (event) => {
    state.cubePointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startRotationX: state.cubeRotationX,
      startRotationY: state.cubeRotationY,
      moved: false,
      startFaceIndex: getCubeFaceIndexAtPoint(event.clientX, event.clientY)
    };
    scene.classList.add("manual");
    scene.setPointerCapture(event.pointerId);
  });

  scene.addEventListener("pointermove", (event) => {
    if (!state.cubePointer || state.cubePointer.id !== event.pointerId) return;

    const dx = event.clientX - state.cubePointer.startX;
    const dy = event.clientY - state.cubePointer.startY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      state.cubePointer.moved = true;
    }

    state.cubeRotationY = state.cubePointer.startRotationY + (dx * 0.34);
    state.cubeRotationX = state.cubePointer.startRotationX - (dy * 0.28);
    cube.style.transform = `rotateX(${state.cubeRotationX}deg) rotateY(${state.cubeRotationY}deg)`;
  });

  scene.addEventListener("pointerup", (event) => {
    if (!state.cubePointer || state.cubePointer.id !== event.pointerId) return;

    const releasedFaceIndex = getCubeFaceIndexAtPoint(event.clientX, event.clientY);
    if (state.cubePointer.moved) {
      state.suppressCardClickUntil = Date.now() + 240;
    } else if (
      state.cubePointer.startFaceIndex &&
      releasedFaceIndex &&
      state.cubePointer.startFaceIndex === releasedFaceIndex
    ) {
      openCubeFace(releasedFaceIndex, catalogId);
    } else {
      openCubeFace(state.activeIndex, catalogId);
    }

    state.cubePointer = null;
    queueCubeAutoSpin(scene);
  });

  scene.addEventListener("pointercancel", () => {
    state.cubePointer = null;
    queueCubeAutoSpin(scene);
  });
}

function getCubeFaceIndexAtPoint(clientX, clientY) {
  const elements = document.elementsFromPoint(clientX, clientY);
  const face = elements.find((element) => element.classList?.contains("cube-face"));
  return face?.dataset.index || null;
}

function returnToWall() {
  state.activeCatalogId = null;
  state.activeIndex = 0;
  state.fanOpen = false;
  state.interactionMode = "carousel";
  state.lastGesture = "Returned";
  renderDock();
  renderModes();
  renderEmpty();
}

function attachGesture(card) {
  card.addEventListener("pointerdown", (event) => {
    state.pointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocityX: 0,
      velocityY: 0,
      moved: false
    };

    card.classList.add("dragging");
    card.setPointerCapture(event.pointerId);
  });

  card.addEventListener("pointermove", (event) => {
    if (!state.pointer || state.pointer.id !== event.pointerId) return;

    const now = performance.now();
    const dx = event.clientX - state.pointer.startX;
    const dy = event.clientY - state.pointer.startY;
    const dt = Math.max(1, now - state.pointer.lastTime);
    state.pointer.velocityX = (event.clientX - state.pointer.lastX) / dt;
    state.pointer.velocityY = (event.clientY - state.pointer.lastY) / dt;
    state.pointer.lastX = event.clientX;
    state.pointer.lastY = event.clientY;
    state.pointer.lastTime = now;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      state.pointer.moved = true;
    }

    const rotate = dx / 18;
    card.style.transform = `translateX(${dx}px) translateY(${dy}px) rotate(${rotate}deg) scale(1.02)`;
  });

  card.addEventListener("pointerup", (event) => {
    if (!state.pointer || state.pointer.id !== event.pointerId) return;

    const dx = event.clientX - state.pointer.startX;
    const dy = event.clientY - state.pointer.startY;
    const flingUp = dy < -gestureConfig.flingDistance || state.pointer.velocityY < -gestureConfig.velocityThreshold;
    const swipeLeft = dx < -gestureConfig.swipeDistance || state.pointer.velocityX < -gestureConfig.velocityThreshold;
    const swipeRight = dx > gestureConfig.swipeDistance || state.pointer.velocityX > gestureConfig.velocityThreshold;
    if (state.pointer.moved) {
      state.suppressCardClickUntil = Date.now() + 250;
    }

    card.classList.remove("dragging");

    if (flingUp) {
      state.lastGesture = "Returned to wall";
      returnToWall();
      state.pointer = null;
      return;
    }

    if (swipeLeft) {
      turnCatalog(1);
    } else if (swipeRight) {
      turnCatalog(-1);
    } else {
      state.lastGesture = "Held";
      state.pointer = null;
      card.style.transform = "";
      if (Date.now() < state.suppressCardClickUntil) return;
      stopDemo();
      const now = Date.now();
      if (now - state.lastTapAt < 320) {
        state.lastTapAt = 0;
        if (state.focusClickTimer) {
          clearTimeout(state.focusClickTimer);
          state.focusClickTimer = null;
        }
        playUiSound("expand");
        openZoomView();
        return;
      }
      state.lastTapAt = now;
      if (state.focusClickTimer) {
        clearTimeout(state.focusClickTimer);
      }
      state.focusClickTimer = setTimeout(() => {
        playUiSound("focus");
        focusCurrentItem();
        state.focusClickTimer = null;
      }, 240);
    }
  });
}

function focusCurrentItem() {
  const topCard = stackLayer.querySelector(".stack-card.top");
  if (!topCard) return;

  topCard.classList.remove("focus-pop");
  void topCard.offsetWidth;
  topCard.classList.add("focus-pop");
  topCard.scrollIntoView({ block: "center", behavior: "smooth" });
}

function getActiveItem() {
  const catalog = getActiveCatalog();
  if (!catalog) return null;
  return catalog.items[state.activeIndex] || null;
}

async function enterFullscreenIfNeeded() {
  if (document.fullscreenElement) return true;
  try {
    await document.documentElement.requestFullscreen();
    return true;
  } catch (error) {
    console.warn("Fullscreen request was blocked", error);
    return false;
  }
}

async function openZoomView() {
  state.zoomOpen = true;
  state.zoomScale = 1;
  state.lastGesture = "Expanded item";
  renderStage();
  await enterFullscreenIfNeeded();
  renderStage();
}

function closeZoomView() {
  state.zoomOpen = false;
  state.zoomScale = 1;
  renderStage();
}

function stepZoomItem(direction) {
  const catalog = getActiveCatalog();
  if (!state.zoomOpen || !catalog) return;

  const nextIndex = state.activeIndex + direction;
  if (nextIndex < 0 || nextIndex >= catalog.items.length) return;

  state.activeIndex = nextIndex;
  state.zoomScale = 1;
  state.lastGesture = direction > 0 ? "Zoom next" : "Zoom previous";
  renderStage();
}

function goHomeFromZoom() {
  closeZoomView();
  if (!getActiveCatalog()) return;
  stopDemo();
  resetCubeMotion();
  state.activeIndex = 0;
  state.fanOpen = false;
  state.interactionMode = "carousel";
  state.lastGesture = "Home from zoom";
  renderModes();
  renderStage();
}

function adjustZoom(delta) {
  if (!state.zoomOpen) return;
  state.zoomScale = Math.min(3, Math.max(1, state.zoomScale + delta));
  const image = stackLayer.querySelector(".expanded-stage-image");
  if (image) {
    image.style.transform = `scale(${state.zoomScale})`;
  }
  renderZoomView();
}

function renderZoomView() {
  const activeItem = getActiveItem();
  const canZoom = Boolean(state.zoomOpen);
  const hasAsset = Boolean(activeItem?.assetUrl);

  zoomOverlay.hidden = true;
  document.body.classList.toggle("zoom-open", false);

  if (!canZoom) {
    zoomImage.removeAttribute("src");
    zoomImage.style.transform = "scale(1)";
    zoomPreviousButton.disabled = true;
    zoomNextButton.disabled = true;
    zoomOutButton.disabled = true;
    zoomInButton.disabled = true;
    return;
  }

  zoomTitle.textContent = activeItem.title;
  if (hasAsset) {
    zoomImage.src = activeItem.assetUrl;
    zoomImage.alt = activeItem.title;
  } else {
    zoomImage.removeAttribute("src");
  }
  zoomImage.style.transform = `scale(${state.zoomScale})`;
  const stageImage = stackLayer.querySelector(".expanded-stage-image");
  if (stageImage) {
    stageImage.style.transform = `scale(${state.zoomScale})`;
  }
  zoomPreviousButton.disabled = state.activeIndex <= 0;
  zoomNextButton.disabled = state.activeIndex >= getActiveCatalog().items.length - 1;
  zoomOutButton.disabled = !hasAsset || state.zoomScale <= 1;
  zoomInButton.disabled = !hasAsset || state.zoomScale >= 3;
}

function turnCatalog(direction) {
  const catalog = getActiveCatalog();
  if (!catalog) return;

  if (state.interactionMode === "cube") {
    state.activeIndex = (state.activeIndex + direction + catalog.items.length) % catalog.items.length;
    state.lastGesture = direction > 0 ? "Cube next face" : "Cube previous face";
    renderStage();
    return;
  }

  state.pendingBinderTurn = catalog.mode === "binder"
    ? direction > 0 ? "turn-forward" : "turn-back"
    : null;

  state.lastGesture = direction > 0 ? "Swipe next" : "Swipe previous";

  if (state.pendingBinderTurn) {
    renderStage();
    setTimeout(() => {
      state.activeIndex = (state.activeIndex + direction + catalog.items.length) % catalog.items.length;
      state.pendingBinderTurn = null;
      renderStage();
    }, 220);
    state.pointer = null;
    return;
  }

  state.activeIndex = (state.activeIndex + direction + catalog.items.length) % catalog.items.length;
  state.pointer = null;
  renderStage();
}

function activateCatalog(catalogId, gestureLabel) {
  state.activeCatalogId = catalogId;
  state.activeIndex = 0;
  state.fanOpen = false;
  resetCubeMotion();
  state.interactionMode = "cube";
  state.lastGesture = gestureLabel;
  renderDock();
  renderModes();
  renderStage();
}

function goHome() {
  stopDemo();
  state.lastGesture = "Home refresh";
  window.location.reload();
}

function syncViewToggleButton() {
  if (!viewToggleButton) return;
  viewToggleButton.textContent = isForcedMobileView ? "Desktop" : "Mobile";
  viewToggleButton.setAttribute(
    "aria-label",
    isForcedMobileView ? "Switch to desktop PulseDeck" : "Switch to mobile PulseDeck"
  );
}

function startDemo() {
  if (!getActiveCatalog()) {
    activateCatalog("media-gallery", "Demo loaded");
  }

  stopDemo();
  state.demoRunning = true;
  state.lastGesture = "Auto demo";
  renderStage();

  state.demoTimer = setInterval(() => {
    const active = getActiveCatalog();
    if (!active) return;

    if (state.interactionMode === "cube") {
      turnCatalog(1);
      return;
    }

    if (active.mode === "binder") {
      turnCatalog(1);
      return;
    }

    turnCatalog(1);
  }, 1800);
}

function stopDemo() {
  if (state.demoTimer) {
    clearInterval(state.demoTimer);
    state.demoTimer = null;
  }
  state.demoRunning = false;
}
