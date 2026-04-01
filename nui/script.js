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
  fanOpen: true,
  interactionMode: "fan",
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
  zoomScale: 1
};

setLoadingState();
void init();

fanButton.addEventListener("click", () => {
  if (!getActiveCatalog()) return;
  playUiSound("select");
  if (state.interactionMode === "fan") {
    state.interactionMode = "carousel";
    state.fanOpen = false;
  } else {
    state.interactionMode = "fan";
    state.fanOpen = true;
  }
  renderModes();
  renderStage();
});

resetButton.addEventListener("click", () => {
  if (!getActiveCatalog()) return;
  playUiSound("return");
  resetCubeMotion();
  state.activeIndex = 0;
  state.fanOpen = true;
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
    await document.documentElement.requestFullscreen();
    document.body.classList.add("fullscreen-on");
    fullscreenButton.textContent = "Exit";
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
  expandItemButton.disabled = true;
}

function renderDock() {
  dock.innerHTML = catalogs.map((catalog) => `
    <article class="dock-card ${state.activeCatalogId === catalog.id ? "active" : ""}" data-catalog-id="${catalog.id}">
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
  const modes = [
    { id: "fan", label: "Fan" },
    { id: "carousel", label: "Spin" },
    { id: "cube", label: "Cube" }
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
      playUiSound("select");
      state.interactionMode = pill.dataset.mode;
      state.fanOpen = pill.dataset.mode !== "carousel";
      state.lastGesture = `Mode: ${pill.dataset.mode}`;
      renderModes();
      renderStage();
    });
  });
}

function canUseMode(catalog, mode) {
  return Boolean(catalog && mode);
}

function renderEmpty() {
  stageTitle.textContent = "Select a catalog";
  stackLayer.innerHTML = "";
  expandItemButton.disabled = true;
  previousButton.disabled = true;
  nextButton.disabled = true;
  fanButton.disabled = true;
  demoButton.classList.remove("active-demo");
  demoButton.textContent = "Demo";
  fanButton.textContent = "Fan";
  expandItemButton.textContent = "Expand";
  closeZoomView();
}

function renderStage() {
  const catalog = getActiveCatalog();
  if (!catalog) {
    renderEmpty();
    return;
  }

  stageTitle.textContent = catalog.title;
  demoButton.classList.toggle("active-demo", state.demoRunning);
  demoButton.textContent = state.demoRunning ? "Stop" : "Demo";
  fanButton.disabled = false;
  previousButton.disabled = state.zoomOpen ? state.activeIndex <= 0 : false;
  nextButton.disabled = state.zoomOpen ? state.activeIndex >= catalog.items.length - 1 : false;
  fanButton.textContent = state.interactionMode === "fan" ? "Spin" : "Fan";
  expandItemButton.textContent = state.zoomOpen ? "Close" : "Expand";

  if (state.interactionMode === "cube") {
    renderCubeStage(catalog);
    expandItemButton.disabled = true;
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

function renderCubeStage(catalog) {
  const faces = Array.from({ length: 6 }, (_, faceIndex) => {
    const itemIndex = (state.activeIndex + faceIndex) % catalog.items.length;
    const item = catalog.items[itemIndex];
    return {
      ...item,
      index: itemIndex
    };
  });
  const faceClasses = ["front", "right", "back", "left", "top", "bottom"];

  stackLayer.innerHTML = `
    <div class="cube-scene auto-spin" id="cubeScene">
      <div
        class="catalog-cube"
        id="catalogCube"
        style="transform: rotateX(${state.cubeRotationX}deg) rotateY(${state.cubeRotationY}deg);"
      >
        ${faces.map((item, faceIndex) => `
          <article
            class="cube-face ${faceClasses[faceIndex]} ${faceIndex === 0 ? "active" : ""}"
            data-index="${item.index}"
            style="${getCubeFaceStyle(item)}"
          >
            <div class="cube-face-glow"></div>
            ${item.assetUrl ? "" : renderCubeFacePreview(catalog, item)}
          </article>
        `).join("")}
      </div>
    </div>
  `;

  const scene = document.getElementById("cubeScene");
  const cube = document.getElementById("catalogCube");
  attachCubeInteraction(scene, cube);
}

function renderExpandedStage(catalog) {
  const activeItem = getActiveItem();
  stageTitle.textContent = activeItem?.title || catalog.title;

  if (!activeItem) {
    stackLayer.innerHTML = "";
    return;
  }

  if (activeItem.assetUrl) {
    stackLayer.innerHTML = `
      <article class="expanded-stage-card">
        <div class="expanded-stage-media">
          <img src="${activeItem.assetUrl}" alt="${activeItem.title}" class="expanded-stage-image" />
        </div>
      </article>
    `;
    return;
  }

  stackLayer.innerHTML = `
    <article class="expanded-stage-card fallback">
      ${renderPreview(catalog, activeItem)}
    </article>
  `;
}

function openCubeFace(index) {
  if (Date.now() < state.suppressCardClickUntil) return;
  stopDemo();
  playUiSound("select");
  state.activeIndex = Number(index) || 0;
  state.interactionMode = "fan";
  state.fanOpen = true;
  state.lastGesture = "Cube face opened";
  renderModes();
  renderStage();
}

function renderCubeFacePreview(catalog, item) {
  return renderPreview(catalog, item);
}

function getCubeFaceStyle(item) {
  if (!item.assetUrl) return "";
  return `background-image: linear-gradient(145deg, rgba(97, 231, 255, 0.1), rgba(4, 12, 22, 0.08)), url('${item.assetUrl}'); background-size: cover; background-position: center;`;
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
    const xMap = [-340, -205, -58, 122, 292, 428];
    const yMap = [112, 46, 0, 24, 86, 156];
    const rotateMap = [-8, -4, 0, 3, 6, 9];
    const yawMap = [48, 30, 0, -24, -42, -54];
    const scaleMap = [0.62, 0.76, 1.08, 0.92, 0.72, 0.52];
    return {
      transform: `translateX(${xMap[slot]}px) translateY(${yMap[slot]}px) rotateY(${yawMap[slot]}deg) rotate(${rotateMap[slot]}deg) scale(${scaleMap[slot]})`,
      opacity: [0.24, 0.52, 1, 0.82, 0.5, 0.22][slot],
      zIndex: 100 - slot
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

function attachCubeInteraction(scene, cube) {
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
      openCubeFace(releasedFaceIndex);
    } else {
      openCubeFace(state.activeIndex);
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
  state.fanOpen = true;
  state.interactionMode = "cube";
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

function openZoomView() {
  state.zoomOpen = true;
  state.zoomScale = 1;
  state.lastGesture = "Expanded item";
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
  state.fanOpen = true;
  state.interactionMode = "cube";
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
  state.fanOpen = true;
  resetCubeMotion();
  state.interactionMode = "cube";
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

    if (state.interactionMode === "cube") {
      turnCatalog(1);
      return;
    }

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
