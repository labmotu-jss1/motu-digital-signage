#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const dataDir = path.join(repoRoot, "nui", "data");
const assetRoot = path.join(repoRoot, "nui", "library-assets");
const outputFile = path.join(dataDir, "catalogs.json");

const sshHost = process.env.NUI_SOURCE_HOST || "cloud-vm";
const sourceRoot = process.env.NUI_SOURCE_ROOT || "/home/ubuntu/motu_lib";
const accentCycle = ["cyan", "lime", "amber", "rose"];

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    ...options
  }).trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function titleCase(value) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
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
      description: "Swipe through device workflows, setup captures, and control screens mirrored from the VM."
    };
  }

  return {
    mode: "fan",
    badge: "Image Set",
    preview: "media",
    description: "Browse screenshot folders and photo sets pulled from the VM library."
  };
}

function formatCatalogTitle(folderName) {
  const parts = folderName.split("__");
  if (parts.length === 2) {
    return `${titleCase(parts[1].replace(/_/g, " "))}`;
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

function fetchRemoteIndex() {
  const remoteScript = `
import json
import os

root = ${JSON.stringify(sourceRoot)}
allowed = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".pdf"}
catalogs = []

for name in sorted(os.listdir(root)):
    folder = os.path.join(root, name)
    if not os.path.isdir(folder):
        continue
    files = []
    for entry in sorted(os.listdir(folder)):
        full = os.path.join(folder, entry)
        if not os.path.isfile(full):
            continue
        ext = os.path.splitext(entry)[1].lower()
        if ext not in allowed:
            continue
        files.append({
            "name": entry,
            "path": full,
            "ext": ext,
            "size": os.path.getsize(full)
        })
    catalogs.append({
        "folderName": name,
        "folderPath": folder,
        "files": files
    })

print(json.dumps(catalogs))
`;

  return JSON.parse(run("ssh", [sshHost, `python3 - <<'PY'\n${remoteScript}\nPY`]));
}

function syncLibraryTree() {
  fs.rmSync(assetRoot, { recursive: true, force: true });
  fs.mkdirSync(assetRoot, { recursive: true });
  execFileSync("scp", ["-rq", `${sshHost}:${sourceRoot}/.`, `${assetRoot}/`], { stdio: "inherit" });
}

function buildCatalogs(remoteCatalogs) {
  fs.mkdirSync(dataDir, { recursive: true });

  return remoteCatalogs.map((catalog, index) => {
    const kind = classifyCatalog(catalog.folderName);
    const folderSlug = slugify(catalog.folderName);
    const items = catalog.files.map((file, fileIndex) => {
      const assetUrl = `./library-assets/${encodeURIComponent(catalog.folderName)}/${encodeURIComponent(file.name)}`;
      return {
        title: formatItemTitle(file.name),
        description: `${formatCatalogTitle(catalog.folderName)} item ${fileIndex + 1} mirrored from ${catalog.folderPath}.`,
        meta: [
          file.ext.replace(".", "").toUpperCase(),
          `${Math.max(1, Math.round(file.size / 1024))} KB`,
          "VM sync"
        ],
        preview: kind.preview,
        assetUrl,
        sourcePath: file.path
      };
    });

    const dateLabel = formatDateLabel(catalog.folderName);
    const descriptionParts = [kind.description, `${catalog.files.length} files mirrored from the VM library.`];
    if (dateLabel) {
      descriptionParts.push(`Source date ${dateLabel}.`);
    }

    return {
      id: folderSlug,
      title: formatCatalogTitle(catalog.folderName),
      mode: kind.mode,
      badge: `${kind.badge} · ${catalog.files.length}`,
      description: descriptionParts.join(" "),
      accent: accentCycle[index % accentCycle.length],
      sourcePath: catalog.folderPath,
      items
    };
  }).filter((catalog) => catalog.items.length > 0);
}

function main() {
  const remoteCatalogs = fetchRemoteIndex();
  syncLibraryTree();
  const catalogs = buildCatalogs(remoteCatalogs);
  fs.writeFileSync(outputFile, `${JSON.stringify(catalogs, null, 2)}\n`);
  process.stdout.write(`Synced ${catalogs.length} catalogs to ${path.relative(repoRoot, outputFile)}\n`);
}

main();
