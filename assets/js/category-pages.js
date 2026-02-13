const STORAGE_KEY = "mypham_products";
const BASE_PREFIX = /\/san-pham\/[^/]+\.html$/i.test(location.pathname) ? "../" : "";
const DATA_URL = `${BASE_PREFIX}assets/data/products.json`;
const REMOTE_PRODUCTS_FALLBACK_URLS = [
  String(window.SEO_CONFIG?.githubRawProductsUrl || "").trim(),
  "https://raw.githubusercontent.com/thaonguyenngu999-ui/myphamthainguyen/main/assets/data/products.json",
  "https://cdn.jsdelivr.net/gh/thaonguyenngu999-ui/myphamthainguyen@main/assets/data/products.json"
].filter(Boolean);
const FALLBACK_IMAGE = "https://placehold.co/600x600?text=My+Pham";
const PAGE_SIZE = 20;

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const catalogGrid = document.getElementById("catalogGrid");
const catalogEmpty = document.getElementById("catalogEmpty");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const priceFilter = document.getElementById("priceFilter");
const brandFilter = document.getElementById("brandFilter");
const resultCount = document.getElementById("resultCount");
const breadcrumbParent = document.getElementById("breadcrumbParent");
const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");
const catalogLead = document.getElementById("catalogLead");
const canonicalLink = document.getElementById("canonicalLink");
const catalogJsonLd = document.getElementById("catalogJsonLd");
const accordionRoot = document.getElementById("categoryAccordion");

let allProducts = [];
let filteredProducts = [];
let renderedCount = 0;
let selectedPriceRange = "all";
let selectedBrand = "all";
const AFFILIATE_SUB_ID = String(window.SEO_CONFIG?.affiliateSubId || "site_t1").trim() || "site_t1";

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

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean);
  return String(tags || "")
    .split(/\r?\n|,/g)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeProduct(product) {
  const LEGACY_SUBCATEGORY_LABELS = {
    "chong-nang": "Chống nắng",
    "kem-duong": "Kem dưỡng",
    "mat-na": "Mặt nạ",
    serum: "Serum",
    "son-moi": "Son môi",
    "tay-trang": "Tẩy trang",
    "rua-mat": "Rửa mặt",
    toner: "Toner - xịt khoáng",
    mascara: "Mascara",
    "phan-nen": "Phấn nền",
    "goi-xa": "Gội xả",
    "duong-toc": "Dưỡng tóc",
    "sua-tam": "Sữa tắm",
    "duong-the": "Dưỡng thể"
  };
  const LEGACY_CATEGORY_GROUPS = {
    "chong-nang": "Chăm sóc da",
    "kem-duong": "Chăm sóc da",
    "mat-na": "Chăm sóc da",
    serum: "Chăm sóc da",
    "tay-trang": "Chăm sóc da",
    "rua-mat": "Chăm sóc da",
    toner: "Chăm sóc da",
    "son-moi": "Trang điểm",
    mascara: "Trang điểm",
    "phan-nen": "Trang điểm",
    "goi-xa": "Chăm sóc tóc",
    "duong-toc": "Chăm sóc tóc",
    "sua-tam": "Cơ thể",
    "duong-the": "Cơ thể"
  };
  const rawCategory = String(product.category || "").trim();
  const rawSubCategory = String(product.subCategory || "").trim();
  const legacyKey = slugify(rawCategory);
  const inferredSubCategory =
    rawSubCategory || LEGACY_SUBCATEGORY_LABELS[legacyKey] || rawCategory || "Khác";
  const inferredCategory =
    rawCategory && !LEGACY_SUBCATEGORY_LABELS[legacyKey]
      ? rawCategory
      : LEGACY_CATEGORY_GROUPS[legacyKey] || "Sản phẩm";

  return {
    id: product.id || "",
    slug: createProductSlug(product.slug || product.name || product.id || "san-pham"),
    name: product.name || "Sản phẩm",
    image: product.image || FALLBACK_IMAGE,
    currentPrice: Number(product.currentPrice) || 0,
    oldPrice: Number(product.oldPrice) || 0,
    discount: Number(product.discount) || 0,
    affiliateLink: product.affiliateLink || "#",
    category: inferredCategory,
    subCategory: inferredSubCategory,
    categorySlug: slugify(inferredCategory || "san-pham"),
    subCategorySlug: slugify(inferredSubCategory || "khac"),
    brand: extractBrand(product.name, product.brand),
    brandSlug: slugify(extractBrand(product.name, product.brand)),
    tags: normalizeTags(product.tags),
    description: product.description || ""
  };
}

