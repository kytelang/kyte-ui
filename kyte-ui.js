// kyte-ui.js - OPTIONAL progressive enhancer for kyte-ui's interactive widgets.
//
// The kit ships framework-agnostic, ARIA-correct markup. The native <details>-based
// widgets (TreeView, Dropdown, Accordion) already work with no JavaScript. This file
// is OPT-IN: include it only if you want the extra behaviour below. It bundles nothing,
// has no dependencies, and is safe to load once, globally. It uses event delegation, so
// it also covers markup swapped in later by htmx / Unpoly / Alpine / datastar.
//
//   Tabs     ([data-kyte="tabs"])     click + Left/Right/Home/End switch the active tab,
//                                      updating aria-selected and showing the panel.
//   Dropdown ([data-kyte="dropdown"]) closes on an outside click or the Escape key.
//   Menu     ([data-kyte="menu"])     Up/Down/Home/End move focus (roving tabindex).
//   Modal    (data-kyte-open="id")    opens the <dialog> with that id (reopen after close);
//            (data-kyte-close)         closes the nearest enclosing <dialog>.
//   Toast    (data-kyte-dismiss)       removes the enclosing [data-kyte="toast"].
//
// Usage: <script src="/kyte-ui.js" defer></script>
(function () {
  "use strict";

  function activateTab(tab) {
    var list = tab.closest('[role="tablist"]');
    var root = tab.closest('[data-kyte="tabs"]');
    if (!list || !root) return;
    list.querySelectorAll('[role="tab"]').forEach(function (t) {
      var selected = t === tab;
      t.setAttribute("aria-selected", selected ? "true" : "false");
      t.tabIndex = selected ? 0 : -1;
      var panel = root.querySelector("#" + CSS.escape(t.getAttribute("aria-controls") || ""));
      if (panel) panel.classList.toggle("hidden", !selected);
    });
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;

    // Modal: an element with data-kyte-open="<id>" opens that <dialog> (reopen after close).
    var opener = e.target.closest("[data-kyte-open]");
    if (opener) {
      var dlg = document.getElementById(opener.getAttribute("data-kyte-open") || "");
      if (dlg && typeof dlg.showModal === "function") dlg.showModal();
      return;
    }
    // Modal: an element with data-kyte-close closes the <dialog> it sits in.
    var closer = e.target.closest("[data-kyte-close]");
    if (closer) {
      var owner = closer.closest("dialog");
      if (owner && typeof owner.close === "function") owner.close();
      return;
    }
    // Toast: data-kyte-dismiss removes the toast it sits in.
    var dismiss = e.target.closest("[data-kyte-dismiss]");
    if (dismiss) {
      var toast = dismiss.closest('[data-kyte="toast"]');
      if (toast) toast.remove();
      return;
    }

    var tab = e.target.closest('[role="tab"]');
    if (tab) {
      activateTab(tab);
      tab.focus();
      return;
    }
    // Close any open dropdown whose box the click fell outside of.
    document.querySelectorAll('details[data-kyte="dropdown"][open]').forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute("open");
    });
  });

  document.addEventListener("keydown", function (e) {
    var el = e.target;
    if (!el || !el.closest) return;

    // Escape closes an open dropdown.
    if (e.key === "Escape") {
      var open = el.closest('details[data-kyte="dropdown"][open]');
      if (open) { open.removeAttribute("open"); var s = open.querySelector("summary"); if (s) s.focus(); return; }
    }

    // Tab list: arrow / Home / End move between tabs.
    var tab = el.closest('[role="tab"]');
    if (tab) {
      var tabs = Array.prototype.slice.call(tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]'));
      var i = tabs.indexOf(tab);
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); activateTab(next); next.focus(); }
      return;
    }

    // Menu: Up / Down / Home / End move focus between menuitems.
    var item = el.closest('[role="menuitem"]');
    if (item) {
      var menu = item.closest('[role="menu"]');
      var items = Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]'));
      var j = items.indexOf(item);
      var to = null;
      if (e.key === "ArrowDown") to = items[(j + 1) % items.length];
      else if (e.key === "ArrowUp") to = items[(j - 1 + items.length) % items.length];
      else if (e.key === "Home") to = items[0];
      else if (e.key === "End") to = items[items.length - 1];
      if (to) {
        e.preventDefault();
        items.forEach(function (x) { x.tabIndex = -1; });
        to.tabIndex = 0;
        to.focus();
      }
    }
  });
})();
