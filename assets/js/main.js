const STORAGE_KEY = "mypham_products";
const DATA_URL = "assets/data/products.json";
const FALLBACK_IMAGE = "https://placehold.co/600x600?text=My+Pham";
const BLOG_STORAGE_KEY = "mypham_blog_content";
const BLOG_DATA_URL = "assets/data/blogs.json";

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const adminEntry = document.getElementById("adminEntry");
const quickTags = document.getElementById("quickTags");
const searchBtn = document.getElementById("searchBtn");
const categorySections = document.getElementById("categorySections");
const searchResultSection = document.getElementById("searchResultSection");
const hotDealGrid = document.getElementById("hotDealGrid");
const promoTrack = document.getElementById("promoTrack");
const promoDots = document.getElementById("promoDots");
const promoPrevBtn = document.getElementById("promoPrevBtn");
const promoNextBtn = document.getElementById("promoNextBtn");
const blogGrid = document.getElementById("blogGrid");
const faqList = document.getElementById("faqList");
const blogFaqJsonLd = document.getElementById("blogFaqJsonLd");

const modal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalViewerImage = document.getElementById("modalViewerImage");
const modalViewerVideo = document.getElementById("modalViewerVideo");
const modalThumbs = document.getElementById("modalThumbs");
const modalName = document.getElementById("modalName");
const modalDescription = document.getElementById("modalDescription");
const modalCurrentPrice = document.getElementById("modalCurrentPrice");
const modalOldPrice = document.getElementById("modalOldPrice");
const modalDiscount = document.getElementById("modalDiscount");
const modalCategory = document.getElementById("modalCategory");
const modalSold = document.getElementById("modalSold");
const modalDetails = document.getElementById("modalDetails");
const modalSpecs = document.getElementById("modalSpecs");
const modalBuyBtn = document.getElementById("modalBuyBtn");
const modalMoreBtn = document.getElementById("modalMoreBtn");
const modalVideoPlayOverlay = document.getElementById("modalVideoPlayOverlay");

const loadingOverlay = document.getElementById("loadingOverlay");

