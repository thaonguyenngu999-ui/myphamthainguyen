const STORAGE_KEY = "mypham_products";
const FALLBACK_IMAGE = "https://placehold.co/600x600?text=My+Pham";
const IMAGE_PROXIES = [
  "https://wsrv.nl/?url=",
  "https://images.weserv.nl/?url=",
  "https://imageproxy.pimg.tw/resize?url="
];

function proxyImageUrl(url, proxyIndex = 0) {
  if (!url || typeof url !== "string" || url.startsWith("data:") || url.includes("placehold.co")) return url;
  if (url.includes("susercontent.com")) {
    const proxy = IMAGE_PROXIES[proxyIndex] || IMAGE_PROXIES[0];
    return proxy + encodeURIComponent(url.trim()) + "&n=-1";
  }
  return url;
}

/* Thử ảnh gốc trước, nếu lỗi thì thử từng proxy, cuối cùng mới dùng placeholder */
function applyImageWithFallback(imgEl, originalUrl, altText) {
  if (!imgEl || !originalUrl) return;
  const proxied0 = proxyImageUrl(originalUrl, 0);
  const proxied1 = proxyImageUrl(originalUrl, 1);
  const proxied2 = proxyImageUrl(originalUrl, 2);

  /* Thử URL gốc (không proxy) trước */
  imgEl.alt = altText || "";
  imgEl.onerror = function () {
    /* URL gốc lỗi → thử proxy 0 */
    this.onerror = function () {
      /* Proxy 0 lỗi → thử proxy 1 */
      this.onerror = function () {
        /* Proxy 1 lỗi → thử proxy 2 */
        this.onerror = function () {
          /* Tất cả lỗi → placeholder */
          this.onerror = null;
          this.src = FALLBACK_IMAGE;
        };
        this.src = proxied2;
      };
      this.src = proxied1;
    };
    this.src = proxied0;
  };
  imgEl.src = originalUrl;
}
const REMOTE_PRODUCTS_FALLBACK_URLS = [
  String(window.SEO_CONFIG?.githubRawProductsUrl || "").trim(),
  "https://raw.githubusercontent.com/thaonguyenngu999-ui/myphamthainguyen/main/assets/data/products.json",
  "https://cdn.jsdelivr.net/gh/thaonguyenngu999-ui/myphamthainguyen@main/assets/data/products.json"
].filter(Boolean);

const viewerVideo = document.getElementById("viewerVideo");
const videoPlayOverlay = document.getElementById("videoPlayOverlay");
const viewerThumbs = document.getElementById("viewerThumbs");
const detailViewer = document.querySelector(".detail-viewer");
const prevMediaBtn = document.getElementById("prevMediaBtn");
const nextMediaBtn = document.getElementById("nextMediaBtn");
const productNameEl = document.getElementById("productName");
const productCategoryEl = document.getElementById("productCategory");
const productCurrentPriceEl = document.getElementById("productCurrentPrice");
const productOldPriceEl = document.getElementById("productOldPrice");
const productDiscountEl = document.getElementById("productDiscount");
const productSoldEl = document.getElementById("productSold");
const productDescriptionEl = document.getElementById("productDescription");
const productDetailsEl = document.getElementById("productDetails");
const productSpecsEl = document.getElementById("productSpecs");
const buyNowBtn = document.getElementById("buyNowBtn");
const breadcrumbCategoryEl = document.getElementById("breadcrumbCategory");
const breadcrumbNameEl = document.getElementById("breadcrumbName");
const canonicalLink = document.getElementById("canonicalLink");
const metaDescription = document.getElementById("metaDescription");
const ogTitle = document.getElementById("ogTitle");
const ogDescription = document.getElementById("ogDescription");
const ogUrl = document.getElementById("ogUrl");
const ogImage = document.getElementById("ogImage");
const twitterTitle = document.getElementById("twitterTitle");
const twitterDescription = document.getElementById("twitterDescription");
const twitterImage = document.getElementById("twitterImage");
const productJsonLd = document.getElementById("productJsonLd");

