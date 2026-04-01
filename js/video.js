(() => {
  const video = document.getElementById("panelAVideo");
  if (!video) return;

  function tunePlayback() {
    video.defaultPlaybackRate = 1.1;
    video.playbackRate = 1.1;
    video.muted = true;

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  video.addEventListener("loadeddata", tunePlayback);
  video.addEventListener("canplay", tunePlayback);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      tunePlayback();
    }
  });

  tunePlayback();
})();