let allProducts = [];
let filteredProducts = [];
let selectedCategory = "all";
let searchTimer = null;
let activeModalProduct = null;
let promoSlides = [];
let promoIndex = 0;
let promoTimer = null;
let blogContent = { posts: [], faqs: [] };
const AFFILIATE_SUB_ID = String(window.SEO_CONFIG?.affiliateSubId || "site_t1").trim() || "site_t1";

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `p_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
}

const FALLBACK_PRODUCTS = [
  {
    id: "fb001",
    name: "Son lì Velvet Mood 3.5g",
    image: "https://picsum.photos/seed/mypham-fb001/600/600",
    currentPrice: 129000,
    oldPrice: 229000,
    discount: 44,
    affiliateLink: "https://shope.ee/fallback001",
    category: "son-moi",
    description: "Son lì mềm mịn, màu dễ dùng mỗi ngày."
  },
  {
    id: "fb002",
    name: "Kem dưỡng ẩm phục hồi Ceramide 50ml",
    image: "https://picsum.photos/seed/mypham-fb002/600/600",
    currentPrice: 199000,
    oldPrice: 329000,
    discount: 40,
    affiliateLink: "https://shope.ee/fallback002",
    category: "kem-duong",
    description: "Giữ ẩm tốt, dịu da và phục hồi hàng rào bảo vệ."
  },
  {
    id: "fb003",
    name: "Mặt nạ giấy cấp ẩm sâu 10 miếng",
    image: "https://picsum.photos/seed/mypham-fb003/600/600",
    currentPrice: 149000,
    oldPrice: 249000,
    discount: 40,
    affiliateLink: "https://shope.ee/fallback003",
    category: "mat-na",
    description: "Cấp nước nhanh, giúp da mềm mượt ngay sau khi đắp."
  },
  {
    id: "fb004",
    name: "Serum sáng da Vitamin C 30ml",
    image: "https://picsum.photos/seed/mypham-fb004/600/600",
    currentPrice: 259000,
    oldPrice: 389000,
    discount: 33,
    affiliateLink: "https://shope.ee/fallback004",
    category: "serum",
    description: "Hỗ trợ đều màu da, cải thiện thâm xỉn."
  },
  {
    id: "fb005",
    name: "Nước tẩy trang dịu nhẹ 400ml",
    image: "https://picsum.photos/seed/mypham-fb005/600/600",
    currentPrice: 109000,
    oldPrice: 179000,
    discount: 39,
    affiliateLink: "https://shope.ee/fallback005",
    category: "tay-trang",
    description: "Làm sạch bụi bẩn hằng ngày, không khô rát."
  },
  {
    id: "fb006",
    name: "Kem chống nắng SPF50+ PA++++",
    image: "https://picsum.photos/seed/mypham-fb006/600/600",
    currentPrice: 179000,
    oldPrice: 299000,
    discount: 40,
    affiliateLink: "https://shope.ee/fallback006",
    category: "chong-nang",
    description: "Bảo vệ da tốt dưới nắng, không bết dính."
  }
];

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

function formatVnd(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(Number(value) || 0);
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean);
  }
  return String(tags || "")
    .split(/\r?\n|,/g)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeBlogPost(post, index = 0) {
  const id = String(post.id || `blog_${index + 1}`).trim();
  return {
    id,
    title: String(post.title || "Bài viết mới").trim(),
    summary: String(post.summary || "").trim(),
    url: String(post.url || "index.html").trim(),
    tag: String(post.tag || "Review").trim(),
    ctaText: String(post.ctaText || "Xem thêm").trim()
  };
}

function normalizeFaqItem(item, index = 0) {
  const id = String(item.id || `faq_${index + 1}`).trim();
  return {
    id,
    question: String(item.question || "Câu hỏi").trim(),
    answer: String(item.answer || "").trim()
  };
}

function normalizeBlogContent(raw) {
  const posts = Array.isArray(raw?.posts) ? raw.posts.map(normalizeBlogPost).filter((item) => item.title && item.url) : [];
  const faqs = Array.isArray(raw?.faqs) ? raw.faqs.map(normalizeFaqItem).filter((item) => item.question && item.answer) : [];
  return { posts, faqs };
}

function normalizeProduct(product) {
  const rawImage = product.image || "";
  const migratedImage = rawImage.includes("cf.shopee.vn/file/")
    ? `https://picsum.photos/seed/${encodeURIComponent(product.id || product.name || "mypham")}/600/600`
    : rawImage;

  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : [];
  if (!images.length) {
    images.push(migratedImage || FALLBACK_IMAGE);
  }

  const specs = Array.isArray(product.specs)
    ? product.specs.filter(Boolean)
    : String(product.specs || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  const rawCategory = String(product.category || "").trim();
  const rawSubCategory = String(product.subCategory || "").trim();
  const legacyCategoryKey = slugify(rawCategory);
  const inferredSubCategory =
    rawSubCategory ||
    LEGACY_SUBCATEGORY_LABELS[legacyCategoryKey] ||
    rawCategory ||
    "Khác";
  const inferredCategory =
    rawCategory && !LEGACY_SUBCATEGORY_LABELS[legacyCategoryKey]
      ? rawCategory
      : LEGACY_CATEGORY_GROUPS[legacyCategoryKey] || "Sản phẩm";

  return {
    id: product.id || makeId(),
    name: product.name || "Sản phẩm",
    image: images[0] || FALLBACK_IMAGE,
    images,
    videoUrl: product.videoUrl || product.video || "",
    currentPrice: Number(product.currentPrice) || 0,
    oldPrice: Number(product.oldPrice) || 0,
    discount: Number(product.discount) || 0,
    affiliateLink: product.affiliateLink || "#",
    category: inferredCategory,
    subCategory: inferredSubCategory,
    categorySlug: slugify(inferredCategory || "san-pham"),
    subCategorySlug: slugify(inferredSubCategory || "khac"),
    tags: normalizeTags(product.tags),
    description: product.description || "",
    details: product.details || product.longDescription || product.description || "",
    specs
  };
}

function isUsableProduct(item) {
  return Boolean(
    item &&
      String(item.name || "").trim() &&
      (String(item.image || "").trim() || (Array.isArray(item.images) && item.images.length)) &&
      String(item.affiliateLink || "").trim()
  );
}

function sortByBestDeal(products) {
  return [...products].sort((a, b) => {
    if (b.discount !== a.discount) return b.discount - a.discount;
    return a.currentPrice - b.currentPrice;
  });
}

