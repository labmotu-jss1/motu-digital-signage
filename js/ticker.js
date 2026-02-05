(() => {
  const el = document.getElementById("tickerText");
  if (!el) {
    console.error("Ticker element not found");
    return;
  }

  // VISUAL PROOF THE SCRIPT IS RUNNING
  el.textContent = "TICKER INITIALIZING...";
  el.style.color = "#00ffcc";

  fetch("/motu-digital-signage/TextTicker.txt?ts=" + Date.now())
    .then(r => {
      if (!r.ok) throw new Error("Ticker fetch failed");
      return r.text();
    })
    .then(text => {
      const clean = text
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, "")
        .trim();

      if (!clean) {
        el.textContent = "TICKER EMPTY";
        return;
      }

      el.textContent = clean;
      el.style.color = "#ffffff";

      // FORCE animation reset
      el.classList.remove("ticker-run");
      void el.offsetWidth; // hard reflow
      el.classList.add("ticker-run");
    })
    .catch(err => {
      console.error("Ticker error:", err);
      el.textContent = "TICKER ERROR";
      el.style.color = "red";
    });
})();
