(() => {
  const box = document.getElementById("newsTrack");
  if (!box) return;

  // PROOF THIS FILE IS RUNNING (you will see this instantly)
  box.textContent = "NEWS JS RUNNING...";

  const WORKER_BASE = "https://tight-frog-b4c7.lab-motu.workers.dev";
  const url = `${WORKER_BASE}/news?t=${Date.now()}`;

  fetch(url, { cache: "no-store" })
    .then(r => {
      if (!r.ok) throw new Error(`News HTTP ${r.status}`);
      return r.text();
    })
    .then(xmlText => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "application/xml");

      // If parse failed, browsers often create a <parsererror> node
      const parseError = xml.querySelector("parsererror");
      if (parseError) {
        box.textContent = "NEWS PARSE ERROR";
        console.warn("NEWS parse error", parseError.textContent);
        return;
      }

      const items = Array.from(xml.querySelectorAll("item"));
      if (!items.length) {
        box.textContent = "No news items found";
        return;
      }

      box.innerHTML = "";

      items.slice(0, 8).forEach(item => {
        const title = (item.querySelector("title")?.textContent || "").trim();
        if (!title) return;

        const row = document.createElement("div");
        row.style.marginBottom = "10px";
        row.textContent = "• " + title;
        box.appendChild(row);
      });
    })
    .catch(err => {
      console.warn("News error:", err);
      box.textContent = "News unavailable";
    });
})();