function buildProductCardHtml(product, extraClass = "") {
  return `
    <article class="product-card ${extraClass}" data-id="${product.id}">
      <a class="product-link" href="${buildProductDetailUrl(product.id)}" target="_blank" rel="noopener">
        <div class="product-image-wrap" data-image-click="1">
          <img
            class="product-image"
            src="${product.images[0] || product.image}"
            alt="${product.name}"
            loading="lazy"
            decoding="async"
            onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"
          />
          <span class="discount-badge">-${product.discount}%</span>
        </div>
      </a>
      <div class="product-body">
        <a class="product-link" href="${buildProductDetailUrl(product.id)}" target="_blank" rel="noopener">
          <h3 class="product-name">${product.name}</h3>
        </a>
        <div class="price-row">
          <span class="current-price">${formatVnd(product.currentPrice)}</span>
          <span class="old-price">${formatVnd(product.oldPrice)}</span>
        </div>
        <div class="meta-row">
          <span class="category-pill">${product.subCategory || product.category}</span>
          <span class="sold-text">Đã bán ${estimateSold(product.id)}</span>
        </div>
        <button class="btn-primary buy-now" type="button">Mua ngay</button>
      </div>
    </article>
  `;
}

function renderProducts(products) {
  productGrid.innerHTML = "";

  if (!products.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  const html = products.map((product) => buildProductCardHtml(product)).join("");

  productGrid.innerHTML = html;
}

function renderCategorySections(products) {
  if (!categorySections || !searchResultSection) return;

  const keyword = String(searchInput?.value || "").trim();
  const isFiltering = selectedCategory !== "all" || Boolean(keyword);
  categorySections.classList.toggle("hidden", isFiltering);
  searchResultSection.classList.toggle("hidden", !isFiltering);

  if (isFiltering) return;

  const grouped = new Map();
  sortByBestDeal(products).forEach((product) => {
    const label = String(product.category || "Sản phẩm").trim() || "Sản phẩm";
    const key = slugify(label);
    if (!grouped.has(key)) grouped.set(key, { label, slug: key, items: [] });
    const entry = grouped.get(key);
    if (entry && entry.items.length < 9) entry.items.push(product);
  });

  const preferredOrder = [
    "trang-diem",
    "cham-soc-da",
    "cham-soc-toc",
    "co-the",
    "nganh-khac",
    "bo-san-pham"
  ];

  const orderedEntries = [
    ...preferredOrder.map((slug) => grouped.get(slug)).filter(Boolean),
    ...[...grouped.values()]
      .filter((entry) => !preferredOrder.includes(entry.slug))
      .sort((a, b) => a.label.localeCompare(b.label, "vi"))
  ];

  if (!orderedEntries.length) {
    categorySections.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  categorySections.innerHTML = orderedEntries
    .map((entry, index) => {
      const railId = `showcaseRail${index}`;
      const cardsHtml = entry.items
        .map((product) => buildProductCardHtml(product, "showcase-card"))
        .join("");
      return `
        <section class="category-showcase">
          <div class="category-showcase__head">
            <h3>${entry.label}</h3>
            <a class="showcase-view-all" href="san-pham.html?category=${encodeURIComponent(entry.slug)}">
              <span>Xem tất cả</span>
              <span class="material-icons" aria-hidden="true">chevron_right</span>
            </a>
          </div>
          <div class="category-showcase__body">
            <button class="showcase-arrow left" type="button" data-target="${railId}" data-direction="-1" aria-label="Lướt trái">
              <span class="material-icons" aria-hidden="true">chevron_left</span>
            </button>
            <div id="${railId}" class="showcase-rail">
              ${cardsHtml}
            </div>
            <button class="showcase-arrow right" type="button" data-target="${railId}" data-direction="1" aria-label="Lướt phải">
              <span class="material-icons" aria-hidden="true">chevron_right</span>
            </button>
          </div>
        </section>
      `;
    })
    .join("");
}

function renderHotDeals(products) {
  if (!hotDealGrid) return;
  const topDeals = sortByBestDeal(products)
    .filter((item) => item.discount > 0)
    .slice(0, 8);
  hotDealGrid.innerHTML = topDeals.map((item) => buildProductCardHtml(item, "hot-deal-card")).join("");
}

function renderPromoSlides(products) {
  if (!promoTrack || !promoDots) return;
  const topDeals = sortByBestDeal(products).slice(0, 5);
  promoSlides = topDeals.map((item) => ({
    id: item.id,
    title: item.name,
    image: item.images?.[0] || item.image || FALLBACK_IMAGE,
    discount: item.discount,
    link: item.affiliateLink
  }));

  if (!promoSlides.length) {
    promoTrack.innerHTML = "";
    promoDots.innerHTML = "";
    return;
  }

  promoTrack.innerHTML = promoSlides
    .map(
      (slide, index) => `
        <article class="promo-slide ${index === 0 ? "active" : ""}" data-index="${index}" data-id="${slide.id}">
          <img src="${slide.image}" alt="${slide.title}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" />
          <div class="promo-slide__overlay">
            <span class="promo-slide__badge">Deal ${Math.max(slide.discount, 10)}%</span>
            <h3>${slide.title}</h3>
            <button class="btn-primary promo-buy-btn" type="button" data-id="${slide.id}">Mua ngay</button>
          </div>
        </article>
      `
    )
    .join("");

  promoDots.innerHTML = promoSlides
    .map(
      (_, index) => `
        <button class="promo-dot ${index === 0 ? "active" : ""}" type="button" data-index="${index}" aria-label="Đến banner ${index + 1}"></button>
      `
    )
    .join("");

  promoIndex = 0;
}

async function loadBlogContent() {
  const localData = localStorage.getItem(BLOG_STORAGE_KEY);
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      const normalized = normalizeBlogContent(parsed);
      if (normalized.posts.length || normalized.faqs.length) {
        blogContent = normalized;
        return;
      }
    } catch {
      // fallback fetch json
    }
  }

  try {
    const response = await fetch(BLOG_DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed = await response.json();
    blogContent = normalizeBlogContent(parsed);
  } catch {
    blogContent = {
      posts: [
        {
          id: "blog-fallback-1",
          title: "Mẹo chọn mỹ phẩm an toàn cho da nhạy cảm",
          summary: "Ưu tiên bảng thành phần tối giản và test phản ứng da trước khi dùng toàn mặt.",
          url: "trung-tam-tro-giup.html",
          tag: "Mẹo nhanh",
          ctaText: "Xem hướng dẫn"
        }
      ],
      faqs: []
    };
  }
}

function renderBlogAndFaqSection() {
  if (blogGrid) {
    if (!blogContent.posts.length) {
      blogGrid.innerHTML = '<article class="blog-card"><h3>Chưa có bài viết</h3><p>Nội dung review sẽ được cập nhật sớm.</p><a href="trung-tam-tro-giup.html">Xem trung tâm trợ giúp</a></article>';
    } else {
      blogGrid.innerHTML = blogContent.posts
        .slice(0, 6)
        .map((post) => `
          <article class="blog-card">
            <span class="blog-tag">${escapeHtml(post.tag)}</span>
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml(post.summary)}</p>
            <a href="${escapeHtml(post.url)}">${escapeHtml(post.ctaText)}</a>
          </article>
        `)
        .join("");
    }
  }

  if (faqList) {
    if (!blogContent.faqs.length) {
      faqList.innerHTML = '<details class="faq-item"><summary>Website có bán hàng trực tiếp không?</summary><p>Website tổng hợp và điều hướng đến đối tác để bạn đặt mua.</p></details>';
    } else {
      faqList.innerHTML = blogContent.faqs
        .slice(0, 8)
        .map((item) => `
          <details class="faq-item">
            <summary>${escapeHtml(item.question)}</summary>
            <p>${escapeHtml(item.answer)}</p>
          </details>
        `)
        .join("");
    }
  }

  if (blogFaqJsonLd) {
    const articleItems = blogContent.posts.slice(0, 6).map((post) => ({
      "@type": "Article",
      headline: post.title,
      description: post.summary,
      mainEntityOfPage: new URL(post.url, location.href).toString(),
      author: { "@type": "Organization", name: "Mỹ Phẩm Thái Nguyên" },
      publisher: { "@type": "Organization", name: "Mỹ Phẩm Thái Nguyên" }
    }));
    const faqEntities = blogContent.faqs.slice(0, 8).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }));

    const graph = [];
    if (articleItems.length) {
      graph.push(...articleItems);
    }
    if (faqEntities.length) {
      graph.push({ "@type": "FAQPage", mainEntity: faqEntities });
    }
    blogFaqJsonLd.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
  }
}

