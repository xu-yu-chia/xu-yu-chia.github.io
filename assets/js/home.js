(function () {
  const menuButton = document.querySelector(".home-menu-button");
  const menuPanel = document.querySelector(".home-nav-panel");

  function setMenu(open) {
    if (!menuButton || !menuPanel) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuPanel.classList.toggle("is-open", open);
  }

  if (menuButton && menuPanel) {
    menuButton.addEventListener("click", function () {
      setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });

    menuPanel.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuButton.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) setMenu(false);
    });
  }

})();