function isUsableProduct(item) {
  return Boolean(
    item &&
      String(item.name || "").trim() &&
      String(item.affiliateLink || "").trim()
  );
}

function formatVnd(value) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value) || 0);
}

function extractBrand(name, explicitBrand = "") {
  if (String(explicitBrand || "").trim()) return String(explicitBrand).trim();
  const clean = String(name || "").replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
  const tokens = clean.split(/\s+/).filter(Boolean);
  if (!tokens.length) return "Khác";
  const first = tokens[0];
  return first.length <= 2 && tokens[1] ? `${first} ${tokens[1]}` : first;
}

function buildProductDetailUrl(product) {
  const slug = createProductSlug(product?.slug || product?.name || product?.id || "");
  return `${BASE_PREFIX}product?slug=${encodeURIComponent(slug)}`;
}

function buildPageHref(page) {
  return `${BASE_PREFIX}${page}`;
}

function buildAbsolutePageUrl(page) {
  return new URL(buildPageHref(page), location.href).href;
}

const SEO_SUBCATEGORY_PAGES = {
  "kem-chong-nang": "san-pham/chong-nang.html",
  "chong-nang": "san-pham/chong-nang.html"
};

function buildSubCategoryHref(categorySlug, subSlug) {
  const seoPage = SEO_SUBCATEGORY_PAGES[subSlug];
  if (seoPage) return buildPageHref(seoPage);
  return `${buildPageHref("san-pham.html")}?category=${encodeURIComponent(categorySlug)}&subCategory=${encodeURIComponent(subSlug)}`;
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

function trackAffiliateEvent(item = {}, source = "catalog") {
  const payload = {
    event_category: "affiliate",
    event_label: String(item.name || item.id || "unknown"),
    source,
    product_id: String(item.id || ""),
    product_name: String(item.name || ""),
    sub_id: AFFILIATE_SUB_ID
  };
  if (typeof window.recordAffiliateClick === "function") {
    window.recordAffiliateClick({
      productId: payload.product_id,
      productName: payload.product_name,
      source,
      subId: AFFILIATE_SUB_ID,
      link: item.affiliateLink || ""
    });
  }
  if (typeof window.gtag === "function") {
    window.gtag("event", "affiliate_click", payload);
  }
}

function getSlugFromPath() {
  const match = location.pathname.match(/\/san-pham\/([^/]+)\.html$/i);
  if (!match) return "";
  const fileSlug = slugify(match[1]);
  if (!fileSlug || fileSlug === "index" || fileSlug === "san-pham") return "";
  return fileSlug;
}

function resolveSubCategorySlug(rawSlug) {
  const slug = slugify(rawSlug);
  if (!slug) return "";
  const aliases = {
    "chong-nang": "kem-chong-nang",
    "goi-xa": "dau-goi",
    "son-moi": "son-mau"
  };
  return aliases[slug] || slug;
}

function getPageType() {
  return document.body.dataset.pageType === "sale" ? "sale" : "san-pham";
}

async function loadProducts() {
  let localProducts = [];
  const localData = localStorage.getItem(STORAGE_KEY);
  if (localData !== null) {
    try {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed)) {
        localProducts = parsed.map(normalizeProduct).filter(isUsableProduct);
      }
    } catch {
      // ignore malformed local cache
    }
  }
  try {
    const candidates = [...new Set([DATA_URL, "/assets/data/products.json", ...REMOTE_PRODUCTS_FALLBACK_URLS])];
    for (const url of candidates) {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) continue;
        const data = await response.json();
        if (Array.isArray(data)) {
          return data.map(normalizeProduct).filter(isUsableProduct);
        }
      } catch {
        // try next source
      }
    }
    throw new Error("Cannot fetch products data.");
  } catch {
    return localProducts;
  }
}