function syncPromoSlide(nextIndex) {
  if (!promoSlides.length || !promoTrack || !promoDots) return;
  promoIndex = (nextIndex + promoSlides.length) % promoSlides.length;
  promoTrack.querySelectorAll(".promo-slide").forEach((el, index) => {
    el.classList.toggle("active", index === promoIndex);
  });
  promoDots.querySelectorAll(".promo-dot").forEach((el, index) => {
    el.classList.toggle("active", index === promoIndex);
  });
}

function restartPromoTimer() {
  if (promoTimer) clearInterval(promoTimer);
  if (!promoSlides.length) return;
  promoTimer = setInterval(() => {
    syncPromoSlide(promoIndex + 1);
  }, 4500);
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

function trackAffiliateEvent(product = {}, source = "home") {
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

function openAffiliate(url, product = {}, source = "home") {
  const trackedUrl = withAffiliateTracking(url);
  if (!trackedUrl) return;
  trackAffiliateEvent(product, source);
  loadingOverlay.classList.remove("hidden");
  setTimeout(() => {
    window.open(trackedUrl, "_blank", "noopener");
    loadingOverlay.classList.add("hidden");
  }, 500);
}

function openModal(product) {
  activeModalProduct = product;
  modalName.textContent = product.name;
  modalCurrentPrice.textContent = formatVnd(product.currentPrice);
  modalOldPrice.textContent = product.oldPrice ? formatVnd(product.oldPrice) : "";
  modalDiscount.textContent = product.discount ? `-${product.discount}%` : "";
  modalCategory.textContent = product.category || "khac";
  modalSold.textContent = `Đã bán ${estimateSold(product.id)}`;
  modalDescription.textContent = product.description || "Không có mô tả ngắn.";
  modalDetails.textContent = product.details || product.description || "Dang cap nhat mo ta chi tiet.";
  modalSpecs.innerHTML = "";

  const specs = Array.isArray(product.specs) && product.specs.length
    ? product.specs
    : ["Chính hãng chọn lọc", "Hỗ trợ đổi trả theo chính sách shop", "Cập nhật thông tin liên tục"];
  specs.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    modalSpecs.appendChild(li);
  });

  renderModalMedia(product);
  modalBuyBtn.dataset.link = product.affiliateLink;
  if (modalMoreBtn) {
    const categorySlug = slugify(product.category || "");
    modalMoreBtn.href = categorySlug ? `san-pham.html?category=${encodeURIComponent(categorySlug)}` : "san-pham.html";
  }

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  modalViewerVideo.pause();
  modalViewerVideo.classList.add("hidden");
  modalViewerVideo.src = "";
  modalVideoPlayOverlay?.classList.add("hidden");
  activeModalProduct = null;
  modalThumbs.innerHTML = "";
}