let currentMediaList = [];
let currentMediaIndex = 0;
let pointerStartX = null;
let isPointerDown = false;
let activeProduct = null;
const AFFILIATE_SUB_ID = String(window.SEO_CONFIG?.affiliateSubId || "site_t1").trim() || "site_t1";

function formatVnd(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(Number(value) || 0);
}

function slugify(value) {
  return String(value || "")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createProductSlug(value) {
  const base = slugify(value).slice(0, 60).replace(/-+$/g, "");
  return base || "san-pham";
}

function getBasePathFromCurrentPage() {
  const noProductPage = location.pathname.replace(/\/product(?:\.html)?\/?$/i, "");
  const prettyMatch = noProductPage.match(/^(.*)\/san-pham\/[^/]+\/?$/i);
  const base = prettyMatch ? prettyMatch[1] : noProductPage;
  return base.replace(/\/$/, "");
}

function getProductsDataUrl() {
  const base = getBasePathFromCurrentPage();
  return `${base}/assets/data/products.json`;
}

function getProductsDataUrlCandidates() {
  const fromBase = getProductsDataUrl();
  const absolute = `${location.origin}/assets/data/products.json`;
  const relative = "assets/data/products.json";
  return [...new Set([fromBase, absolute, relative, ...REMOTE_PRODUCTS_FALLBACK_URLS])];
}

function buildPrettyProductPath(slug) {
  const safeSlug = createProductSlug(slug);
  const base = getBasePathFromCurrentPage();
  return `${base}/san-pham/${encodeURIComponent(safeSlug)}`;
}

function getSlugFromPath() {
  const match = location.pathname.match(/\/san-pham\/([^/?#]+)/i);
  if (!match) return "";
  return decodeURIComponent(match[1] || "")
    .replace(/\.html$/i, "")
    .trim();
}

function findProductByRoute(products, targetSlug = "", idFromQuery = "") {
  if (!Array.isArray(products) || !products.length) return null;
  const normalizedTargetSlug = createProductSlug(targetSlug);
  if (normalizedTargetSlug) {
    const exactBySlug = products.find((item) => item.slug === normalizedTargetSlug);
    if (exactBySlug) return exactBySlug;
  }
  if (idFromQuery) {
    const byId = products.find((item) => String(item.id) === String(idFromQuery));
    if (byId) return byId;
  }
  if (normalizedTargetSlug) {
    const fuzzyBySlug = products.find((item) => (
      item.slug.startsWith(normalizedTargetSlug) || normalizedTargetSlug.startsWith(item.slug)
    ));
    if (fuzzyBySlug) return fuzzyBySlug;
  }
  return null;
}

function estimateSold(id) {
  let hash = 0;
  const str = String(id || "mypham");
  for (let i = 0; i < str.length; i += 1) hash = (hash + str.charCodeAt(i) * (i + 3)) % 997;
  return (hash + 10).toLocaleString("vi-VN");
}

function withAffiliateTracking(url) {
  try {
    const parsed = new URL(String(url || ""), location.href);
    if (!parsed.searchParams.get("sub_id")) {
      parsed.searchParams.set("sub_id", AFFILIATE_SUB_ID);
    }
    return parsed.toString();
  } catch {
    return String(url || "");
  }
}

function trackAffiliateEvent(product = {}, source = "product_detail") {
  const payload = {
    event_category: "affiliate",
    event_label: String(product.name || product.id || "unknown"),
    source,
    product_id: String(product.id || ""),
    product_name: String(product.name || ""),
    sub_id: AFFILIATE_SUB_ID
  };
  if (typeof window.recordAffiliateClick === "function") {
    window.recordAffiliateClick({
      productId: payload.product_id,
      productName: payload.product_name,
      source,
      subId: AFFILIATE_SUB_ID,
      link: product.affiliateLink || ""
    });
  }
  if (typeof window.gtag === "function") {
    window.gtag("event", "affiliate_click", payload);
  }
}

function normalizeProduct(product) {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  if (!images.length) {
    images.push(product.image || FALLBACK_IMAGE);
  }

  const specs = Array.isArray(product.specs)
    ? product.specs.filter(Boolean)
    : String(product.specs || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  return {
    id: product.id || "",
    slug: createProductSlug(product.slug || product.name || product.id || "san-pham"),
    name: product.name || "Sản phẩm",
    images,
    videoUrl: product.videoUrl || product.video || "",
    currentPrice: Number(product.currentPrice) || 0,
    oldPrice: Number(product.oldPrice) || 0,
    discount: Number(product.discount) || 0,
    affiliateLink: product.affiliateLink || "#",
    category: product.category || "khac",
    description: product.description || "",
    details: product.details || product.longDescription || product.description || "",
    specs
  };
}

function getMediaList(product) {
  const media = (product.images || []).map((url) => ({ type: "image", url }));
  if (product.videoUrl) media.unshift({ type: "video", url: product.videoUrl });
  return media.length ? media : [{ type: "image", url: FALLBACK_IMAGE }];
}

function renderViewerByIndex(index) {
  const mediaItem = currentMediaList[index];
  if (!mediaItem) return;
  const imageSlot = document.getElementById("viewerImageSlot");
  const prev = document.getElementById("prevMediaBtn");
  const next = document.getElementById("nextMediaBtn");
  const showNav = currentMediaList.length > 1;
  if (prev) prev.classList.toggle("hidden", !showNav);
  if (next) next.classList.toggle("hidden", !showNav);

  const imgEl = document.getElementById("viewerImage");
  if (mediaItem.type === "video") {
    /* Hiển thị ảnh đầu tiên làm poster, chỉ phát video khi nhấn play */
    const posterOriginalUrl = activeProduct?.images?.[0] || FALLBACK_IMAGE;
    const posterProxied = proxyImageUrl(posterOriginalUrl, 0);

    /* Ẩn video element hoàn toàn */
    viewerVideo.pause();
    viewerVideo.src = "";
    viewerVideo.classList.add("hidden");

    /* Hiện ảnh poster thay thế */
    if (imageSlot) {
      imageSlot.classList.remove("hidden");
    }
    if (imgEl) {
      imgEl.alt = (activeProduct?.name || "Sản phẩm") + " - Video";
      imgEl.onerror = function () {
        this.onerror = function () {
          this.onerror = null;
          this.src = FALLBACK_IMAGE;
        };
        this.src = proxyImageUrl(posterOriginalUrl, 1);
      };
      imgEl.src = posterProxied;
    }

    /* Hiện nút play overlay */
    if (videoPlayOverlay) {
      videoPlayOverlay.classList.remove("hidden");
      videoPlayOverlay._pendingVideoUrl = mediaItem.url;
      videoPlayOverlay._posterUrl = posterOriginalUrl;
    }
    return;
  }

  /* === Hiện ảnh thường === */
  if (imageSlot) {
    imageSlot.classList.remove("hidden");
  }
  viewerVideo.pause();
  viewerVideo.src = "";
  viewerVideo.classList.add("hidden");
  videoPlayOverlay?.classList.add("hidden");

  const rawUrl = String(mediaItem.url || FALLBACK_IMAGE).trim();
  const altBase = activeProduct?.name || "Ảnh sản phẩm";
  const altText = `${altBase} - ảnh ${currentMediaIndex + 1}/${currentMediaList.length}`;
  if (imgEl) {
    imgEl.loading = currentMediaIndex === 0 ? "eager" : "lazy";
    applyImageWithFallback(imgEl, rawUrl, altText);
  }
}

function setActiveThumb(index) {
  const thumbs = document.getElementById("viewerThumbs");
  if (!thumbs) return;
  thumbs.querySelectorAll(".thumb-item").forEach((el, idx) => {
    el.classList.toggle("active", idx === index);
  });
}

function showMediaAt(index) {
  if (!currentMediaList.length) return;
  const normalizedIndex = (index + currentMediaList.length) % currentMediaList.length;
  if (normalizedIndex === currentMediaIndex) return;
  currentMediaIndex = normalizedIndex;
  renderViewerByIndex(normalizedIndex);
  setActiveThumb(normalizedIndex);
}

function showNextMedia() {
  showMediaAt(currentMediaIndex + 1);
}

function showPrevMedia() {
  showMediaAt(currentMediaIndex - 1);
}

function renderMediaGallery(product) {
  const mediaList = getMediaList(product);
  currentMediaList = mediaList;
  currentMediaIndex = 0;
  const thumbsEl = document.getElementById("viewerThumbs");
  if (!thumbsEl) return;
  thumbsEl.innerHTML = "";
  thumbsEl.classList.toggle("hidden", mediaList.length <= 1);
  renderViewerByIndex(0);

  mediaList.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "thumb-item";
    btn.dataset.index = String(index);
    if (index === 0) btn.classList.add("active");

    if (item.type === "video") {
      btn.classList.add("thumb-video");
      btn.innerHTML = `<span class="thumb-video-icon">▶</span><span class="thumb-video-text">Video</span>`;
    } else {
      const altThumb = `${activeProduct?.name || "Sản phẩm"} - ảnh ${index + 1}`;
      const thumbImg = document.createElement("img");
      thumbImg.alt = altThumb;
      thumbImg.loading = "lazy";
      thumbImg.decoding = "async";
      thumbImg.tabIndex = -1;
      applyImageWithFallback(thumbImg, item.url, altThumb);
      btn.appendChild(thumbImg);
    }

    btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      const btnEl = ev.currentTarget;
      const i = parseInt(btnEl.getAttribute("data-index"), 10);
      if (!Number.isNaN(i) && i >= 0 && i < mediaList.length) {
        showMediaAt(i);
      }
    });

    thumbsEl.appendChild(btn);
  });
}

function bindMediaNavigation() {
  const gallery = document.getElementById("productGallery");
  if (!gallery) return;
  gallery.addEventListener("click", function (e) {
    const btn = e.target.closest?.("button.viewer-nav");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if (btn.id === "prevMediaBtn") showPrevMedia();
    else if (btn.id === "nextMediaBtn") showNextMedia();
  });

  detailViewer?.addEventListener("mousedown", (event) => {
    isPointerDown = true;
    pointerStartX = event.clientX;
  });

  detailViewer?.addEventListener("mouseup", (event) => {
    if (!isPointerDown || pointerStartX === null) return;
    if (event.target.closest?.("button")) return;
    const delta = event.clientX - pointerStartX;
    if (Math.abs(delta) > 45) {
      if (delta < 0) showNextMedia();
      else showPrevMedia();
    }
    isPointerDown = false;
    pointerStartX = null;
  });

  detailViewer?.addEventListener("mouseleave", () => {
    isPointerDown = false;
    pointerStartX = null;
  });

  let touchStartTime = 0;
  let isSwiping = false;
  detailViewer?.addEventListener("touchstart", (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    pointerStartX = touch.clientX;
    touchStartTime = Date.now();
    isSwiping = false;
  }, { passive: true });

  detailViewer?.addEventListener("touchmove", (event) => {
    if (pointerStartX === null) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    const deltaX = Math.abs(touch.clientX - pointerStartX);
    const deltaY = Math.abs(touch.clientY - (event.touches?.[0]?.clientY || 0));
    if (deltaX > 10 && deltaX > deltaY * 1.5) {
      isSwiping = true;
      event.preventDefault();
    }
  }, { passive: false });

  detailViewer?.addEventListener("touchend", (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch || pointerStartX === null) return;
    const delta = touch.clientX - pointerStartX;
    const duration = Date.now() - touchStartTime;
    if (isSwiping && Math.abs(delta) > 45 && duration < 500) {
      if (delta < 0) showNextMedia();
      else showPrevMedia();
    }
    pointerStartX = null;
    touchStartTime = 0;
    isSwiping = false;
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") showNextMedia();
    if (event.key === "ArrowLeft") showPrevMedia();
  });

  videoPlayOverlay?.addEventListener("click", () => {
    const videoUrl = videoPlayOverlay._pendingVideoUrl;
    const posterOriginalUrl = videoPlayOverlay._posterUrl || "";
    if (!videoUrl) return;

    const imageSlot = document.getElementById("viewerImageSlot");
    const imgEl = document.getElementById("viewerImage");

    function fallbackToImage() {
      viewerVideo.pause();
      viewerVideo.src = "";
      viewerVideo.classList.add("hidden");
      if (imageSlot) {
        imageSlot.classList.remove("hidden");
      }
      if (imgEl) {
        const posterProxied = proxyImageUrl(posterOriginalUrl || FALLBACK_IMAGE, 0);
        imgEl.onerror = function () { this.onerror = null; this.src = FALLBACK_IMAGE; };
        imgEl.src = posterProxied;
      }
      videoPlayOverlay.classList.add("hidden");
    }

    /* Ẩn ảnh poster, hiện video */
    if (imageSlot) {
      imageSlot.classList.add("hidden");
    }
    viewerVideo.classList.remove("hidden");
    viewerVideo.muted = true;
    viewerVideo.loop = true;
    viewerVideo.playsInline = true;
    viewerVideo.setAttribute("playsinline", "");
    viewerVideo.setAttribute("muted", "");
    if (posterOriginalUrl) viewerVideo.poster = proxyImageUrl(posterOriginalUrl);
    viewerVideo.src = videoUrl;
    viewerVideo.load();
    viewerVideo.play()
      .then(() => videoPlayOverlay.classList.add("hidden"))
      .catch(() => fallbackToImage());

    viewerVideo.onerror = () => fallbackToImage();
  });
}

