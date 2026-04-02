#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const host = process.env.MOTU_LIB_HOST || "127.0.0.1";
const port = Number(process.env.MOTU_LIB_PORT || 3018);
const libraryRoot = process.env.MOTU_LIB_ROOT || "/home/ubuntu/motu_lib";
const allowedOrigin = process.env.MOTU_LIB_ALLOWED_ORIGIN || "https://labmotu-jss1.github.io";
const accentCycle = ["cyan", "lime", "amber", "rose"];
const diceFaceOrder = [1, 2, 3, 4, 5, 6];

const mimeTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".txt": "text/plain; charset=utf-8",
  ".log": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".pdf": "application/pdf",
  ".json": "application/json; charset=utf-8"
};

function titleCase(value) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function formatCatalogTitle(folderName) {
  const parts = folderName.split("__");
  if (parts.length === 2) {
    return titleCase(parts[1].replace(/_/g, " "));
  }
  return titleCase(folderName.replace(/_/g, " "));
}

function formatDateLabel(folderName) {
  const [maybeDate] = folderName.split("__");
  return /^\d{4}-\d{2}-\d{2}$/.test(maybeDate) ? maybeDate : "";
}

function formatItemTitle(fileName) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyCatalog(folderName) {
  const lowered = folderName.toLowerCase();

  if (lowered.includes("dice")) {
    return {
      mode: "fan",
      badge: "Dice Cube",
      preview: "media",
      description: "Rotate a synthetic six-face dice cube generated directly from the folder color."
    };
  }

  if (lowered.includes("event") || lowered.includes("log")) {
    return {
      mode: "binder",
      badge: "Logs",
      preview: "text",
      description: "Review plain-text logs and event traces live from the VM library."
    };
  }

  if (lowered.includes("sound") || lowered.includes("audio") || lowered.includes("record")) {
    return {
      mode: "carousel",
      badge: "Audio",
      preview: "audio",
      description: "Browse and play audio captures live from the VM library."
    };
  }

  if (lowered.includes("video") || lowered.includes("youcam")) {
    return {
      mode: "carousel",
      badge: "Video",
      preview: "video",
      description: "Browse and play video clips live from the VM library."
    };
  }

  if (lowered.includes("document") || lowered.includes("terminal")) {
    return {
      mode: "binder",
      badge: "Documents",
      preview: "binder",
      description: "Flip through document-style captures and reference material from the VM library."
    };
  }

  if (lowered.includes("device") || lowered.includes("control") || lowered.includes("setup")) {
    return {
      mode: "carousel",
      badge: "Device Screens",
      preview: "media",
      description: "Swipe through device workflows, setup captures, and control screens live from the VM."
    };
  }

  return {
    mode: "fan",
    badge: "Image Set",
    preview: "media",
    description: "Browse screenshot folders and photo sets live from the VM library."
  };
}

function getAssetType(ext) {
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"].includes(ext)) return "image";
  if ([".mp4", ".mov", ".m4v", ".webm"].includes(ext)) return "video";
  if ([".mp3", ".wav", ".m4a", ".aac", ".ogg"].includes(ext)) return "audio";
  if ([".txt", ".log", ".md"].includes(ext)) return "text";
  if (ext === ".pdf") return "pdf";
  return "file";
}

function isDiceCatalog(folderName) {
  return folderName.toLowerCase().includes("dice");
}

function getDiceColor(folderName) {
  const lowered = folderName.toLowerCase();
  if (lowered.includes("red")) return "red";
  if (lowered.includes("black")) return "black";
  if (lowered.includes("blue")) return "blue";
  return "white";
}

function buildVirtualDiceItems(folderName, folderPath) {
  const titlePrefix = formatCatalogTitle(folderName);
  const color = getDiceColor(folderName);
  return diceFaceOrder.map((value) => ({
    title: `${titlePrefix} ${value}`,
    description: `${titlePrefix} virtual face ${value} generated from ${folderPath}.`,
    meta: ["DICE", color.toUpperCase(), "Live VM"],
    preview: "media",
    assetType: "dice",
    extension: ".dice",
    diceValue: value,
    color,
    sourcePath: folderPath
  }));
}

function addCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

