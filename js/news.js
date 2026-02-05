(() => {
  const track = document.getElementById("newsTrack");
  if (!track) return;

  const NEWS_ENDPOINT =
    "https://tight-frog-b4c7.lab-motu.workers.dev/news";

  fetch(NEWS_ENDPOINT + "?t=" + Date.now(), { cache: "no-store" })
    .then(r => {
      if (!r.ok) throw new Error("News fetch failed");
      return r.text();
    })
    .then(xmlText => {
      const xml = new DOMParser().parseFromString(xmlText, "text/xml");
      const items = [...xml.querySelectorAll("item > title")].slice(0, 10);

      track.innerHTML = items
        .map(i => `<div class="newsItem">• ${i.textContent}</div>`)
        .join("");
    })
    .catch(() => {
      track.textContent = "News unavailable";
    });
})();
