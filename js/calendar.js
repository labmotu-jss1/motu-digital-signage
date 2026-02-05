// ================================
// MOTU DIGITAL SIGNAGE – CALENDAR
// GitHub Pages + Cloudflare Worker
// ================================

const CALENDAR_ENDPOINT =
  "https://tight-frog-b4c7.lab-motu.workers.dev/calendar";

const DAYS_AHEAD = 7;
const REFRESH_INTERVAL_MS = 120000;
const SCROLL_INTERVAL_MS = 40;
const SCROLL_PAUSE_MS = 2000;

let scrollTimer = null;

async function loadCalendar() {
  const track = document.getElementById("calendarTrack");
  if (!track) return;

  track.textContent = "Loading calendar…";

  try {
    const res = await fetch(CALENDAR_ENDPOINT + "?t=" + Date.now(), {
      cache: "no-store"
    });
    if (!res.ok) throw new Error();

    const text = await res.text();
    const events = parseICS(text);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = events
      .filter(e => e.start >= today)
      .sort((a, b) => a.start - b.start)
      .slice(0, 50);

    if (!upcoming.length) {
      track.textContent = "No upcoming events";
      return;
    }

    track.innerHTML = upcoming.map(e => {
      const dateStr = e.start.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric"
      });

      const timeStr = e.allDay
        ? "All day"
        : `${formatTime(e.start)} – ${formatTime(e.end)}`;

      return `
        <div class="calRow">
          <div class="calDate">
            ${dateStr}
            <span style="float:right; opacity:0.85;">${timeStr}</span>
          </div>
          <div class="calTitle">${escapeHtml(e.title)}</div>
        </div>
      `;
    }).join("");

    startAutoScroll();
  } catch {
    track.textContent = "Calendar unavailable";
  }
}

function startAutoScroll() {
  if (scrollTimer) clearInterval(scrollTimer);

  const box = document.getElementById("calendarBox");
  if (!box) return;

  box.scrollTop = 0;
  let direction = 1;
  let pauseUntil = 0;

  scrollTimer = setInterval(() => {
    const now = Date.now();
    if (now < pauseUntil) return;

    box.scrollTop += direction;

    const atBottom =
      box.scrollTop + box.clientHeight >= box.scrollHeight - 2;
    const atTop = box.scrollTop <= 0;

    if (atBottom || atTop) {
      pauseUntil = now + SCROLL_PAUSE_MS;
      direction *= -1;
    }
  }, SCROLL_INTERVAL_MS);
}

function parseICS(text) {
  const lines = text.split(/\r?\n/);
  const events = [];
  let cur = null;

  for (const l of lines) {
    if (l === "BEGIN:VEVENT") cur = {};
    if (!cur) continue;

    if (l.startsWith("SUMMARY:")) cur.title = l.slice(8);

    if (l.startsWith("DTSTART")) {
      const raw = l.split(":")[1];
      cur.start = parseICSDate(raw);
      cur.allDay = raw.length === 8;
    }

    if (l.startsWith("DTEND")) {
      const raw = l.split(":")[1];
      cur.end = parseICSDate(raw);
    }

    if (l === "END:VEVENT") {
      events.push({
        title: cur.title || "(No title)",
        start: cur.start,
        end: cur.end || cur.start,
        allDay: cur.allDay
      });
      cur = null;
    }
  }
  return events;
}

function parseICSDate(raw) {
  if (/^\d{8}$/.test(raw)) {
    return new Date(raw.slice(0, 4), raw.slice(4, 6) - 1, raw.slice(6, 8));
  }
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  return m
    ? new Date(m[1], m[2] - 1, m[3], m[4], m[5])
    : null;
}

function formatTime(d) {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, c =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c])
  );
}

loadCalendar();
setInterval(loadCalendar, REFRESH_INTERVAL_MS);
