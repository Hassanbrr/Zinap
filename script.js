// script.js
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var fa = new Intl.NumberFormat("fa-IR");

  /* ---------- هدر: لوگوی بزرگ که با اسکرول کوچک می‌شود ---------- */
  var header = $("#header"), logo = $(".logo"), root = document.documentElement;
  var pdp = document.body.classList.contains("pdp");
  var panes = $$(".hero .pane");
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BAR = 64, TY0 = 76;
  function small() { return window.innerWidth < 900 ? 24 : 30; }

  /* پارالاکس ملایم قاب‌های هیرو: هر قاب با سرعت خودش */
  function drift() {
    if (!panes.length || calm) return;
    var y = window.scrollY;
    if (y > window.innerHeight * 1.1) return;
    panes.forEach(function (p) {
      var im = $("img", p); if (!im) return;
      var sp = parseFloat(p.getAttribute("data-s")) || 0.08;
      var max = p.clientHeight * 0.045;
      im.style.setProperty("--py", Math.min(y * sp, max).toFixed(1) + "px");
    });
  }

  function update() {
    if (pdp) { header.classList.add("solid"); return; }
    var big = parseFloat(getComputedStyle(logo).fontSize);
    var bar = parseFloat(getComputedStyle(header).height) || BAR;
    var range = Math.max(window.innerHeight * 0.45, 260);
    var p = Math.min(Math.max(window.scrollY / range, 0), 1);
    var sc = 1 - p * (1 - small() / big);
    var ty = TY0 * (1 - p) + ((bar - small()) / 2) * p;
    header.style.setProperty("--p", p.toFixed(3));
    logo.style.setProperty("--sc", sc.toFixed(4));
    logo.style.setProperty("--ty", ty.toFixed(1) + "px");
    header.classList.toggle("solid", p >= 1);
    drift();
  }
  var tick = false;
  window.addEventListener("scroll", function () {
    if (!tick) { tick = true; requestAnimationFrame(function () { update(); tick = false; }); }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();

  /* ---------- نقطه‌های هیروی موبایل ---------- */
  var heroEl = $(".hero"), dots = $$(".dots i");
  if (heroEl && dots.length && panes.length) {
    var hd = function () {
      var i = Math.min(dots.length - 1, Math.round(Math.abs(heroEl.scrollLeft) / (panes[0].clientWidth || 1)));
      dots.forEach(function (d, n) { d.classList.toggle("on", n === i); });
    };
    heroEl.addEventListener("scroll", hd, { passive: true });
    window.addEventListener("resize", hd); hd();
  }

  /* ---------- کشوها ---------- */
  var scrim = $("#scrim"), current = null, opener = null;
  function openP(panel, btn) {
    closeP(true);
    current = panel; opener = btn;
    panel.classList.add("open"); scrim.classList.add("on");
    document.body.classList.add("lock");
    if (btn) btn.setAttribute("aria-expanded", "true");
    var f = $("input", panel) || $(".x", panel); if (f) setTimeout(function () { f.focus(); }, 300);
  }
  function closeP(silent) {
    if (!current) return;
    current.classList.remove("open"); scrim.classList.remove("on");
    document.body.classList.remove("lock");
    if (opener) { opener.setAttribute("aria-expanded", "false"); if (!silent) opener.focus(); }
    current = null; opener = null;
  }
  [["#openMenu", "#menu"], ["#openSearch", "#search"], ["#openCart", "#cart"]].forEach(function (a) {
    var b = $(a[0]), p = $(a[1]);
    if (b && p) b.addEventListener("click", function () { openP(p, b); });
  });
  $$(".x").forEach(function (b) { b.addEventListener("click", function () { closeP(); }); });
  scrim.addEventListener("click", function () { closeP(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeP(); });

  /* ---------- منو: آکاردئون + پیش‌نمایش تصویر ---------- */
  var items = $$("#menu .menu-list > ul > li"), prevs = $$("#menu .menu-prev img"), tag = $("#menu .tag");
  function activate(li) {
    items.forEach(function (x) {
      var on = x === li; x.classList.toggle("act", on);
      var t = $(".top", x); if (t) t.setAttribute("aria-expanded", on);
    });
    var k = li.getAttribute("data-p");
    prevs.forEach(function (im) { im.classList.toggle("on", im.getAttribute("data-p") === k); });
    if (tag) tag.textContent = li.getAttribute("data-t") || "";
  }
  items.forEach(function (li) {
    li.addEventListener("mouseenter", function () { if (window.innerWidth > 900) activate(li); });
    var t = $(".top", li);
    if (t) t.addEventListener("click", function (e) { if ($(".sub", li)) { e.preventDefault(); activate(li); } });
  });
  if (items[0]) activate(items[0]);

  /* ---------- سبد خرید (ذخیره در مرورگر؛ مشترک بین صفحه‌ها) ---------- */
  var KEY = "zinap-cart", cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { cart = []; }
  var lines = $("#lines"), empty = $("#empty"), tot = $("#tot"), sum = $("#sum"), go = $("#go"), counts = $$(".count");
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }
  function num(s) {
    var d = "۰۱۲۳۴۵۶۷۸۹";
    return parseInt(String(s).replace(/[۰-۹]/g, function (c) { return d.indexOf(c); }).replace(/[^\d]/g, ""), 10) || 0;
  }
  function el(tagName, text, cls) {
    var n = document.createElement(tagName);
    if (text) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  }
  function render() {
    var n = 0, t = 0;
    if (lines) lines.textContent = "";
    cart.forEach(function (it, i) {
      n += it.qty; t += it.price * it.qty;
      if (!lines) return;
      var li = document.createElement("li");
      var im = el("img"); im.src = it.img; im.alt = "";
      var d = document.createElement("div");
      d.appendChild(el("b", it.name));
      d.appendChild(el("span", (it.color ? it.color + "، " : "") + "سایز " + it.size + (it.qty > 1 ? "، تعداد " + fa.format(it.qty) : "")));
      d.appendChild(el("span", fa.format(it.price * it.qty)));
      var r = el("button", "حذف", "rm"); r.type = "button";
      r.addEventListener("click", function () { cart.splice(i, 1); save(); render(); });
      li.appendChild(im); li.appendChild(d); li.appendChild(r);
      lines.appendChild(li);
    });
    if (empty) empty.hidden = n > 0;
    if (tot) tot.hidden = n === 0;
    if (sum) sum.textContent = fa.format(t) + " تومان";
    if (go) go.textContent = n ? "ثبت سفارش" : "ادامه‌ی خرید";
    counts.forEach(function (c) { c.textContent = "(" + fa.format(n) + ")"; });
  }
  function add(it) {
    var hit = cart.filter(function (x) { return x.name === it.name && x.size === it.size && x.color === it.color; })[0];
    if (hit) hit.qty += 1; else cart.push(it);
    save(); render();
    var c = $("#cart"); if (c) openP(c, $("#openCart"));
  }
  render();

  /* افزودن سریع از کارت‌های محصول: «+» سایزها را نشان می‌دهد، انتخاب سایز به سبد اضافه می‌کند */
  $$(".card").forEach(function (c) {
    var plus = $(".add", c);
    if (plus) plus.addEventListener("click", function () { c.classList.toggle("pick"); });
    $$(".sizes button", c).forEach(function (b) {
      b.addEventListener("click", function () {
        var im = $(".ph img", c);
        c.classList.remove("pick");
        add({ name: $(".meta a", c).textContent, price: num($(".pr", c).textContent), size: b.textContent, color: "", img: im ? im.getAttribute("src") : "", qty: 1 });
      });
    });
  });

  /* ---------- ریل محصولات ---------- */
  $$(".rail-wrap").forEach(function (w) {
    var rail = $(".rail", w), prev = $(".prev", w), next = $(".next", w);
    function step() { return rail.clientWidth * 0.75; }
    function state() {
      var max = rail.scrollWidth - rail.clientWidth, x = Math.abs(rail.scrollLeft);
      prev.disabled = x < 4; next.disabled = x > max - 4;
    }
    next.addEventListener("click", function () { rail.scrollBy({ left: -step(), behavior: "smooth" }); });
    prev.addEventListener("click", function () { rail.scrollBy({ left: step(), behavior: "smooth" }); });
    rail.addEventListener("scroll", state, { passive: true });
    window.addEventListener("resize", state); state();
  });

  /* ---------- صفحه‌ی محصول ---------- */
  var gal = $("#gal");
  if (gal) {
    var gis = $$(".gi", gal), zoom = $("#zoom"), zimg = $("#zimg"), zc = $("#zc");
    var zprev = $(".zprev", zoom), znext = $(".znext", zoom), zi = 0, zOpener = null, galN = $("#galN");

    /* اسلایدر: شمارنده، نوار پیشرفت و دکمه‌های قبلی/بعدی */
    var gprev = $(".gprev"), gnext = $(".gnext"), gbar = $(".gal-bar i");
    function slideW() { return gis[0].getBoundingClientRect().width || gal.clientWidth || 1; }
    function setN() {
      var max = gal.scrollWidth - gal.clientWidth, x = Math.abs(gal.scrollLeft);
      var i = Math.round(x / slideW());
      galN.textContent = fa.format(Math.min(i, gis.length - 1) + 1) + " از " + fa.format(gis.length);
      var w = max > 1 ? gal.clientWidth / gal.scrollWidth * 100 : 100;
      var pr = max > 1 ? x / max : 0;
      gbar.style.width = w.toFixed(1) + "%";
      gbar.style.insetInlineStart = (pr * (100 - w)).toFixed(1) + "%";
      gprev.disabled = x < 4; gnext.disabled = x > max - 4;
    }
    gnext.addEventListener("click", function () { gal.scrollBy({ left: -slideW(), behavior: "smooth" }); });
    gprev.addEventListener("click", function () { gal.scrollBy({ left: slideW(), behavior: "smooth" }); });
    gal.addEventListener("scroll", setN, { passive: true });
    window.addEventListener("resize", setN); setN();

    /* نمای بزرگ */
    function show(i) {
      zi = Math.max(0, Math.min(i, gis.length - 1));
      var im = $("img", gis[zi]);
      zimg.src = im.getAttribute("src"); zimg.alt = im.alt;
      zoom.classList.remove("z");
      zc.textContent = fa.format(zi + 1) + " از " + fa.format(gis.length);
      zprev.disabled = zi === 0; znext.disabled = zi === gis.length - 1;
    }
    function openZ(i, btn) {
      zOpener = btn; show(i);
      zoom.classList.add("open"); document.body.classList.add("lock");
      setTimeout(function () { $(".zx", zoom).focus(); }, 60);
    }
    function closeZ() {
      if (!zoom.classList.contains("open")) return;
      zoom.classList.remove("open", "z"); document.body.classList.remove("lock");
      if (zOpener) zOpener.focus();
    }
    function origin(e) {
      var r = zimg.getBoundingClientRect();
      zimg.style.setProperty("--ox", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      zimg.style.setProperty("--oy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    }
    gis.forEach(function (g, i) { g.addEventListener("click", function () { openZ(i, g); }); });
    $(".zx", zoom).addEventListener("click", closeZ);
    zprev.addEventListener("click", function () { show(zi - 1); });
    znext.addEventListener("click", function () { show(zi + 1); });
    $(".zstage", zoom).addEventListener("click", function (e) { origin(e); zoom.classList.toggle("z"); });
    $(".zstage", zoom).addEventListener("mousemove", function (e) { if (zoom.classList.contains("z")) origin(e); });
    document.addEventListener("keydown", function (e) {
      if (!zoom.classList.contains("open")) return;
      if (e.key === "Escape") closeZ();
      if (e.key === "ArrowLeft") show(zi + 1);   /* صفحه راست‌به‌چپ است */
      if (e.key === "ArrowRight") show(zi - 1);
    });

    /* رنگ، سایز و افزودن */
    var addBtn = $("#addBtn"), warn = $("#warn"), colorName = $("#colorName"), sws = $$(".sw button");
    sws.forEach(function (b) {
      b.addEventListener("click", function () {
        sws.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        colorName.textContent = b.getAttribute("data-n");
      });
    });
    $$('input[name="size"]').forEach(function (i) { i.addEventListener("change", function () { warn.hidden = true; }); });
    addBtn.addEventListener("click", function () {
      var s = $('input[name="size"]:checked');
      if (!s) { warn.hidden = false; return; }
      add({ name: $("h1").textContent, price: parseInt(addBtn.getAttribute("data-price"), 10), size: s.value, color: colorName.textContent, img: $("img", gis[0]).getAttribute("src"), qty: 1 });
    });
  }

  /* ---------- علاقه‌مندی و نوار خرید موبایل ---------- */
  if (gal) {
    var fav = $("#fav");
    fav.addEventListener("click", function () {
      var on = fav.getAttribute("aria-pressed") !== "true";
      fav.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var bbar = $("#bbar"), bbtn = $("#bbarBtn");
    if (bbar && "IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { bbar.classList.toggle("on", !en[0].isIntersecting); }).observe(addBtn);
    }
    if (bbtn) bbtn.addEventListener("click", function () {
      if ($('input[name="size"]:checked')) addBtn.click();
      else { warn.hidden = false; $(".sz").scrollIntoView({ behavior: "smooth", block: "center" }); }
    });
  }

  /* ---------- نمایش هنگام اسکرول ---------- */
  var rv = $$(".rv");
  if (rv.length && "IntersectionObserver" in window && !calm) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (n, i) { n.style.transitionDelay = ((i % 3) * 90) + "ms"; io.observe(n); });
  } else { rv.forEach(function (n) { n.classList.add("in"); }); }

  /* ---------- نوار پیشرفت ریل ---------- */
  $$(".rail-wrap").forEach(function (w) {
    var rail = $(".rail", w), bar = $(".rbar i", w);
    if (!rail || !bar) return;
    function pr() {
      var max = rail.scrollWidth - rail.clientWidth, x = Math.abs(rail.scrollLeft);
      var wd = rail.scrollWidth ? rail.clientWidth / rail.scrollWidth * 100 : 100;
      bar.style.width = wd.toFixed(1) + "%";
      bar.style.insetInlineStart = (max > 1 ? x / max * (100 - wd) : 0).toFixed(1) + "%";
    }
    rail.addEventListener("scroll", pr, { passive: true });
    window.addEventListener("resize", pr); pr();
  });

  /* ---------- فیلتر جدیدترین‌ها ---------- */
  var tabs = $$(".tabs button");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      var f = t.getAttribute("data-f");
      tabs.forEach(function (x) { x.setAttribute("aria-pressed", x === t ? "true" : "false"); });
      $$("#shop .card").forEach(function (c) { c.hidden = !(f === "all" || c.getAttribute("data-c") === f); });
    });
  });

  /* ---------- خرید ست: هایلایت فهرست ---------- */
  var lis = $$(".look .li");
  lis.forEach(function (n) {
    n.addEventListener("mouseenter", function () { n.classList.add("on"); });
    n.addEventListener("mouseleave", function () { n.classList.remove("on"); });
    n.addEventListener("focus", function () { n.classList.add("on"); });
    n.addEventListener("blur", function () { n.classList.remove("on"); });
  });

  /* ---------- خبرنامه ---------- */
  $$(".nl form").forEach(function (f) {
    f.addEventListener("submit", function () {
      var ok = $(".ok", f.parentNode); if (!ok) return;
      f.hidden = true; ok.hidden = false;
    });
  });

  /* ---------- فرم‌ها (نمایشی) ---------- */
  $$("form").forEach(function (f) { f.addEventListener("submit", function (e) { e.preventDefault(); }); });
})();