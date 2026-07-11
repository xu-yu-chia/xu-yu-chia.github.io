(function () {
  const intro = document.querySelector("[data-home-interactive]");
  const finePointer = window.matchMedia("(pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!intro || !finePointer.matches || reducedMotion.matches) return;

  let frame = 0;

  function reset() {
    intro.style.setProperty("--home-marker-x", "48px");
    intro.style.setProperty("--home-shift-x", "0px");
    intro.style.setProperty("--home-shift-y", "0px");
  }

  intro.addEventListener("pointermove", function (event) {
    if (frame) cancelAnimationFrame(frame);

    frame = requestAnimationFrame(function () {
      const rect = intro.getBoundingClientRect();
      const localX = Math.min(Math.max(event.clientX - rect.left, 28), rect.width - 28);
      const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
      const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

      intro.style.setProperty("--home-marker-x", localX + "px");
      intro.style.setProperty("--home-shift-x", normalizedX * 6 + "px");
      intro.style.setProperty("--home-shift-y", normalizedY * 4 + "px");
    });
  });

  intro.addEventListener("pointerleave", reset);
})();