function getModalMediaList(product) {
  const imageItems = (product.images || []).map((url) => ({ type: "image", url }));
  const media = [...imageItems];
  if (product.videoUrl) {
    media.unshift({ type: "video", url: product.videoUrl });
  }
  return media.length ? media : [{ type: "image", url: FALLBACK_IMAGE }];
}

function renderModalViewer(mediaItem) {
  if (!mediaItem) return;

  if (mediaItem.type === "video") {
    modalViewerImage.classList.add("hidden");
    modalViewerVideo.classList.remove("hidden");
    modalViewerVideo.muted = true;
    modalViewerVideo.loop = true;
    modalViewerVideo.playsInline = true;
    modalViewerVideo.setAttribute("playsinline", "");
    modalViewerVideo.setAttribute("muted", "");
    modalViewerVideo.poster = activeModalProduct?.images?.[0] || FALLBACK_IMAGE;
    modalViewerVideo.src = mediaItem.url;
    modalViewerVideo.load();
    modalViewerVideo.play()
      .then(() => modalVideoPlayOverlay?.classList.add("hidden"))
      .catch(() => modalVideoPlayOverlay?.classList.remove("hidden"));
    modalViewerVideo.onerror = () => {
      modalViewerVideo.classList.add("hidden");
      modalViewerImage.classList.remove("hidden");
      modalViewerImage.src = FALLBACK_IMAGE;
      modalVideoPlayOverlay?.classList.add("hidden");
    };
    return;
  }

  modalViewerVideo.pause();
  modalViewerVideo.classList.add("hidden");
  modalViewerVideo.src = "";
  modalVideoPlayOverlay?.classList.add("hidden");
  modalViewerImage.classList.remove("hidden");
  modalViewerImage.src = mediaItem.url || FALLBACK_IMAGE;
  modalViewerImage.alt = activeModalProduct?.name || "San pham";
  modalViewerImage.onerror = () => {
    modalViewerImage.onerror = null;
    modalViewerImage.src = FALLBACK_IMAGE;
  };
}

