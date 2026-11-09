/* Older tablets (Chrome on Android 5–9 that no longer updates) lack a few newer browser
   features the app uses. This file loads first and fills those gaps, and does nothing on
   newer browsers that already have them. */
(function () {
  "use strict";
  var supports = function (p, v) { try { return window.CSS && CSS.supports(p, v); } catch (e) { return false; } };

  /* Array.flat / Array.flatMap (Chrome 69) */
  if (!Array.prototype.flat) {
    Object.defineProperty(Array.prototype, "flat", { configurable: true, writable: true, value: function (depth) {
      depth = depth === undefined ? 1 : Number(depth) || 0;
      var out = [];
      (function add(arr, d) { for (var i = 0; i < arr.length; i++) { if (!(i in arr)) continue; var v = arr[i]; if (Array.isArray(v) && d > 0) add(v, d - 1); else out.push(v); } })(this, depth);
      return out;
    } });
  }
  if (!Array.prototype.flatMap) {
    Object.defineProperty(Array.prototype, "flatMap", { configurable: true, writable: true, value: function (fn, self) {
      return Array.prototype.map.call(this, fn, self).flat(1);
    } });
  }

  /* style.inset = "…" set from scripts (Chrome 87) → top / right / bottom / left */
  if (!supports("inset", "0")) {
    Object.defineProperty(CSSStyleDeclaration.prototype, "inset", { configurable: true,
      get: function () { return [this.top, this.right, this.bottom, this.left].join(" "); },
      set: function (v) {
        var p = String(v).trim().split(/\s+/).map(function (x) { return /^-?[\d.]+$/.test(x) && x !== "0" ? x + "px" : x; });
        if (p.length === 1) p = [p[0], p[0], p[0], p[0]];
        else if (p.length === 2) p = [p[0], p[1], p[0], p[1]];
        else if (p.length === 3) p = [p[0], p[1], p[2], p[1]];
        this.top = p[0]; this.right = p[1]; this.bottom = p[2]; this.left = p[3];
      } });
  }

  /* Flexbox gap (Chrome 84): without it, buttons and pictures in a row touch each other.
     Where it's missing, add the same spacing as margins on the items. */
  var flexGap = (function () {
    var d = document.createElement("div");
    d.style.cssText = "display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden";
    d.appendChild(document.createElement("div")); d.appendChild(document.createElement("div"));
    document.documentElement.appendChild(d);
    var ok = d.scrollHeight === 1;
    d.parentNode.removeChild(d);
    return ok;
  })();
  if (!flexGap) {
    document.documentElement.className += " no-flexgap";
    var px = function (v) { return parseFloat(v) || 0; };
    var fixBox = function (box) {
      var cs = getComputedStyle(box);
      if (cs.display !== "flex" && cs.display !== "inline-flex") return;
      var rg = px(cs.rowGap), cg = px(cs.columnGap);
      if (!rg && !cg) return;
      var col = cs.flexDirection.indexOf("column") === 0, rev = cs.flexDirection.indexOf("reverse") > 0;
      var wrap = cs.flexWrap !== "nowrap", n = 0;
      for (var i = 0; i < box.children.length; i++) {
        var k = box.children[i], ks = getComputedStyle(k);
        if (ks.display === "none" || ks.position === "absolute" || ks.position === "fixed") continue;
        if (!k.__gapFixed) {
          k.__gapFixed = true;
          if (wrap) { // space on two sides so wrapped rows line up too
            if (cg && !px(ks.marginRight)) k.style.marginRight = cg + "px";
            if (rg && !px(ks.marginBottom)) k.style.marginBottom = rg + "px";
          } else if (n > 0) {
            var side = col ? (rev ? "marginBottom" : "marginTop") : (rev ? "marginRight" : "marginLeft");
            if (!px(ks[side])) k.style[side] = (col ? rg : cg) + "px";
          } else k.__gapFixed = false; // the first item may stop being first later
        }
        n++;
      }
    };
    var queued = false;
    var run = function () {
      queued = false;
      var all = document.querySelectorAll("#stage *, #sb-lock *, #sb-lock, #sb-offline");
      for (var i = 0; i < all.length; i++) { try { fixBox(all[i]); } catch (e) {} }
    };
    var later = function () { if (!queued) { queued = true; setTimeout(run, 30); } };
    var start = function () {
      run();
      if (window.MutationObserver) new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
    };
    if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  }

  /* aspect-ratio (Chrome 88): used for square sticker slots; give them a height instead */
  if (!supports("aspect-ratio", "1")) {
    Object.defineProperty(CSSStyleDeclaration.prototype, "aspectRatio", { configurable: true,
      get: function () { return this.__ar || ""; },
      set: function (v) { this.__ar = v; this.minHeight = this.minHeight || "120px"; } });
  }
})();