function updateSeo(product) {
  const title = `${product.name} | Mỹ Phẩm Thái Nguyên`;
  const shortPrice = formatVnd(product.currentPrice);
  const description = `${shortPrice} • Giảm ${Math.max(Number(product.discount) || 0, 0)}% • ${product.description || `Deal tốt cho ${product.name}`}`.trim();
  const image = product.images[0] || FALLBACK_IMAGE;
  const canonical = `${location.origin}${buildPrettyProductPath(product.slug)}`;

  document.title = title;
  metaDescription.setAttribute("content", description);
  canonicalLink.setAttribute("href", canonical);
  ogTitle?.setAttribute("content", title);
  ogDescription?.setAttribute("content", description);
  ogUrl?.setAttribute("content", canonical);
  ogImage.setAttribute("content", image);
  twitterTitle?.setAttribute("content", title);
  twitterDescription?.setAttribute("content", description);
  twitterImage?.setAttribute("content", image);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.details || product.description,
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      price: product.currentPrice,
      availability: "https://schema.org/InStock",
      url: canonical
    }
  };
  productJsonLd.textContent = JSON.stringify(ld, null, 2);
}

function initBottomNavActive() {
  const nav = document.querySelector(".bottom-nav");
  if (!nav) return;

  const links = [...nav.querySelectorAll("a")];
  const path = window.location.pathname.toLowerCase();
  const file = path.split("/").pop() || "index.html";
  const hash = (window.location.hash || "").replace("#", "").toLowerCase();

  links.forEach((link) => {
    link.classList.remove("active");
    const routeMap = String(link.dataset.route || "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const href = String(link.getAttribute("href") || "").toLowerCase();
    const hrefFile = href.split("#")[0] || "index.html";
    const hrefHash = href.includes("#") ? href.split("#")[1] : "";

    const isHomeRoot =
      (file === "" || file === "index.html") &&
      (hrefFile === "index.html" || hrefFile === "") &&
      !hrefHash;
    const isFileMatch = file === hrefFile;
    const isHashMatch = hash && hrefHash && hash === hrefHash;
    const isRouteMatch = routeMap.some((key) => file.includes(key) || hash.includes(key));

    if (isHomeRoot || isFileMatch || isHashMatch || isRouteMatch) {
      link.classList.add("active");
    }
  });

  if (!nav.querySelector("a.active") && links[0]) {
    links[0].classList.add("active");
  }
}

function renderProduct(product) {
  activeProduct = product;
  productNameEl.textContent = product.name;
  productCategoryEl.textContent = product.category;
  productCurrentPriceEl.textContent = formatVnd(product.currentPrice);
  productOldPriceEl.textContent = product.oldPrice ? formatVnd(product.oldPrice) : "";
  productDiscountEl.textContent = product.discount ? `-${product.discount}%` : "";
  productSoldEl.textContent = `Đã bán ${estimateSold(product.id)}`;
  productDescriptionEl.textContent = product.description || "Đang cập nhật mô tả ngắn.";
  productDetailsEl.textContent = product.details || product.description || "Đang cập nhật mô tả chi tiết.";

  productSpecsEl.innerHTML = "";
  const specs = product.specs.length
    ? product.specs
    : ["Chính hãng chọn lọc", "Hỗ trợ đổi trả theo chính sách shop", "Cập nhật thông tin liên tục"];
  specs.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    productSpecsEl.appendChild(li);
  });

  breadcrumbCategoryEl.textContent = product.category;
  breadcrumbNameEl.textContent = product.name;
  renderMediaGallery(product);
  updateSeo(product);
  buyNowBtn.classList.remove("hidden");

  buyNowBtn.addEventListener("click", () => {
    const tracked = withAffiliateTracking(product.affiliateLink);
    if (!tracked) return;
    trackAffiliateEvent(product, "product_detail");
    window.open(tracked, "_blank", "noopener");
  });
}

