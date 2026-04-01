(() => {
  const ticker = document.getElementById("tickerText");
  if (!ticker) return;

  const SPEED = 1;
  let position = window.innerWidth;
  let rafId = null;

  fetch("/motu-digital-signage/TextTicker.txt?ts=" + Date.now())
    .then(response => response.text())
    .then(text => {
      const clean = text
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (!clean) {
        ticker.textContent = "No announcements available";
        return;
      }

      ticker.textContent = `${clean}   •   ${clean}`;
      ticker.style.left = position + "px";
      start();
    })
    .catch(() => {
      ticker.textContent = "Ticker feed unavailable";
    });

  window.addEventListener("resize", () => {
    position = window.innerWidth;
    ticker.style.left = position + "px";
    if (!rafId) start();
  });

  function start() {
    if (rafId) cancelAnimationFrame(rafId);

    function tick() {
      position -= SPEED;

      if (position < -ticker.offsetWidth) {
        position = window.innerWidth;
      }

      ticker.style.left = position + "px";
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
  }
})();
