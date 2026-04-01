(() => {
  const clockEl = document.getElementById("clock");
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();

    const timeText = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    const dateText = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });

    clockEl.innerHTML = `
      <div class="clock-time">${timeText}</div>
      <div class="clock-date">${dateText}</div>
    `;
  }

  updateClock();
  setInterval(updateClock, 1000);
})();