function renderNotFound() {
  productNameEl.textContent = "Không tìm thấy sản phẩm";
  productDescriptionEl.textContent = "Sản phẩm không tồn tại hoặc đã bị xóa.";
  productDetailsEl.textContent = "Vui lòng quay lại trang chủ để chọn sản phẩm khác.";
  buyNowBtn.classList.add("hidden");
  const thumbs = document.getElementById("viewerThumbs");
  if (thumbs) thumbs.innerHTML = "";
  currentMediaList = [];
  const slot = document.getElementById("viewerImageSlot");
  const imgEl = document.getElementById("viewerImage");
  const prev = document.getElementById("prevMediaBtn");
  const next = document.getElementById("nextMediaBtn");
  if (slot) slot.classList.remove("hidden");
  if (imgEl) { imgEl.src = FALLBACK_IMAGE; imgEl.alt = "Không tìm thấy"; }
  if (prev) prev.classList.add("hidden");
  if (next) next.classList.add("hidden");
  viewerVideo.classList.add("hidden");
  viewerVideo.src = "";
  if (videoPlayOverlay) videoPlayOverlay.classList.add("hidden");
}

async function loadProducts() {
  let localProducts = [];
  const localData = localStorage.getItem(STORAGE_KEY);
  if (localData !== null) {
    try {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed)) {
        localProducts = parsed.map(normalizeProduct);
      }
    } catch {
      // ignore malformed local cache
    }
  }
  try {
    const candidates = getProductsDataUrlCandidates();
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        const data = await res.json();
        if (Array.isArray(data)) return data.map(normalizeProduct);
      } catch {
        // try next candidate URL
      }
    }
    throw new Error("Cannot fetch products data from all candidates.");
  } catch {
    return localProducts;
  }
}

async function init() {
  initBottomNavActive();
  bindMediaNavigation();
  const params = new URLSearchParams(location.search);
  const slugFromPath = createProductSlug(getSlugFromPath());
  const slugFromQuery = createProductSlug(params.get("slug") || "");
  const idFromQuery = params.get("id");
  const targetSlug = slugFromPath || slugFromQuery;
  if (!targetSlug && !idFromQuery) {
    renderNotFound();
    return;
  }

  try {
    const products = await loadProducts();
    const product = findProductByRoute(products, targetSlug, idFromQuery);
    if (!product) {
      renderNotFound();
      return;
    }
    const prettyPath = buildPrettyProductPath(product.slug);
    if (location.pathname !== prettyPath || location.search) {
      history.replaceState(null, "", prettyPath);
    }
    renderProduct(product);
  } catch (error) {
    console.error("Khong the tai du lieu san pham:", error);
    renderNotFound();
  }
}

init();