function getFiltersFromUrl() {
  const params = new URLSearchParams(location.search);
  const subFromPath = getSlugFromPath();
  const querySub = params.get("subCategory") || "";
  return {
    category: params.get("category") || "",
    subCategory: resolveSubCategorySlug(querySub || subFromPath),
    keyword: params.get("q") || ""
  };
}

function applyFilter(keyword = "") {
  const pageType = getPageType();
  const { category, subCategory } = getFiltersFromUrl();
  const catSlug = slugify(category);
  const subSlug = slugify(subCategory);
  const text = String(keyword || "").trim().toLowerCase();

  filteredProducts = allProducts
    .filter((item) => {
      if (pageType === "sale" && !(item.discount > 0 || item.tags.includes("sale"))) return false;
      if (catSlug && item.categorySlug !== catSlug) return false;
      if (subSlug && item.subCategorySlug !== subSlug) return false;
      if (selectedBrand !== "all" && item.brandSlug !== selectedBrand) return false;
      if (selectedPriceRange === "under-200" && item.currentPrice >= 200000) return false;
      if (selectedPriceRange === "200-500" && (item.currentPrice < 200000 || item.currentPrice > 500000)) return false;
      if (selectedPriceRange === "over-500" && item.currentPrice <= 500000) return false;
      if (text) {
        const searchable = `${item.name} ${item.category} ${item.subCategory} ${item.brand}`.toLowerCase();
        if (!searchable.includes(text)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (getPageType() === "sale" && b.discount !== a.discount) return b.discount - a.discount;
      if (a.category !== b.category) return a.category.localeCompare(b.category, "vi");
      return a.name.localeCompare(b.name, "vi");
    });
}

function renderCards(reset = false) {
  if (reset) {
    renderedCount = 0;
    catalogGrid.innerHTML = "";
  }

  const chunk = filteredProducts.slice(renderedCount, renderedCount + PAGE_SIZE);
  const html = chunk
    .map((item) => {
      const discountBadge = item.discount > 0 ? `<span class="discount-badge">-${item.discount}%</span>` : "";
      return `
        <article class="product-card" data-id="${item.id}">
          <a class="product-link" href="${buildProductDetailUrl(item)}" target="_blank" rel="noopener">
            <div class="product-image-wrap">
              <img class="product-image" src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" />
              ${discountBadge}
            </div>
          </a>
          <div class="product-body">
            <a class="product-link" href="${buildProductDetailUrl(item)}" target="_blank" rel="noopener">
              <h3 class="product-name">${item.name}</h3>
            </a>
            <div class="price-row">
              <span class="current-price">${formatVnd(item.currentPrice)}</span>
              <span class="old-price">${formatVnd(item.oldPrice)}</span>
            </div>
            <div class="meta-row">
              <span class="category-pill">${item.category} • ${item.subCategory}</span>
            </div>
            <button class="btn-primary buy-now" type="button" data-link="${item.affiliateLink}" data-id="${item.id}" data-name="${item.name.replaceAll('"', "&quot;")}">Mua ngay</button>
          </div>
        </article>
      `;
    })
    .join("");

  catalogGrid.insertAdjacentHTML("beforeend", html);
  renderedCount += chunk.length;

  const isEmpty = !filteredProducts.length;
  catalogEmpty.classList.toggle("hidden", !isEmpty);
  if (resultCount) {
    resultCount.textContent = `Đang hiển thị ${filteredProducts.length} sản phẩm`;
  }
  loadMoreBtn.classList.toggle("hidden", renderedCount >= filteredProducts.length || isEmpty);
}

function initExtraFilters() {
  if (!brandFilter || !priceFilter) return;
  const brandMap = new Map();
  allProducts.forEach((item) => {
    if (!item.brandSlug) return;
    if (!brandMap.has(item.brandSlug)) brandMap.set(item.brandSlug, item.brand);
  });

  const options = [...brandMap.entries()].sort((a, b) => a[1].localeCompare(b[1], "vi"));
  brandFilter.innerHTML = '<option value="all">Tất cả thương hiệu</option>';
  options.forEach(([slug, label]) => {
    const option = document.createElement("option");
    option.value = slug;
    option.textContent = label;
    brandFilter.appendChild(option);
  });
}

function getDisplayLabelForSlug(type, rawValue) {
  const slug = slugify(rawValue);
  if (!slug) return "";
  const found = allProducts.find((item) =>
    type === "category" ? item.categorySlug === slug : item.subCategorySlug === slug
  );
  if (found) return type === "category" ? found.category : found.subCategory;
  return String(rawValue || "").replaceAll("-", " ");
}

function updatePageSeo() {
  const pageType = getPageType();
  const { category, subCategory } = getFiltersFromUrl();
  const categoryLabel = getDisplayLabelForSlug("category", category);
  const subLabel = getDisplayLabelForSlug("sub", subCategory);
  const suffix = [categoryLabel, subLabel].filter(Boolean).join(" - ");
  const baseTitle = pageType === "sale"
    ? "Sale Mỹ Phẩm Thái Nguyên - Giảm giá hấp dẫn"
    : "Sản phẩm Mỹ Phẩm Thái Nguyên";
  const title = suffix ? `${baseTitle} | ${suffix}` : baseTitle;
  document.title = title;
  if (breadcrumbParent) breadcrumbParent.textContent = pageType === "sale" ? "Sale" : "Sản phẩm";
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = suffix || "Tất cả";
  catalogLead.textContent = suffix
    ? `Đang lọc theo: ${suffix}. Có ${filteredProducts.length} sản phẩm phù hợp.`
    : pageType === "sale"
      ? "Sản phẩm giảm giá theo mức discount cao nhất, ưu tiên tag sale/hot."
      : "Danh sách sản phẩm được nhóm theo danh mục và danh mục con.";

  canonicalLink.href = `${location.origin}${location.pathname}${location.search}`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute(
      "content",
      suffix
        ? `${baseTitle} - Bộ lọc ${suffix}. Tổng hợp sản phẩm chính hãng, cập nhật liên tục tại Mỹ Phẩm Thái Nguyên.`
        : `${baseTitle}. Danh mục được cập nhật liên tục, dễ tìm kiếm theo nhu cầu và mức giá.`
    );
  }

  const breadcrumbElements = [
    { name: "Trang chủ", item: buildAbsolutePageUrl("index.html") },
    { name: pageType === "sale" ? "Sale" : "Sản phẩm", item: buildAbsolutePageUrl(pageType === "sale" ? "sale.html" : "san-pham.html") }
  ];
  if (suffix) breadcrumbElements.push({ name: suffix, item: `${location.origin}${location.pathname}${location.search}` });

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbElements.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.item
        }))
      },
      {
        "@type": "ItemList",
        name: title,
        itemListElement: filteredProducts.slice(0, 20).map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: item.name,
            image: item.image,
            brand: item.brand,
            category: `${item.category} > ${item.subCategory}`,
            offers: {
              "@type": "Offer",
              priceCurrency: "VND",
              price: item.currentPrice,
              availability: "https://schema.org/InStock",
              url: item.affiliateLink
            }
          }
        }))
      }
    ]
  };
  catalogJsonLd.textContent = JSON.stringify(ld, null, 2);
}