function safeJoin(root, relativePath) {
  const decoded = decodeURIComponent(relativePath);
  const resolved = path.resolve(root, `.${path.sep}${decoded}`);
  if (!resolved.startsWith(path.resolve(root) + path.sep) && resolved !== path.resolve(root)) {
    return null;
  }
  return resolved;
}

function listCatalogs() {
  const allowedExts = new Set([
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".pdf",
    ".mp4", ".mov", ".m4v", ".webm",
    ".mp3", ".wav", ".m4a", ".aac", ".ogg",
    ".txt", ".log", ".md"
  ]);
  const entries = fs.readdirSync(libraryRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  return entries.map((entry, index) => {
    const folderName = entry.name;
    const folderPath = path.join(libraryRoot, folderName);
    const kind = classifyCatalog(folderName);
    const files = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter((file) => file.isFile())
      .map((file) => ({
        name: file.name,
        fullPath: path.join(folderPath, file.name),
        ext: path.extname(file.name).toLowerCase()
      }))
      .filter((file) => allowedExts.has(file.ext))
      .sort((a, b) => a.name.localeCompare(b.name));

    const fileItems = files.map((file, fileIndex) => {
      const stats = fs.statSync(file.fullPath);
      const assetType = getAssetType(file.ext);
      return {
        title: formatItemTitle(file.name),
        description: `${formatCatalogTitle(folderName)} item ${fileIndex + 1} served live from ${folderPath}.`,
        meta: [
          file.ext.replace(".", "").toUpperCase(),
          `${Math.max(1, Math.round(stats.size / 1024))} KB`,
          "Live VM"
        ],
        preview: kind.preview,
        assetType,
        extension: file.ext,
        assetUrl: `https://40-160-254-60.sslip.io/motu-lib/assets/${encodeURIComponent(folderName)}/${encodeURIComponent(file.name)}`,
        sourcePath: file.fullPath
      };
    });
    const items = fileItems.length > 0 ? fileItems : (isDiceCatalog(folderName) ? buildVirtualDiceItems(folderName, folderPath) : []);

    const descriptionParts = [
      kind.description,
      `${items.length} items currently available on the VM.`
    ];
    const dateLabel = formatDateLabel(folderName);
    if (dateLabel) {
      descriptionParts.push(`Source date ${dateLabel}.`);
    }

    return {
      id: slugify(folderName),
      title: formatCatalogTitle(folderName),
      mode: kind.mode,
      badge: `${kind.badge} · ${items.length}`,
      description: descriptionParts.join(" "),
      accent: accentCycle[index % accentCycle.length],
      sourcePath: folderPath,
      items
    };
  }).filter((catalog) => catalog.items.length > 0);
}

function serveJson(res, payload) {
  addCorsHeaders(res);
  res.writeHead(200, {
    "Content-Type": mimeTypes[".json"],
    "Cache-Control": "no-store, max-age=0"
  });
  res.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || "application/octet-stream";
  const stats = fs.statSync(filePath);
  addCorsHeaders(res);
  res.writeHead(200, {
    "Content-Type": mimeType,
    "Content-Length": stats.size,
    "Cache-Control": "no-store, max-age=0"
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (req.method === "OPTIONS") {
      addCorsHeaders(res);
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Method Not Allowed");
      return;
    }

    if (requestUrl.pathname === "/catalogs.json") {
      const catalogs = listCatalogs();
      if (req.method === "HEAD") {
        addCorsHeaders(res);
        res.writeHead(200, {
          "Content-Type": mimeTypes[".json"],
          "Cache-Control": "no-store, max-age=0"
        });
        res.end();
        return;
      }
      serveJson(res, catalogs);
      return;
    }

    if (requestUrl.pathname.startsWith("/assets/")) {
      const relativePath = requestUrl.pathname.replace(/^\/assets\//, "");
      const filePath = safeJoin(libraryRoot, relativePath);
      if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not Found");
        return;
      }

      if (req.method === "HEAD") {
        const ext = path.extname(filePath).toLowerCase();
        addCorsHeaders(res);
        res.writeHead(200, {
          "Content-Type": mimeTypes[ext] || "application/octet-stream",
          "Cache-Control": "no-store, max-age=0"
        });
        res.end();
        return;
      }

      serveFile(res, filePath);
      return;
    }

    addCorsHeaders(res);
    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "Not Found" }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(port, host, () => {
  process.stdout.write(`motu-lib server listening on http://${host}:${port}\n`);
});
