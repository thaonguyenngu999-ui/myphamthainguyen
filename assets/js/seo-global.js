(function initSeoGlobal() {
  const cfg = window.SEO_CONFIG || {};
  const AFFILIATE_CLICK_KEY = "mypham_affiliate_click_logs";
  const fallbackOrigin = location.origin === "null" ? "" : `${location.origin}/`;
  const siteUrl = String(cfg.siteUrl || fallbackOrigin).trim();
  const absoluteUrl = new URL(location.pathname + location.search, siteUrl || location.href).toString();

  const ensureMeta = (attr, key, content) => {
    if (!content) return;
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  const canonical = document.head.querySelector('link[rel="canonical"]');
  if (canonical) {
    const href = canonical.getAttribute("href") || "";
    try {
      canonical.setAttribute("href", new URL(href || location.pathname, siteUrl || location.href).toString());
    } catch {
      canonical.setAttribute("href", absoluteUrl);
    }
  }

  ensureMeta("property", "og:url", absoluteUrl);
  ensureMeta("property", "og:site_name", "Mỹ Phẩm Thái Nguyên");
  ensureMeta("name", "twitter:card", "summary_large_image");

  const verifyToken = String(cfg.searchConsoleVerification || "").trim();
  if (verifyToken) {
    ensureMeta("name", "google-site-verification", verifyToken);
  }

  window.recordAffiliateClick = function recordAffiliateClick(payload = {}) {
    try {
      const current = JSON.parse(localStorage.getItem(AFFILIATE_CLICK_KEY) || "[]");
      const list = Array.isArray(current) ? current : [];
      list.push({
        timestamp: Date.now(),
        productId: String(payload.productId || ""),
        productName: String(payload.productName || ""),
        source: String(payload.source || "unknown"),
        subId: String(payload.subId || ""),
        link: String(payload.link || "")
      });
      if (list.length > 2000) {
        list.splice(0, list.length - 2000);
      }
      localStorage.setItem(AFFILIATE_CLICK_KEY, JSON.stringify(list));
    } catch {
      // ignore storage failures
    }
  };

  const gaId = String(cfg.gaMeasurementId || "").trim();
  if (!gaId) return;

  const gaScript = document.createElement("script");
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;
  gtag("js", new Date());
  gtag("config", gaId);
})();
