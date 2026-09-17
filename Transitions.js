/* ---------------------------------------------------------------------
   Shared page-transition script — include on every page via
   <script src="transitions.js" defer></script>.

   Static multi-page sites can't animate between pages the way a
   single-page app can, since each click is a full page load. This
   fakes a crossfade instead: intercept clicks on internal links, fade
   the current page out, then navigate once the fade finishes. The
   fade-IN on the new page is handled purely by CSS (see the
   page-fade-in keyframes in styles.css), so there's nothing to
   coordinate between the two page loads.
--------------------------------------------------------------------- */
(function () {
  var FADE_OUT_MS = 200;

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
    // Same-page anchor / same-file link: don't fade for a no-op navigation.
    if (href === window.location.pathname || href === window.location.href) return;

    e.preventDefault();
    document.body.classList.add("page-fade-out");
    setTimeout(function () {
      window.location.href = href;
    }, FADE_OUT_MS);
  });

  // If the user navigates back into a cached page (bfcache), make sure
  // it isn't left stuck mid-fade-out from before they left.
  window.addEventListener("pageshow", function () {
    document.body.classList.remove("page-fade-out");
  });
})();