function renderModalMedia(product) {
  const mediaList = getModalMediaList(product);
  modalThumbs.innerHTML = "";
  renderModalViewer(mediaList[0]);

  mediaList.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "thumb-item";
    if (index === 0) btn.classList.add("active");
    btn.dataset.index = String(index);

    if (item.type === "video") {
      btn.innerHTML = `<span class="thumb-video-icon">▶</span><span class="thumb-video-text">Video</span>`;
      btn.classList.add("thumb-video");
    } else {
      btn.innerHTML = `<img src="${item.url}" alt="thumb" loading="lazy" />`;
    }

    btn.addEventListener("click", () => {
      modalThumbs.querySelectorAll(".thumb-item").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      renderModalViewer(item);
    });

    modalThumbs.appendChild(btn);
  });
}

function applySearch() {
  const keyword = searchInput.value.trim().toLowerCase();

  filteredProducts = sortByBestDeal(
    allProducts.filter((p) => {
      const matchKeyword = p.name.toLowerCase().includes(keyword);
      const selected = slugify(selectedCategory);
      const matchCategory =
        selectedCategory === "all" ||
        p.categorySlug === selected ||
        p.subCategorySlug === selected ||
        (selected === "sale" && (p.discount > 0 || p.tags.includes("sale")));
      return matchKeyword && matchCategory;
    })
  );

  renderProducts(filteredProducts);
  renderCategorySections(filteredProducts);
}

function scheduleSearch() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(applySearch, 120);
}

function estimateSold(id) {
  let hash = 0;
  const str = String(id || "mypham");
  for (let i = 0; i < str.length; i += 1) hash = (hash + str.charCodeAt(i) * (i + 3)) % 997;
  return (hash + 10).toLocaleString("vi-VN");
}

