"use client";

import { useEffect } from "react";

/**
 * When the Street Team app is embedded as an iframe (e.g. on
 * borderlandfestival.com via /embed.js), broadcast the rendered document
 * height back to the parent so the iframe auto-resizes to fit its content
 * with no nested scrollbar.
 *
 * No-op when the app is loaded standalone (top-level window).
 */
export function EmbedResizeBroadcaster() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return; // not embedded

    let lastHeight = 0;
    let scheduled = false;

    function post() {
      scheduled = false;
      const h = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      if (h !== lastHeight) {
        lastHeight = h;
        window.parent.postMessage({ type: "bl-st:resize", height: h }, "*");
      }
    }

    function schedule() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(post);
    }

    // Initial measurement
    post();

    // Watch document for size changes
    const ro = new ResizeObserver(schedule);
    ro.observe(document.documentElement);
    ro.observe(document.body);

    // Watch DOM mutations (modals opening, dropdowns expanding, etc.)
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "open"],
    });

    // Catch late-loading images
    window.addEventListener("load", post);

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("load", post);
    };
  }, []);

  return null;
}
