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

const dock = document.getElementById("dock");
const stackLayer = document.getElementById("stackLayer");
const stageTitle = document.getElementById("stageTitle");
const gestureHint = document.getElementById("gestureHint");
const modePills = document.getElementById("modePills");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const demoButton = document.getElementById("demoButton");
const fanButton = document.getElementById("fanButton");
const resetButton = document.getElementById("resetButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const expandItemButton = document.getElementById("expandItemButton");
const openItemButton = document.getElementById("openItemButton");
const zoomOverlay = document.getElementById("zoomOverlay");
const zoomTitle = document.getElementById("zoomTitle");
const zoomImage = document.getElementById("zoomImage");
const zoomInButton = document.getElementById("zoomInButton");
const zoomOutButton = document.getElementById("zoomOutButton");
const zoomCloseButton = document.getElementById("zoomCloseButton");
const catalogCount = document.getElementById("catalogCount");

const gestureConfig = {
  swipeDistance: 110,
  flingDistance: 130,
  velocityThreshold: 0.55
};

const state = {
  activeCatalogId: null,
  activeIndex: 0,
  fanOpen: true,
  interactionMode: "fan",
  pointer: null,
  suppressCardClickUntil: 0,
  lastGesture: "Waiting",
  pendingBinderTurn: null,
  demoTimer: null,
  demoRunning: false,
  zoomOpen: false,
  zoomScale: 1
};

setLoadingState();
void init();

fanButton.addEventListener("click", () => {
  if (!getActiveCatalog()) return;
  state.fanOpen = !state.fanOpen;
  state.interactionMode = state.fanOpen ? "fan" : "carousel";
  renderModes();
  renderStage();
});

resetButton.addEventListener("click", () => {
  if (!getActiveCatalog()) return;
  state.activeCatalogId = null;
  state.activeIndex = 0;
  state.fanOpen = true;
  state.interactionMode = "fan";
  state.lastGesture = "Returned";
  renderDock();
  renderModes();
  renderEmpty();
});

expandItemButton.addEventListener("click", () => {
  if (!getActiveCatalog()) return;
  stopDemo();
  openZoomView();
});

openItemButton.addEventListener("click", () => {
  if (!getActiveCatalog()) return;
  stopDemo();
  openCurrentItem();
});

zoomInButton.addEventListener("click", () => adjustZoom(0.25));
zoomOutButton.addEventListener("click", () => adjustZoom(-0.25));
zoomCloseButton.addEventListener("click", closeZoomView);
zoomOverlay.addEventListener("click", (event) => {
  if (event.target === zoomOverlay || event.target.classList.contains("zoom-backdrop")) {
    closeZoomView();
  }
});

previousButton.addEventListener("click", () => {
  if (!getActiveCatalog()) return;
  stopDemo();
  turnCatalog(-1);
});

nextButton.addEventListener("click", () => {
  if (!getActiveCatalog()) return;
  stopDemo();
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
    await document.documentElement.requestFullscreen();
    document.body.classList.add("fullscreen-on");
    fullscreenButton.textContent = "Exit Fullscreen";
  } else {
    await document.exitFullscreen();
    document.body.classList.remove("fullscreen-on");
    fullscreenButton.textContent = "Fullscreen";
  }
});

document.addEventListener("fullscreenchange", () => {
  const inFullscreen = Boolean(document.fullscreenElement);
  document.body.classList.toggle("fullscreen-on", inFullscreen);
  fullscreenButton.textContent = inFullscreen ? "Exit Fullscreen" : "Fullscreen";
});

document.addEventListener("keydown", (event) => {
  if (!state.zoomOpen) return;
  if (event.key === "Escape") {
    closeZoomView();
  } else if (event.key === "+" || event.key === "=") {
    adjustZoom(0.25);
  } else if (event.key === "-") {
    adjustZoom(-0.25);
  }
});

function getActiveCatalog() {
  return catalogs.find((catalog) => catalog.id === state.activeCatalogId) || null;
}

async function init() {
  catalogs = await loadCatalogs();
  catalogCount.textContent = `${catalogs.length} Catalogs`;
  renderDock();
  renderModes();

  if (catalogs.length === 0) {
    renderEmpty();
    return;
  }

  activateCatalog(catalogs[0].id, catalogs === fallbackCatalogs ? "Sample loaded" : "Library synced");
}