function buildProductDetailUrl(productId) {
  return `product.html?id=${encodeURIComponent(productId)}`;
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

function initCategorySidebar() {
  const sidebar = document.getElementById("categorySidebar");
  const backdrop = document.getElementById("categoryBackdrop");
  const accordionRoot = document.getElementById("categoryAccordion");
  const openBtn = document.getElementById("openCategoryDrawer");
  const closeBtn = document.getElementById("closeCategoryDrawer");
  const bottomMenuBtn = document.querySelector('.bottom-nav a[data-open-category="1"]');
  if (!sidebar || !accordionRoot) return;

  const isMobileOrTablet = () => window.matchMedia("(max-width: 1023px)").matches;
  let groups = [];

  const setSubListState = (group, expanded) => {
    const btn = group.querySelector(":scope > .cat-parent-btn");
    const sub = group.querySelector(":scope > .cat-sub-list");
    if (!btn || !sub) return;
    btn.setAttribute("aria-expanded", String(expanded));
    group.classList.toggle("active", expanded);
    if (expanded) {
      sub.classList.add("is-open");
      sub.style.maxHeight = `${sub.scrollHeight}px`;
    } else {
      sub.style.maxHeight = `${sub.scrollHeight}px`;
      requestAnimationFrame(() => {
        sub.classList.remove("is-open");
        sub.style.maxHeight = "0px";
      });
    }
  };

  const closeSiblingGroups = (currentGroup) => {
    const parentSubList = currentGroup.parentElement;
    if (!parentSubList) return;
    Array.from(parentSubList.children)
      .filter((el) => el !== currentGroup && el.classList.contains("cat-group"))
      .forEach((group) => setSubListState(group, false));
  };

  const closeDrawer = () => {
    sidebar.classList.remove("is-open");
    backdrop?.setAttribute("hidden", "");
    document.body.style.overflow = "";
    openBtn?.setAttribute("aria-expanded", "false");
    if (window.location.hash === "#menu") {
      history.replaceState(null, "", `${location.pathname}${location.search}`);
    }
  };

  const openDrawer = () => {
    sidebar.classList.add("is-open");
    backdrop?.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    openBtn?.setAttribute("aria-expanded", "true");
  };

  const bindAccordion = () => {
    groups = Array.from(sidebar.querySelectorAll(".cat-group"));
    const parentButtons = Array.from(sidebar.querySelectorAll(".cat-parent-btn"));
    parentButtons.forEach((btn) => {
      const group = btn.closest(".cat-group");
      if (!group) return;
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        if (!expanded) closeSiblingGroups(group);
        setSubListState(group, !expanded);
      });
      btn.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const expanded = btn.getAttribute("aria-expanded") === "true";
          if (!expanded) closeSiblingGroups(group);
          setSubListState(group, !expanded);
        }
      });
    });

    const subItems = sidebar.querySelectorAll(".cat-sub-item");
    subItems.forEach((item) => {
      item.addEventListener("click", () => {
        subItems.forEach((el) => el.classList.remove("is-active"));
        item.classList.add("is-active");
        if (isMobileOrTablet()) closeDrawer();
      });
    });
  };

  const renderDynamicSidebar = () => {
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
    const grouped = new Map();
    allProducts.forEach((item) => {
      const categoryLabel = String(item.category || "").trim();
      if (!categoryLabel) return;
      const categorySlug = item.categorySlug || slugify(categoryLabel);
      const subLabel = String(item.subCategory || "Khác").trim() || "Khác";
      const subSlug = item.subCategorySlug || slugify(subLabel);
      if (!grouped.has(categorySlug)) {
        grouped.set(categorySlug, { label: categoryLabel, slug: categorySlug, subs: new Map() });
      }
      const section = grouped.get(categorySlug);
      if (!section.subs.has(subSlug)) {
        section.subs.set(subSlug, { label: subLabel, slug: subSlug });
      }
    });
    const orderedSections = [...grouped.values()].sort((a, b) => a.label.localeCompare(b.label, "vi"));
    const sectionHtml = orderedSections
      .map((section, index) => {
        const sectionId = `cat-section-${section.slug || index}`;
        const childHtml = [...section.subs.values()]
          .sort((a, b) => a.label.localeCompare(b.label, "vi"))
          .map((item) => `
            <li>
              <a href="san-pham.html?category=${encodeURIComponent(section.slug)}&subCategory=${encodeURIComponent(item.slug)}" class="cat-sub-item">
                <span class="cat-sub-item-left">
                  <span class="material-icons" aria-hidden="true">${iconMap[item.slug] || "folder"}</span>
                  <span>${item.label}</span>
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
                <span class="material-icons" aria-hidden="true">${iconMap[section.slug] || "folder_open"}</span>
                <span>${section.label}</span>
              </span>
              <span class="material-icons cat-arrow" aria-hidden="true">chevron_right</span>
            </button>
            <ul id="${sectionId}" class="cat-sub-list ${index === 0 ? "is-open" : ""}">
              ${childHtml}
            </ul>
          </li>
        `;
      })
      .join("");

    const hasHotSale = allProducts.some((product) => product.discount > 0 || product.tags.includes("sale"));
    const hotBadge = hasHotSale ? '<span class="cat-badge">Hot</span>' : '<span class="cat-badge">%</span>';

    accordionRoot.innerHTML = `
      <li>
        <a href="sale.html" class="cat-action cat-action--sale">
          ${hotBadge}
          <span class="material-icons" aria-hidden="true">local_fire_department</span>
          <span>Hot Sale</span>
          <span class="material-icons cat-action__arrow" aria-hidden="true">chevron_right</span>
        </a>
      </li>
      <li class="cat-group active">
        <button class="cat-parent-btn" type="button" aria-expanded="true" aria-controls="cat-product-main">
          <span class="cat-parent-btn__left">
            <span class="material-icons" aria-hidden="true">spa</span>
            <span>Sản phẩm</span>
          </span>
          <span class="material-icons cat-arrow" aria-hidden="true">chevron_right</span>
        </button>
        <ul id="cat-product-main" class="cat-sub-list is-open">
          ${sectionHtml}
        </ul>
      </li>
    `;
    bindAccordion();
  };

  const syncOnResize = () => {
    groups.forEach((group) => {
      const btn = group.querySelector(":scope > .cat-parent-btn");
      const sub = group.querySelector(":scope > .cat-sub-list");
      if (!btn || !sub) return;
      const expanded = btn.getAttribute("aria-expanded") === "true";
      sub.style.maxHeight = expanded ? `${sub.scrollHeight}px` : "0px";
      sub.classList.toggle("is-open", expanded);
    });
  };

  renderDynamicSidebar();
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
  window.addEventListener("resize", syncOnResize);
  syncOnResize();
  if (window.location.hash === "#menu") openDrawer();
}

function getProductById(id) {
  return allProducts.find((p) => p.id === id);
}

