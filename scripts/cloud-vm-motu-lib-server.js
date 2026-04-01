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

const mimeTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
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
  const allowedExts = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".pdf"]);
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

    const items = files.map((file, fileIndex) => {
      const stats = fs.statSync(file.fullPath);
      return {
        title: formatItemTitle(file.name),
        description: `${formatCatalogTitle(folderName)} item ${fileIndex + 1} served live from ${folderPath}.`,
        meta: [
          file.ext.replace(".", "").toUpperCase(),
          `${Math.max(1, Math.round(stats.size / 1024))} KB`,
          "Live VM"
        ],
        preview: kind.preview,
        assetUrl: `https://40-160-254-60.sslip.io/motu-lib/assets/${encodeURIComponent(folderName)}/${encodeURIComponent(file.name)}`,
        sourcePath: file.fullPath
      };
    });

    const descriptionParts = [
      kind.description,
      `${files.length} files currently available on the VM.`
    ];
    const dateLabel = formatDateLabel(folderName);
    if (dateLabel) {
      descriptionParts.push(`Source date ${dateLabel}.`);
    }

    return {
      id: slugify(folderName),
      title: formatCatalogTitle(folderName),
      mode: kind.mode,
      badge: `${kind.badge} · ${files.length}`,
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
