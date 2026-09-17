/* ---------------------------------------------------------------------
   Shared page-transition script — include on every page via
   <script src="transitions.js" defer></script>.

   Static multi-page sites can't animate between pages the way a
   single-page app can, since each click is a full page load. This
   fakes a directional slide instead: intercept clicks on internal
   nav links, slide the current page out, then navigate. Direction is
   based on each page's position in PAGE_ORDER — moving right through
   the tabs slides left/enters-from-right, moving left does the
   reverse — so it reads as one continuous strip rather than a
   generic fade. The outgoing direction is remembered in
   sessionStorage so the freshly-loaded page knows which way to
   enter; the fade-out counterpart on the old page uses a CSS class
   added here, while the enter animation is pure CSS (see styles.css)
   except for picking left-vs-right, which needs this JS.
--------------------------------------------------------------------- */
(function () {
  var PAGE_ORDER = ["index.html", "safety.html", "ultimate.html"];
  var EXIT_MS = 200;
  var DIR_KEY = "bl-transition-dir";

  function fileName(pathname) {
    var last = pathname.split("/").pop();
    return last === "" ? "index.html" : last;
  }

  function fileOf(href) {
    try {
      var url = new URL(href, window.location.href);
      return fileName(url.pathname);
    } catch (err) {
      return null;
    }
  }

  // Apply the entry animation based on the direction the previous
  // page stored for us. This script is deferred, so document.body
  // already exists (the document has finished parsing) by the time
  // this runs, and runs before DOMContentLoaded / first paint.
  var storedDir = null;
  try {
    storedDir = sessionStorage.getItem(DIR_KEY);
    sessionStorage.removeItem(DIR_KEY);
  } catch (err) {}
  if (storedDir === "back") {
    document.body.classList.add("enter-left");
  }

  function isPlainLeftClick(e) {
    return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  }

  function isInternalLink(a) {
    if (!a || !a.getAttribute) return false;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#") return false;
    if (a.target && a.target !== "" && a.target !== "_self") return false;
    if (a.hasAttribute("download")) return false;
    try {
      var url = new URL(href, window.location.href);
      return url.origin === window.location.origin;
    } catch (err) {
      return false;
    }
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || !isPlainLeftClick(e)) return;
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || !isInternalLink(a)) return;

    var href = a.getAttribute("href");
    if (href === window.location.pathname || href === window.location.href) return;

    var curIdx = PAGE_ORDER.indexOf(fileName(window.location.pathname));
    var tgtIdx = PAGE_ORDER.indexOf(fileOf(href));
    var direction = curIdx !== -1 && tgtIdx !== -1 && tgtIdx < curIdx ? "back" : "forward";

    try {
      sessionStorage.setItem(DIR_KEY, direction);
    } catch (err) {}

    e.preventDefault();
    document.body.classList.add(direction === "back" ? "exit-right" : "exit-left");
    setTimeout(function () {
      window.location.href = href;
    }, EXIT_MS);
  });

  // If the user navigates back into a cached page (bfcache), make sure
  // it isn't left stuck mid-exit from before they left.
  window.addEventListener("pageshow", function () {
    document.body.classList.remove("exit-left", "exit-right");
  });
})();