async function loadProducts() {
  const localData = localStorage.getItem(STORAGE_KEY);

  if (localData !== null) {
    try {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed)) {
        allProducts = parsed.map(normalizeProduct).filter(isUsableProduct);
        filteredProducts = sortByBestDeal(allProducts);
        renderProducts(filteredProducts);
        renderCategorySections(filteredProducts);
        renderHotDeals(allProducts);
        renderPromoSlides(allProducts);
        restartPromoTimer();
        return;
      }
    } catch {
      // fallback ve products.json neu localStorage bi loi parse
    }
  }

  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allProducts = Array.isArray(data) ? data.map(normalizeProduct) : [];
  } catch {
    // Khi mo bang file:// hoac host loi, van hien du lieu mau de khong bi trang trang
    allProducts = FALLBACK_PRODUCTS.map(normalizeProduct);
  }

  allProducts = allProducts.filter(isUsableProduct);
  filteredProducts = sortByBestDeal(allProducts);
  renderProducts(filteredProducts);
  renderCategorySections(filteredProducts);
  renderHotDeals(allProducts);
  renderPromoSlides(allProducts);
  restartPromoTimer();
}

function bindEvents() {
  searchInput.addEventListener("input", scheduleSearch);
  searchBtn.addEventListener("click", applySearch);

  if (quickTags) {
    quickTags.addEventListener("click", (event) => {
      const target = event.target.closest(".tag");
      if (!target) return;
      selectedCategory = target.dataset.tag || "all";

      quickTags.querySelectorAll(".tag").forEach((btn) => btn.classList.remove("active"));
      target.classList.add("active");
      applySearch();
    });
  }

  productGrid.addEventListener("click", (event) => {
    const buyBtn = event.target.closest(".buy-now");
    if (buyBtn) {
      const card = buyBtn.closest(".product-card");
      if (!card) return;
      const product = getProductById(card.dataset.id);
      if (!product) return;
      openAffiliate(product.affiliateLink, product, "home_search_grid");
    }
  });

  categorySections?.addEventListener("click", (event) => {
    const buyBtn = event.target.closest(".buy-now");
    if (buyBtn) {
      const card = buyBtn.closest(".product-card");
      if (!card) return;
      const product = getProductById(card.dataset.id);
      if (!product) return;
      openAffiliate(product.affiliateLink, product, "home_category_section");
      return;
    }

    const arrow = event.target.closest(".showcase-arrow");
    if (!arrow) return;
    const railId = arrow.dataset.target;
    const direction = Number(arrow.dataset.direction || 1);
    if (!railId) return;
    const rail = document.getElementById(railId);
    if (!rail) return;
    const step = Math.max(rail.clientWidth * 0.82, 320);
    rail.scrollBy({ left: direction * step, behavior: "smooth" });
  });

  hotDealGrid?.addEventListener("click", (event) => {
    const buyBtn = event.target.closest(".buy-now");
    if (!buyBtn) return;
    const card = buyBtn.closest(".product-card");
    if (!card) return;
    const product = getProductById(card.dataset.id);
    if (!product) return;
    openAffiliate(product.affiliateLink, product, "home_hot_deal");
  });

  promoTrack?.addEventListener("click", (event) => {
    const buyBtn = event.target.closest(".promo-buy-btn");
    if (!buyBtn) return;
    const product = getProductById(buyBtn.dataset.id || "");
    if (!product) return;
    openAffiliate(product.affiliateLink, product, "home_promo_slider");
  });

  promoPrevBtn?.addEventListener("click", () => {
    syncPromoSlide(promoIndex - 1);
    restartPromoTimer();
  });
  promoNextBtn?.addEventListener("click", () => {
    syncPromoSlide(promoIndex + 1);
    restartPromoTimer();
  });
  promoDots?.addEventListener("click", (event) => {
    const dot = event.target.closest(".promo-dot");
    if (!dot) return;
    syncPromoSlide(Number(dot.dataset.index || 0));
    restartPromoTimer();
  });

  closeModalBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  modalBuyBtn.addEventListener("click", () => {
    const link = modalBuyBtn.dataset.link;
    if (link) openAffiliate(link, activeModalProduct || {}, "home_modal");
  });

  modalVideoPlayOverlay?.addEventListener("click", () => {
    modalViewerVideo.play()
      .then(() => modalVideoPlayOverlay.classList.add("hidden"))
      .catch(() => {});
  });
}

async function init() {
  // De user vao cong dang nhap tren admin.html
  adminEntry.setAttribute("href", "admin.html");
  initBottomNavActive();
  bindEvents();
  await loadProducts();
  await loadBlogContent();
  renderBlogAndFaqSection();
  initCategorySidebar();
}

init().catch((error) => {
  console.error("Khong the tai du lieu:", error);
  emptyState.classList.remove("hidden");
  emptyState.textContent = "Co loi khi tai du lieu san pham.";
});