async function loadCatalogs() {
  try {
    const response = await fetch(remoteCatalogsUrl, { cache: "no-store", mode: "cors" });
    if (!response.ok) {
      throw new Error(`Catalog request failed: ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload) || payload.length === 0) {
      return fallbackCatalogs;
    }

    return payload;
  } catch (error) {
    console.warn("Falling back to bundled sample catalogs.", error);
    return fallbackCatalogs;
  }
}

function setLoadingState() {
  catalogCount.textContent = "Loading";
  stageTitle.textContent = "Loading catalog";
  gestureHint.textContent = "Loading live library content from the Cloud VM...";
  expandItemButton.disabled = true;
  openItemButton.disabled = true;
}

function renderDock() {
  dock.innerHTML = catalogs.map((catalog) => `
    <article class="dock-card ${state.activeCatalogId === catalog.id ? "active" : ""}" data-catalog-id="${catalog.id}">
      <div class="dock-row">
        <span class="dock-count">${catalog.items.length} items</span>
        <span class="dock-mode">${catalog.badge}</span>
      </div>
      <h4>${catalog.title}</h4>
      <p>${catalog.description}</p>
    </article>
  `).join("");

  dock.querySelectorAll(".dock-card").forEach((card) => {
    card.addEventListener("click", () => {
      stopDemo();
      activateCatalog(card.dataset.catalogId, "Pulled from wall");
    });
  });
}

function renderModes() {
  const catalog = getActiveCatalog();
  const modes = [
    { id: "fan", label: "Fan" },
    { id: "carousel", label: "Carousel" },
    { id: "binder", label: "Binder" }
  ];

  modePills.innerHTML = modes.map((mode) => `
    <button
      type="button"
      class="mode-pill ${state.interactionMode === mode.id ? "active" : ""}"
      data-mode="${mode.id}"
      ${catalog && canUseMode(catalog, mode.id) ? "" : "disabled"}
    >
      ${mode.label}
    </button>
  `).join("");

  modePills.querySelectorAll(".mode-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      if (!catalog || !canUseMode(catalog, pill.dataset.mode)) return;
      stopDemo();
      state.interactionMode = pill.dataset.mode;
      state.fanOpen = pill.dataset.mode !== "carousel";
      state.lastGesture = `Mode: ${pill.dataset.mode}`;
      renderModes();
      renderStage();
    });
  });
}

function canUseMode(catalog, mode) {
  if (catalog.mode === "binder") {
    return mode === "binder" || mode === "fan";
  }
  return mode !== "binder";
}

function renderEmpty() {
  stageTitle.textContent = "Select a catalog";
  gestureHint.textContent = "Tap a catalog on the left to begin, or use the sample stack that loads by default.";
  stackLayer.innerHTML = "";
  expandItemButton.disabled = true;
  openItemButton.disabled = true;
  demoButton.classList.remove("active-demo");
  demoButton.textContent = "Auto Demo";
  closeZoomView();
}

function renderStage() {
  const catalog = getActiveCatalog();
  if (!catalog) {
    renderEmpty();
    return;
  }

  stageTitle.textContent = catalog.title;
  gestureHint.textContent = "Swipe the top card, single-click to focus it, double-click or use Expand to enlarge it, or use Previous / Next.";
  demoButton.classList.toggle("active-demo", state.demoRunning);
  demoButton.textContent = state.demoRunning ? "Stop Demo" : "Auto Demo";

  const items = buildOrderedItems(catalog);
  stackLayer.innerHTML = items.map((item) => renderCard(catalog, item)).join("");

  const topCard = stackLayer.querySelector(".stack-card.top");
  if (topCard) {
    topCard.addEventListener("click", () => {
      if (Date.now() < state.suppressCardClickUntil) return;
      stopDemo();
      focusCurrentItem();
    });
    topCard.addEventListener("dblclick", () => {
      stopDemo();
      openZoomView();
    });
    attachGesture(topCard);
  }

  expandItemButton.disabled = false;
  openItemButton.disabled = false;
  renderZoomView();
}

function buildOrderedItems(catalog) {
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
      <h4>${item.title}</h4>
      <p>${item.description}</p>
      <div class="stack-meta">
        ${item.meta.map((entry) => `<span>${entry}</span>`).join("")}
      </div>
    </article>
  `;
}

function computeLayout(catalog, relative) {
  if (state.interactionMode === "carousel") {
    const x = (relative * 132) - 88;
    const y = Math.min(relative * 8, 24);
    const rotate = (relative * 5) - 8;
    const scale = Math.max(0.78, 1 - (relative * 0.08));
    return {
      transform: `translateX(${x}px) translateY(${y}px) rotate(${rotate}deg) scale(${scale})`,
      opacity: Math.max(0.26, 1 - (relative * 0.14)),
      zIndex: 100 - relative
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

  const x = (relative * 54) - 86;
  const y = relative * 14;
  const rotate = (relative * 9) - 15;
  const scale = Math.max(0.76, 1 - (relative * 0.07));
  return {
    transform: `translateX(${x}px) translateY(${y}px) rotate(${rotate}deg) scale(${scale})`,
    opacity: Math.max(0.22, 1 - (relative * 0.16)),
    zIndex: 100 - relative
  };
}

function renderPreview(catalog, item) {
  if (item.assetUrl) {
    return `
      <div class="preview-shell asset">
        <img src="${item.assetUrl}" alt="${item.title}" loading="lazy" />
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
      state.activeCatalogId = null;
      state.activeIndex = 0;
      state.fanOpen = true;
      state.interactionMode = "fan";
      renderDock();
      renderModes();
      renderEmpty();
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
      renderStage();
    }
  });
}

function focusCurrentItem() {
  const catalog = getActiveCatalog();
  if (!catalog) return;

  state.lastGesture = "Opened item";
  renderStage();

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

function openZoomView() {
  const activeItem = getActiveItem();
  if (!activeItem?.assetUrl) {
    focusCurrentItem();
    return;
  }

  state.zoomOpen = true;
  state.zoomScale = 1;
  state.lastGesture = "Expanded item";
  renderZoomView();
  renderStage();
}

function closeZoomView() {
  state.zoomOpen = false;
  state.zoomScale = 1;
  renderZoomView();
}

function adjustZoom(delta) {
  if (!state.zoomOpen) return;
  state.zoomScale = Math.min(3, Math.max(1, state.zoomScale + delta));
  renderZoomView();
}

function renderZoomView() {
  const activeItem = getActiveItem();
  const canZoom = Boolean(state.zoomOpen && activeItem?.assetUrl);

  zoomOverlay.hidden = !canZoom;
  document.body.classList.toggle("zoom-open", canZoom);

  if (!canZoom) {
    zoomImage.removeAttribute("src");
    zoomImage.style.transform = "scale(1)";
    return;
  }

  zoomTitle.textContent = activeItem.title;
  zoomImage.src = activeItem.assetUrl;
  zoomImage.alt = activeItem.title;
  zoomImage.style.transform = `scale(${state.zoomScale})`;
  zoomOutButton.disabled = state.zoomScale <= 1;
  zoomInButton.disabled = state.zoomScale >= 3;
}

function openCurrentItem() {
  const catalog = getActiveCatalog();
  if (!catalog) return;

  const activeItem = catalog.items[state.activeIndex];
  if (activeItem?.assetUrl) {
    state.lastGesture = "Opened asset";
    renderStage();
    window.open(activeItem.assetUrl, "_blank", "noopener");
    return;
  }

  focusCurrentItem();
}

function turnCatalog(direction) {
  const catalog = getActiveCatalog();
  if (!catalog) return;

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
  state.fanOpen = true;
  state.interactionMode = getActiveCatalog().mode === "binder" ? "binder" : "fan";
  state.lastGesture = gestureLabel;
  renderDock();
  renderModes();
  renderStage();
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

    if (active.mode === "binder") {
      turnCatalog(1);
      return;
    }

    if (state.interactionMode === "fan") {
      state.interactionMode = "carousel";
      state.fanOpen = false;
      state.lastGesture = "Demo switched mode";
      renderModes();
      renderStage();
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