function initBottomNavActive() {
  const nav = document.querySelector(".bottom-nav");
  if (!nav) return;
  const links = [...nav.querySelectorAll("a")];
  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  links.forEach((link) => {
    const href = String(link.getAttribute("href") || "").toLowerCase();
    const hrefFile = (href.split("#")[0].split("/").pop() || "index.html").toLowerCase();
    link.classList.toggle("active", file === hrefFile || (file === "" && hrefFile === "index.html"));
  });
}

function initSidebarAccordion() {
  const sidebar = document.getElementById("categorySidebar");
  const backdrop = document.getElementById("categoryBackdrop");
  const openBtn = document.getElementById("openCategoryDrawer");
  const closeBtn = document.getElementById("closeCategoryDrawer");
  const bottomMenuBtn = document.querySelector('.bottom-nav a[data-open-category="1"]');
  if (!sidebar || !accordionRoot) return;
  const iconMap = {
    "cham-soc-da": "spa",
    "trang-diem": "brush",
    "cham-soc-toc": "content_cut",
    "co-the": "self_improvement",
    "nganh-khac": "category",
    "bo-san-pham": "inventory_2",
    "tay-trang": "cleaning_services",
    "rua-mat": "water_drop",
    "toner-xit-khoang": "opacity",
    serum: "science",
    "kem-duong": "spa",
    "kem-chong-nang": "wb_sunny",
    "mat-na": "face",
    "son-moi": "favorite"
  };

  const pageType = getPageType();
  const grouped = new Map();
  allProducts.forEach((item) => {
    const catSlug = item.categorySlug || slugify(item.category);
    if (!grouped.has(catSlug)) {
      grouped.set(catSlug, { label: item.category, slug: catSlug, subs: new Map() });
    }
    const cat = grouped.get(catSlug);
    if (!cat.subs.has(item.subCategorySlug)) {
      cat.subs.set(item.subCategorySlug, { label: item.subCategory, slug: item.subCategorySlug });
    }
  });

  const orderedCats = [...grouped.values()].sort((a, b) => a.label.localeCompare(b.label, "vi"));
  const sectionsHtml = orderedCats
    .map((cat, index) => {
      const sectionId = `cat-${cat.slug}`;
      const subItems = [...cat.subs.values()]
        .sort((a, b) => a.label.localeCompare(b.label, "vi"))
        .map((sub) => `
          <li>
            <a class="cat-sub-item" href="${buildSubCategoryHref(cat.slug, sub.slug)}">
              <span class="cat-sub-item-left">
                <span class="material-icons" aria-hidden="true">${iconMap[sub.slug] || "folder"}</span>
                <span>${sub.label}</span>
              </span>
              <span class="material-icons cat-sub-item-arrow" aria-hidden="true">chevron_right</span>
            </a>
          </li>
        `)
        .join("");
      return `
        <li class="cat-group ${index === 0 ? "active" : ""}">
          <button class="cat-parent-btn cat-parent-btn--sub" type="button" aria-expanded="${index === 0}" aria-controls="${sectionId}">
            <span class="cat-parent-btn__left">
              <span class="material-icons" aria-hidden="true">${iconMap[cat.slug] || "folder_open"}</span>
              <span>${cat.label}</span>
            </span>
            <span class="material-icons cat-arrow" aria-hidden="true">chevron_right</span>
          </button>
          <ul id="${sectionId}" class="cat-sub-list ${index === 0 ? "is-open" : ""}">
            ${subItems}
          </ul>
        </li>
      `;
    })
    .join("");

  accordionRoot.innerHTML = `
    <li>
      <a href="${buildPageHref("sale.html")}" class="cat-action cat-action--sale">
        <span class="cat-badge">Hot</span>
        <span class="material-icons" aria-hidden="true">local_fire_department</span>
        <span>Hot Sale</span>
        <span class="material-icons cat-action__arrow" aria-hidden="true">chevron_right</span>
      </a>
    </li>
    <li class="cat-group active">
      <button class="cat-parent-btn" type="button" aria-expanded="true" aria-controls="cat-main">
        <span class="cat-parent-btn__left">
          <span class="material-icons" aria-hidden="true">${pageType === "sale" ? "local_fire_department" : "spa"}</span>
          <span>${pageType === "sale" ? "Sale theo danh mục" : "Sản phẩm"}</span>
        </span>
        <span class="material-icons cat-arrow" aria-hidden="true">chevron_right</span>
      </button>
      <ul id="cat-main" class="cat-sub-list is-open">
        ${sectionsHtml}
      </ul>
    </li>
  `;

  const setState = (group, expanded) => {
    const btn = group.querySelector(":scope > .cat-parent-btn");
    const sub = group.querySelector(":scope > .cat-sub-list");
    if (!btn || !sub) return;
    btn.setAttribute("aria-expanded", String(expanded));
    group.classList.toggle("active", expanded);
    sub.classList.toggle("is-open", expanded);
    sub.style.maxHeight = expanded ? `${sub.scrollHeight}px` : "0px";
  };

  const groups = [...sidebar.querySelectorAll(".cat-group")];
  groups.forEach((group) => {
    const btn = group.querySelector(":scope > .cat-parent-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const parent = group.parentElement;
      parent && [...parent.children].forEach((item) => {
        if (item !== group && item.classList.contains("cat-group")) setState(item, false);
      });
      setState(group, !expanded);
    });
  });

  const openDrawer = () => {
    sidebar.classList.add("is-open");
    backdrop?.removeAttribute("hidden");
    openBtn?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };
  const closeDrawer = () => {
    sidebar.classList.remove("is-open");
    backdrop?.setAttribute("hidden", "");
    openBtn?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  openBtn?.addEventListener("click", openDrawer);
  bottomMenuBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    openDrawer();
  });
  closeBtn?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.classList.contains("is-open")) closeDrawer();
  });
}

