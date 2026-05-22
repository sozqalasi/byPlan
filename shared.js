// ByPlan — shared nav, footer, scroll reveal
(function () {
  // Top-level nav. `children` makes an item a dropdown parent;
  // the parent's `href` is still clickable (goes to Product overview).
  const PAGES = [
    { href: "index.html", label: "Home" },
    {
      href: "product.html",
      label: "Product",
      children: [
        { group: "Platform", items: [
          { href: "product.html", label: "Product", desc: "Overview, all 16 modules, features and capabilities — one unified page." },
        ]},
        { group: "Deep dives", items: [
          { href: "dashboard.html",  label: "Sales Dashboard",  desc: "Pipeline, projects, AI tasks, in one screen." },
          { href: "marketing.html",  label: "Marketing & Ads",  desc: "Google, Meta, LSA — managed by AI." },
          { href: "ai.html",         label: "ByPlan AI",        desc: "Workflows trained on your business." },
          { href: "agreements.html", label: "Sales Agreements", desc: "Generate, sign, get paid — on a phone." },
        ]},
      ],
    },
    { href: "industries.html", label: "Industries" },
    { href: "pricing.html",    label: "Pricing" },
    { href: "customers.html",  label: "Customers" },
  ];

  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  // Flatten children to detect "this page belongs to Product" for active state.
  function flatHrefs(item) {
    const out = [item.href];
    (item.children || []).forEach(grp => (grp.items || []).forEach(it => out.push(it.href)));
    return out;
  }
  function isActive(item) {
    return flatHrefs(item).includes(file);
  }
  // Default top-level highlight if no match
  const fallback = PAGES[0];
  const here = (PAGES.find(p => isActive(p)) || fallback).href;

  function brandImg() {
    // Uploaded byplan logo, rendered as <img> for the top nav.
    return `<img class="brand-img" src="assets/byplan-logo.png" alt="byplan" decoding="async" />`;
  }

  function brandSvg() {
    // CSS-drawn brand mark + wordmark — used in the dark footer where
    // the white-on-light raster logo would clash.
    return `
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="brand-word">byplan</span>
    `;
  }

  function renderNav() {
    const links = PAGES.map(p => {
      const active = isActive(p) ? "active" : "";
      if (p.children) {
        const groups = p.children.map(g => `
          <div class="dd-group">
            <div class="dd-group-h">${g.group}</div>
            <div class="dd-items">
              ${g.items.map(it => `
                <a class="dd-item ${it.href === file ? "current" : ""}" href="${it.href}">
                  <span class="dd-title">${it.label}</span>
                  ${it.desc ? `<span class="dd-desc">${it.desc}</span>` : ""}
                </a>`).join("")}
            </div>
          </div>`).join("");
        return `
          <div class="nav-dd ${active}" data-dd>
            <a class="nav-link nav-link-dd" href="${p.href}" aria-haspopup="true" aria-expanded="false">
              ${p.label}
              <svg class="dd-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </a>
            <div class="dd-panel" role="menu">${groups}</div>
          </div>`;
      }
      return `<a class="nav-link ${active}" href="${p.href}">${p.label}</a>`;
    }).join("");

    const nav = document.createElement("nav");
    nav.className = "nav";
    nav.innerHTML = `
      <div class="nav-inner">
        <a class="brand" href="index.html" aria-label="byplan home">${brandImg()}</a>
        <div class="nav-links" role="navigation">${links}</div>
        <div class="nav-actions">
          <a class="btn btn-ghost btn-sm" href="signup.html">Sign Up</a>
          <a class="btn btn-accent btn-sm" href="demo.html">Book a Demo</a>
          <button class="nav-burger" aria-label="Menu" aria-expanded="false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.insertBefore(nav, document.body.firstChild);

    // Dropdown click-toggle on the caret (the link itself still navigates).
    // Tap caret on touch / click caret on desktop to open, hover also opens.
    nav.querySelectorAll(".nav-dd").forEach(dd => {
      const caret = dd.querySelector(".dd-caret");
      caret.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const open = dd.classList.toggle("open");
        const trigger = dd.querySelector(".nav-link-dd");
        trigger.setAttribute("aria-expanded", open);
      });
    });
    // Close any open dropdown when clicking outside.
    document.addEventListener("click", (e) => {
      if (e.target.closest(".nav-dd")) return;
      nav.querySelectorAll(".nav-dd.open").forEach(d => {
        d.classList.remove("open");
        d.querySelector(".nav-link-dd").setAttribute("aria-expanded", "false");
      });
    });
    // Escape closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        nav.querySelectorAll(".nav-dd.open").forEach(d => {
          d.classList.remove("open");
          d.querySelector(".nav-link-dd").setAttribute("aria-expanded", "false");
        });
      }
    });

    // Mobile menu — flat list incl. dropdown children
    const mm = document.createElement("div");
    mm.className = "mobile-menu";
    let mhtml = "";
    PAGES.forEach(p => {
      mhtml += `<a class="mlink ${p.href === file ? "active" : ""}" href="${p.href}">${p.label}</a>`;
      if (p.children) {
        p.children.forEach(g => {
          g.items.forEach(it => {
            if (it.href === p.href) return; // skip self-dup
            mhtml += `<a class="mlink mlink-sub ${it.href === file ? "active" : ""}" href="${it.href}">↳ ${it.label}</a>`;
          });
        });
      }
    });
    mhtml += `<a class="mlink" href="demo.html">Book a Demo →</a>`;
    mm.innerHTML = mhtml;
    document.body.insertBefore(mm, nav.nextSibling);

    const burger = nav.querySelector(".nav-burger");
    burger.addEventListener("click", () => {
      const open = mm.classList.toggle("open");
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", open);
    });
    mm.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      mm.classList.remove("open");
      document.body.classList.remove("menu-open");
    }));
  }

  function renderFooter() {
    const f = document.createElement("footer");
    f.className = "site-footer";
    f.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <a class="brand" href="index.html" style="color:white; margin-bottom:18px;">${brandSvg()}</a>
            <p style="margin-top:18px; max-width:32ch; font-size:14px; line-height:1.55; color: rgba(255,255,255,.62);">AI-powered CRM and project management for construction & outdoor living businesses.</p>
            <div style="margin-top:22px; display:flex; align-items:center; gap:8px;">
              <span style="width:8px;height:8px;border-radius:50%;background:#34d399;box-shadow:0 0 0 4px rgba(52,211,153,.15);"></span>
              <span style="font-family:var(--font-mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; color: rgba(255,255,255,.6);">All systems operational</span>
            </div>
          </div>
          <div class="footer-col">
            <h5>Product</h5>
            <ul>
              <li><a href="product.html">Features</a></li>
              <li><a href="dashboard.html">Dashboard</a></li>
              <li><a href="marketing.html">Marketing</a></li>
              <li><a href="agreements.html">Sales Agreements</a></li>
              <li><a href="ai.html">AI Assistant</a></li>
              <li><a href="product.html#portal">Customer Portal</a></li>
              <li><a href="product.html#pricing">Pricing</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Industries</h5>
            <ul>
              <li><a href="industries.html#pergola">Pergola</a></li>
              <li><a href="industries.html#outdoor">Outdoor Living</a></li>
              <li><a href="industries.html#landscaping">Landscaping</a></li>
              <li><a href="industries.html#flooring">Flooring</a></li>
              <li><a href="industries.html#kitchen">Kitchen & Cabinet</a></li>
              <li><a href="industries.html#construction">Construction</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="customers.html">Customers</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Resources</h5>
            <ul>
              <li><a href="demo.html">Book a Demo</a></li>
              <li><a href="#">Help center</a></li>
              <li><a href="#">Changelog</a></li>
              <li><a href="#">Security</a></li>
              <li><a href="#">Status</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 ByPlan, Inc. All rights reserved.</span>
          <div class="socials">
            <a href="#" aria-label="Twitter"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
            <a href="#" aria-label="LinkedIn"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.56c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.66H9.37V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56z"/></svg></a>
            <a href="#" aria-label="YouTube"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8M9.6 15.6V8.4l6.2 3.6z"/></svg></a>
            <a href="#" aria-label="GitHub"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.5.1-3.1 0 0 1-.3 3.3 1.2a11 11 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.1.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg></a>
          </div>
        </div>
      </div>
      <div class="footer-mega" aria-hidden="true">ByPlan</div>
    `;
    document.body.appendChild(f);
  }

  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (els.length === 0) return;

    // Auto-stagger if no inline delay
    els.forEach((el) => {
      if (!el.style.getPropertyValue("--reveal-delay")) {
        const sibIndex = [...(el.parentElement?.children || [])].indexOf(el);
        const d = Math.min(sibIndex, 8) * 60;
        el.style.setProperty("--reveal-delay", `${d}ms`);
      }
    });

    // Snap an element to the final "in" state without animating.
    // Needed because CSS transitions are paused while the document is hidden
    // (background tab, prerender, preview iframe), which can leave elements
    // stuck at opacity 0 even after .in is added.
    function snapIn(el) {
      if (el.classList.contains("in")) return;
      const prevT = el.style.transition;
      const prevD = el.style.transitionDelay;
      el.style.transition = "none";
      el.style.transitionDelay = "0s";
      el.classList.add("in");
      // Force reflow so the no-transition state is committed
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight;
      // Restore (next frame) so future state changes can transition normally
      requestAnimationFrame(() => {
        el.style.transition = prevT;
        el.style.transitionDelay = prevD;
      });
    }

    function inViewport(el) {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const r = el.getBoundingClientRect();
      return r.top < vh + 40 && r.bottom > -40;
    }

    function revealAboveFold(snap) {
      els.forEach(el => {
        if (el.classList.contains("in")) return;
        if (inViewport(el)) {
          if (snap) snapIn(el);
          else el.classList.add("in");
        }
      });
    }

    // If the page is loading hidden (background tab, prerender, hidden iframe),
    // CSS transitions AND setTimeout/IntersectionObserver can be paused. Snap
    // EVERY .reveal in immediately so content is never invisible — we sacrifice
    // the animation, but the user wasn't going to see it in a hidden tab anyway.
    if (document.hidden) {
      els.forEach(snapIn);
    } else {
      revealAboveFold(false);
    }

    // Re-check on load (fonts/images can shift layout).
    window.addEventListener("load", () => {
      if (document.hidden) els.forEach(snapIn);
      else revealAboveFold(false);
    });

    // When the document becomes visible, snap any still-hidden in-viewport
    // elements (their transitions may have been frozen at opacity 0).
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        els.forEach(el => {
          if (!el.classList.contains("in") && inViewport(el)) snapIn(el);
          else if (el.classList.contains("in")) {
            // Recover any element whose transition was paused mid-flight
            const cs = getComputedStyle(el);
            if (parseFloat(cs.opacity) < 0.99) {
              el.classList.remove("in");
              snapIn(el);
            }
          }
        });
      }
    });

    if (!("IntersectionObserver" in window)) {
      els.forEach(e => e.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // If the document is hidden, snap; otherwise animate.
          if (document.hidden) snapIn(e.target);
          else e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "-40px 0px -40px 0px", threshold: 0.05 });
    els.forEach((el) => {
      if (!el.classList.contains("in")) io.observe(el);
    });

    // Belt-and-suspenders: if anything is still hidden after 1.5s, snap it.
    setTimeout(() => {
      els.forEach(snapIn);
    }, 1500);
  }

  // Smooth in-page anchor scroll
  function initAnchors() {
    document.body.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      if (!id) return;
      const t = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    });
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(() => {
    renderNav();
    renderFooter();
    initReveal();
    initAnchors();
  });
})();
