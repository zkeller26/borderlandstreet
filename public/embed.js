/**
 * Borderland Street Team — embed loader.
 *
 * Drop a single line into your Webflow page (in an Embed element):
 *
 *   <div id="bl-st-embed"></div>
 *   <script async src="https://borderlandstreet.vercel.app/embed.js"
 *           data-target="#bl-st-embed"
 *           data-page="signup"></script>
 *
 * data-page accepts: "signup" (default) | "login" | "auto"
 *   - signup: lands on the Join-the-team form
 *   - login:  lands on the sign-in form
 *   - auto:   lands on `/` which redirects (login for logged-out users,
 *             dashboard for logged-in ambassadors, admin panel for admins)
 *
 * The iframe auto-resizes to its content height (no scrollbars inside it),
 * and is mobile-friendly. Permissions for camera + GPS are pre-granted via
 * the iframe `allow` attribute so the photo upload and pin drop work.
 */
(function () {
  var script = document.currentScript;
  if (!script) return;

  var origin = new URL(script.src).origin;
  var target = document.querySelector(
    script.getAttribute("data-target") || "#bl-st-embed",
  );
  if (!target) return;

  var page = script.getAttribute("data-page") || "signup";
  var path =
    page === "login" ? "/login" : page === "auto" ? "/" : "/signup";

  var iframe = document.createElement("iframe");
  iframe.src = origin + path;
  iframe.title = "Borderland Street Team";
  iframe.loading = "lazy";
  // Pre-grant the permissions the app actually uses
  iframe.setAttribute(
    "allow",
    "geolocation; camera; clipboard-write; encrypted-media",
  );
  iframe.style.width = "100%";
  iframe.style.minHeight = "900px";
  iframe.style.border = "0";
  iframe.style.background = "#0d100c";
  iframe.style.display = "block";

  target.innerHTML = "";
  target.appendChild(iframe);

  // Listen for messages from the embedded app:
  //   • bl-st:resize   — auto-size the iframe to its content height
  //   • bl-st:scrollto — scroll the Webflow page to an in-iframe target
  //                      (in-iframe anchor jumps don't work after auto-resize
  //                      because the iframe has no internal scrollbar)
  window.addEventListener("message", function (event) {
    if (event.source !== iframe.contentWindow) return;
    var data = event.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "bl-st:resize" && typeof data.height === "number") {
      iframe.style.height = Math.max(600, data.height) + "px";
    }

    if (data.type === "bl-st:scrollto" && typeof data.y === "number") {
      var iframeTop = iframe.getBoundingClientRect().top + window.scrollY;
      var offset = data.center === true ? -window.innerHeight / 2 : -24;
      var targetY = iframeTop + data.y + offset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
    }
  });
})();