function syncSearchToUrl() {
  const url = new URL(location.href);
  const keyword = String(searchInput.value || "").trim();
  if (keyword) url.searchParams.set("q", keyword);
  else url.searchParams.delete("q");
  history.replaceState(null, "", `${url.pathname}${url.search}`);
}

function bindEvents() {
  catalogGrid.addEventListener("click", (event) => {
    const buyBtn = event.target.closest(".buy-now");
    if (!buyBtn) return;
    const link = withAffiliateTracking(String(buyBtn.dataset.link || ""));
    if (!link) return;
    const item = {
      id: buyBtn.dataset.id || "",
      name: buyBtn.dataset.name || "",
      affiliateLink: String(buyBtn.dataset.link || "")
    };
    trackAffiliateEvent(item, getPageType() === "sale" ? "sale_page" : "catalog_page");
    window.open(link, "_blank", "noopener");
  });
  loadMoreBtn.addEventListener("click", () => renderCards(false));
  searchInput.addEventListener("input", () => {
    syncSearchToUrl();
    applyFilter(searchInput.value);
    renderCards(true);
    updatePageSeo();
  });
  searchBtn.addEventListener("click", () => {
    syncSearchToUrl();
    applyFilter(searchInput.value);
    renderCards(true);
    updatePageSeo();
  });
  priceFilter?.addEventListener("change", () => {
    selectedPriceRange = priceFilter.value || "all";
    applyFilter(searchInput.value);
    renderCards(true);
    updatePageSeo();
  });
  brandFilter?.addEventListener("change", () => {
    selectedBrand = brandFilter.value || "all";
    applyFilter(searchInput.value);
    renderCards(true);
    updatePageSeo();
  });
}

async function init() {
  allProducts = await loadProducts();
  initExtraFilters();
  const { keyword } = getFiltersFromUrl();
  searchInput.value = keyword;
  applyFilter(keyword);
  renderCards(true);
  updatePageSeo();
  initBottomNavActive();
  initSidebarAccordion();
  bindEvents();
}

init().catch((error) => {
  console.error("Không thể tải trang danh mục:", error);
  catalogEmpty.classList.remove("hidden");
  catalogEmpty.textContent = "Có lỗi khi tải dữ liệu sản phẩm.";
});
