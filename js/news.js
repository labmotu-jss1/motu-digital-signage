(() => {
  const box = document.getElementById("newsTrack");
  if (!box) return;

  box.textContent = "Loading headlines...";

  const WORKER = "https://tight-frog-b4c7.lab-motu.workers.dev/news";

  fetch(`${WORKER}?t=${Date.now()}`, { cache: "no-store" })
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    })
    .then(xmlText => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "application/xml");

      if (xml.querySelector("parsererror")) {
        box.textContent = "News feed error";
        return;
      }

      const items = Array.from(xml.querySelectorAll("item"));
      if (!items.length) {
        box.textContent = "No news available";
        return;
      }

      box.innerHTML = "";
      items.slice(0, 6).forEach(item => {
        const title = item.querySelector("title")?.textContent?.trim();
        if (!title) return;

        const div = document.createElement("div");
        div.textContent = "• " + title;
        div.style.marginBottom = "8px";
        box.appendChild(div);
      });
    })
    .catch(() => {
      box.textContent = "News unavailable";
    });
})();
