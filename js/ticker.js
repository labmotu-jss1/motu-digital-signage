(() => {
  const ticker = document.getElementById("tickerText");
  if (!ticker) return;

  const SPEED = 1; // pixels per frame (adjust if needed)
  let pos = window.innerWidth;

  fetch("/motu-digital-signage/TextTicker.txt?ts=" + Date.now())
    .then(r => r.text())
    .then(text => {
      const clean = text
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, "")
        .trim();

      if (!clean) return;

      ticker.textContent = clean;
      ticker.style.position = "relative";
      ticker.style.left = pos + "px";

      function tick() {
        pos -= SPEED;

        if (pos < -ticker.offsetWidth) {
          pos = window.innerWidth;
        }

        ticker.style.left = pos + "px";
        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    })
    .catch(() => {
      ticker.textContent = "TICKER ERROR";
    });
})();
