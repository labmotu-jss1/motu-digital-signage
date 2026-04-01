// ================================
// MOTU DIGITAL SIGNAGE – CALENDAR
// ================================

(function () {
  if (window.__MOTU_CALENDAR_LOADED__) return;
  window.__MOTU_CALENDAR_LOADED__ = true;

  const CALENDAR_ENDPOINT =
    "https://tight-frog-b4c7.lab-motu.workers.dev/calendar";

  const REFRESH_INTERVAL_MS = 120000;
  const SCROLL_INTERVAL_MS = 34;
  const SCROLL_PAUSE_MS = 2200;

  let scrollTimer = null;

  async function loadCalendar() {
    const track = document.getElementById("calendarTrack");
    const count = document.getElementById("eventsCount");
    if (!track) return;

    track.textContent = "Loading calendar...";

    try {
      const res = await fetch(CALENDAR_ENDPOINT + "?t=" + Date.now(), {
        cache: "no-store"
      });
      if (!res.ok) throw new Error("Calendar request failed");

      const text = await res.text();
      const events = parseICS(text)
        .filter(event => event.start && event.start.getTime() >= Date.now() - 86400000)
        .sort((a, b) => a.start - b.start)
        .slice(0, 10);

      if (count) {
        count.textContent = `${events.length} Loaded`;
      }

      syncHero(events[0]);

      if (!events.length) {
        track.textContent = "No upcoming events";
        return;
      }

      track.innerHTML = events.map((event, index) => `
        <article class="calRow">
          <div class="calMeta">
            <span>${index === 0 ? "Next Up" : "Upcoming"}</span>
            <span>${event.dateLabel}</span>
          </div>
          <div class="calTitle">${escapeHtml(event.title)}</div>
          <div class="calMeta">
            <span>${event.timeLabel}</span>
            <span>${event.dayLabel}</span>
          </div>
        </article>
      `).join("");

      startAutoScroll();
    } catch {
      if (count) {
        count.textContent = "Feed Offline";
      }
      track.textContent = "Calendar unavailable";
      syncHero(null);
    }
  }

  function syncHero(event) {
    const titleEl = document.getElementById("nextEventTitle");
    const metaEl = document.getElementById("nextEventMeta");
    if (!titleEl || !metaEl) return;

    if (!event) {
      titleEl.textContent = "Calendar feed unavailable";
      metaEl.textContent = "Check the event source or network connection";
      return;
    }

    titleEl.textContent = event.title;
    metaEl.textContent = `${event.dayLabel} • ${event.dateLabel} • ${event.timeLabel}`;
  }

  function startAutoScroll() {
    if (scrollTimer) clearInterval(scrollTimer);

    const box = document.getElementById("calendarTrack");
    if (!box) return;

    box.scrollTop = 0;
    let direction = 1;
    let pauseUntil = 0;

    scrollTimer = setInterval(() => {
      if (box.scrollHeight <= box.clientHeight) return;
      if (Date.now() < pauseUntil) return;

      box.scrollTop += direction;

      if (
        box.scrollTop + box.clientHeight >= box.scrollHeight - 2 ||
        box.scrollTop <= 0
      ) {
        pauseUntil = Date.now() + SCROLL_PAUSE_MS;
        direction *= -1;
      }
    }, SCROLL_INTERVAL_MS);
  }

  function parseICS(text) {
    const lines = text.split(/\r?\n/);
    const events = [];
    let current = {};

    for (const line of lines) {
      if (line === "BEGIN:VEVENT") current = {};

      if (line.startsWith("SUMMARY:")) {
        current.title = line.slice(8).trim();
      }

      if (line.startsWith("DTSTART")) {
        const raw = line.split(":")[1];
        current.start = parseICSDate(raw);
      }

      if (line === "END:VEVENT") {
        const start = current.start;
        events.push({
          title: current.title || "(No title)",
          start,
          dateLabel: start ? start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
          }) : "TBD",
          dayLabel: start ? start.toLocaleDateString("en-US", {
            weekday: "short"
          }) : "TBD",
          timeLabel: start ? start.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
          }) : "All day"
        });
      }
    }

    return events;
  }

  function parseICSDate(raw) {
    if (!raw) return null;

    if (/^\d{8}$/.test(raw)) {
      const year = Number(raw.slice(0, 4));
      const month = Number(raw.slice(4, 6)) - 1;
      const day = Number(raw.slice(6, 8));
      return new Date(year, month, day, 12, 0, 0);
    }

    if (/^\d{8}T\d{6}Z$/.test(raw)) {
      const iso = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}T${raw.slice(9, 11)}:${raw.slice(11, 13)}:${raw.slice(13, 15)}Z`;
      return new Date(iso);
    }

    if (/^\d{8}T\d{6}$/.test(raw)) {
      const year = Number(raw.slice(0, 4));
      const month = Number(raw.slice(4, 6)) - 1;
      const day = Number(raw.slice(6, 8));
      const hour = Number(raw.slice(9, 11));
      const minute = Number(raw.slice(11, 13));
      const second = Number(raw.slice(13, 15));
      return new Date(year, month, day, hour, minute, second);
    }

    return null;
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  loadCalendar();
  setInterval(loadCalendar, REFRESH_INTERVAL_MS);
})();
