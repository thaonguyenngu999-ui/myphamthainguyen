const STORAGE_KEY = "mypham_products";
const DATA_URL = "assets/data/products.json";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "If-Modified-Since": "0"
};

function cacheBust(url) {
  if (!url || typeof url !== "string") return url;
  return url + (url.includes("?") ? "&" : "?") + "v=" + Date.now();
}
const ADMIN_ACCOUNTS_KEY = "mypham_admin_accounts";
const USER_ACCOUNTS_KEY = "mypham_user_accounts";
const SESSION_KEY = "mypham_admin_session";
const FALLBACK_IMAGE = "https://placehold.co/600x600?text=My+Pham";
const BLOG_STORAGE_KEY = "mypham_blog_content";
const BLOG_DATA_URL = "assets/data/blogs.json";
const GITHUB_PUBLISH_CONFIG_KEY = "mypham_github_publish_config";
const AUTO_GITHUB_PUBLISH_KEY = "mypham_auto_github_publish";
const SESSION_GITHUB_TOKEN_KEY = "mypham_github_token_session";
const REMEMBER_GITHUB_TOKEN_KEY = "mypham_remember_github_token";
const DEFAULT_GITHUB_PUBLISH_CONFIG = {
  owner: "thaonguyenngu999-ui",
  repo: "myphamthainguyen",
  branch: "main",
  productsPath: "assets/data/products.json",
  blogsPath: "assets/data/blogs.json"
};

const authGate = document.getElementById("authGate");
const adminDashboard = document.getElementById("adminDashboard");
const authMessage = document.getElementById("authMessage");

const loginTabBtn = document.getElementById("loginTabBtn");
const registerTabBtn = document.getElementById("registerTabBtn");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const logoutBtn = document.getElementById("logoutBtn");
const adminRoleBtn = document.getElementById("adminRoleBtn");
const userRoleBtn = document.getElementById("userRoleBtn");
const roleHint = document.getElementById("roleHint");
const socialAuthWrap = document.getElementById("socialAuthWrap");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const facebookLoginBtn = document.getElementById("facebookLoginBtn");

const loginUsernameInput = document.getElementById("loginUsername");
const loginPasswordInput = document.getElementById("loginPassword");
const registerUsernameInput = document.getElementById("registerUsername");
const registerPasswordInput = document.getElementById("registerPassword");
const loginRoleInput = document.getElementById("loginRole");
const registerRoleInput = document.getElementById("registerRole");

const form = document.getElementById("productForm");
const productIdInput = document.getElementById("productId");
const existingImagesInput = document.getElementById("existingImages");
const existingVideoInput = document.getElementById("existingVideo");
const nameInput = document.getElementById("name");
const imageUrlsInput = document.getElementById("imageUrls");
const imageFileInput = document.getElementById("imageFile");
const videoUrlInput = document.getElementById("videoUrl");
const videoFileInput = document.getElementById("videoFile");
const currentPriceInput = document.getElementById("currentPrice");
const oldPriceInput = document.getElementById("oldPrice");
const discountInput = document.getElementById("discount");
const affiliateLinkInput = document.getElementById("affiliateLink");
const categoryInput = document.getElementById("category");
const subCategoryInput = document.getElementById("subCategory");
const tagsInput = document.getElementById("tags");
const descriptionInput = document.getElementById("description");
const detailsInput = document.getElementById("details");
const specsInput = document.getElementById("specs");
const tableBody = document.getElementById("adminProductTableBody");
const resetFormBtn = document.getElementById("resetFormBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFileInput = document.getElementById("importFileInput");
const githubOwnerInput = document.getElementById("githubOwner");
const githubRepoInput = document.getElementById("githubRepo");
const githubBranchInput = document.getElementById("githubBranch");
const githubProductsPathInput = document.getElementById("githubProductsPath");
const githubBlogsPathInput = document.getElementById("githubBlogsPath");
const githubTokenInput = document.getElementById("githubToken");
const githubPublishBtn = document.getElementById("githubPublishBtn");
const githubPublishStatus = document.getElementById("githubPublishStatus");
const autoGithubPublishInput = document.getElementById("autoGithubPublish");
const rememberGithubTokenInput = document.getElementById("rememberGithubToken");
const blogPostForm = document.getElementById("blogPostForm");
const blogPostIdInput = document.getElementById("blogPostId");
const blogTitleInput = document.getElementById("blogTitle");
const blogSummaryInput = document.getElementById("blogSummary");
const blogUrlInput = document.getElementById("blogUrl");
const blogTagInput = document.getElementById("blogTag");
const blogCtaTextInput = document.getElementById("blogCtaText");
const resetBlogPostBtn = document.getElementById("resetBlogPostBtn");
const faqForm = document.getElementById("faqForm");
const faqIdInput = document.getElementById("faqId");
const faqQuestionInput = document.getElementById("faqQuestion");
const faqAnswerInput = document.getElementById("faqAnswer");
const resetFaqBtn = document.getElementById("resetFaqBtn");
const blogPostTableBody = document.getElementById("blogPostTableBody");
const faqTableBody = document.getElementById("faqTableBody");
const affiliateTotalClicksEl = document.getElementById("affiliateTotalClicks");
const affiliate7dClicksEl = document.getElementById("affiliate7dClicks");
const affiliateTopSourceEl = document.getElementById("affiliateTopSource");
const affiliateTopProductsBody = document.getElementById("affiliateTopProductsBody");

let products = [];
let uploadedBase64Images = [];
let uploadedBase64Video = "";
let dashboardInitialized = false;
let isImageProcessing = false;
let isVideoProcessing = false;
let selectedAuthRole = "admin";
let blogContent = { posts: [], faqs: [] };
const AFFILIATE_CLICK_KEY = "mypham_affiliate_click_logs";
let categorySubCategoryMap = {};
let isGithubPublishing = false;

const DEFAULT_CATEGORY_SUBCATEGORY_MAP = {
  "Chăm sóc da": [
    "Tẩy trang",
    "Rửa mặt",
    "Toner - xịt khoáng",
    "Serum",
    "Kem dưỡng",
    "Kem chống nắng",
    "Mặt nạ"
  ],
  "Trang điểm": ["Son màu", "Son dưỡng", "Makeup"],
  "Chăm sóc tóc": ["Dầu gội", "Dầu xả", "Dưỡng tóc"],
  "Cơ thể": ["Làm sạch cơ thể", "Dưỡng thể", "Vệ sinh vùng kín", "Chăm sóc răng miệng"],
  "Ngành khác": ["Chăm sóc bé", "Nước hoa", "Tinh dầu", "Lành Homecare"],
  "Bộ sản phẩm": ["Bộ dưỡng da", "Bộ chăm tóc"]
};

const FALLBACK_PRODUCTS = [
  {
    id: "fb001",
    name: "Son li Velvet Mood 3.5g",
    image: "https://picsum.photos/seed/mypham-fb001/600/600",
    currentPrice: 129000,
    oldPrice: 229000,
    discount: 44,
    affiliateLink: "https://shope.ee/fallback001",
    category: "son-moi",
    description: "Son li mem min, mau de dung moi ngay."
  },
  {
    id: "fb002",
    name: "Kem duong am phuc hoi Ceramide 50ml",
    image: "https://picsum.photos/seed/mypham-fb002/600/600",
    currentPrice: 199000,
    oldPrice: 329000,
    discount: 40,
    affiliateLink: "https://shope.ee/fallback002",
    category: "kem-duong",
    description: "Giu am tot, diu da va phuc hoi hang rao bao ve."
  },
  {
    id: "fb003",
    name: "Mat na giay cap am sau 10 mieng",
    image: "https://picsum.photos/seed/mypham-fb003/600/600",
    currentPrice: 149000,
    oldPrice: 249000,
    discount: 40,
    affiliateLink: "https://shope.ee/fallback003",
    category: "mat-na",
    description: "Cap nuoc nhanh, giup da mem muot ngay sau khi dap."
  },
  {
    id: "fb004",
    name: "Serum sang da Vitamin C 30ml",
    image: "https://picsum.photos/seed/mypham-fb004/600/600",
    currentPrice: 259000,
    oldPrice: 389000,
    discount: 33,
    affiliateLink: "https://shope.ee/fallback004",
    category: "serum",
    description: "Ho tro deu mau da, cai thien tham xin."
  },
  {
    id: "fb005",
    name: "Nuoc tay trang diu nhe 400ml",
    image: "https://picsum.photos/seed/mypham-fb005/600/600",
    currentPrice: 109000,
    oldPrice: 179000,
    discount: 39,
    affiliateLink: "https://shope.ee/fallback005",
    category: "tay-trang",
    description: "Lam sach bui ban hang ngay, khong kho rat."
  },
  {
    id: "fb006",
    name: "Kem chong nang SPF50+ PA++++",
    image: "https://picsum.photos/seed/mypham-fb006/600/600",
    currentPrice: 179000,
    oldPrice: 299000,
    discount: 40,
    affiliateLink: "https://shope.ee/fallback006",
    category: "chong-nang",
    description: "Bao ve da tot duoi nang, khong bet dinh."
  }
];

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `p_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
}

function showStorageError(error) {
  console.error("Luu du lieu that bai:", error);
  alert("Khong luu duoc du lieu. Anh upload co the qua lon hoac bo nho trinh duyet da day. Thu giam kich thuoc anh hoac dung URL anh.");
}

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

function ensureUniqueSlugs(items = []) {
  const used = new Map();
  return items.map((item) => {
    const base = createProductSlug(item.slug || item.name || item.id || "san-pham");
    const count = used.get(base) || 0;
    used.set(base, count + 1);
    const slug = count === 0 ? base : `${base}-${count + 1}`;
    return { ...item, slug };
  });
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
    title: String(post.title || "").trim(),
    summary: String(post.summary || "").trim(),
    url: String(post.url || "").trim(),
    tag: String(post.tag || "Review").trim(),
    ctaText: String(post.ctaText || "Xem thêm").trim()
  };
}

function normalizeFaqItem(item, index = 0) {
  const id = String(item.id || `faq_${index + 1}`).trim();
  return {
    id,
    question: String(item.question || "").trim(),
    answer: String(item.answer || "").trim()
  };
}

function normalizeBlogContent(raw) {
  const posts = Array.isArray(raw?.posts)
    ? raw.posts.map(normalizeBlogPost).filter((item) => item.title && item.summary && item.url)
    : [];
  const faqs = Array.isArray(raw?.faqs)
    ? raw.faqs.map(normalizeFaqItem).filter((item) => item.question && item.answer)
    : [];
  return { posts, faqs };
}

function pushUniqueLabel(list, value) {
  const label = String(value || "").trim();
  if (!label) return;
  if (!list.some((item) => item.toLowerCase() === label.toLowerCase())) {
    list.push(label);
  }
}

function buildCategorySubCategoryMap(sourceProducts = []) {
  const map = {};
  Object.entries(DEFAULT_CATEGORY_SUBCATEGORY_MAP).forEach(([category, subs]) => {
    map[category] = [];
    (subs || []).forEach((sub) => pushUniqueLabel(map[category], sub));
  });

  sourceProducts.forEach((product) => {
    const category = String(product?.category || "").trim();
    const subCategory = String(product?.subCategory || "").trim();
    if (!category) return;
    if (!map[category]) map[category] = [];
    if (subCategory) pushUniqueLabel(map[category], subCategory);
  });

  Object.keys(map).forEach((category) => {
    if (!map[category].length) map[category].push("Khác");
    map[category].sort((a, b) => a.localeCompare(b, "vi"));
  });

  return Object.fromEntries(Object.entries(map).sort((a, b) => a[0].localeCompare(b[0], "vi")));
}

function populateSubCategoryOptions(selectedCategory, preferredSubCategory = "") {
  const category = String(selectedCategory || categoryInput.value || "").trim();
  const options = [...(categorySubCategoryMap[category] || [])];
  subCategoryInput.innerHTML = "";

  if (preferredSubCategory && !options.some((item) => item.toLowerCase() === preferredSubCategory.toLowerCase())) {
    options.push(preferredSubCategory);
  }
  if (!options.length) options.push("Khác");

  options.forEach((label) => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    subCategoryInput.appendChild(option);
  });

  const addSubOption = document.createElement("option");
  addSubOption.value = "__add_new_subcategory__";
  addSubOption.textContent = "+ Thêm danh mục con mới...";
  subCategoryInput.appendChild(addSubOption);

  subCategoryInput.value = preferredSubCategory && [...subCategoryInput.options].some((opt) => opt.value === preferredSubCategory)
    ? preferredSubCategory
    : options[0];
}

function refreshCategoryOptions(preferredCategory = "", preferredSubCategory = "") {
  categorySubCategoryMap = buildCategorySubCategoryMap(products);
  const categories = Object.keys(categorySubCategoryMap);
  categoryInput.innerHTML = "";

  categories.forEach((label) => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    categoryInput.appendChild(option);
  });

  if (preferredCategory && !categories.some((item) => item.toLowerCase() === preferredCategory.toLowerCase())) {
    const customOption = document.createElement("option");
    customOption.value = preferredCategory;
    customOption.textContent = `${preferredCategory} (tự thêm)`;
    categoryInput.appendChild(customOption);
    categorySubCategoryMap[preferredCategory] = categorySubCategoryMap[preferredCategory] || [preferredSubCategory || "Khác"];
  }

  const addCategoryOption = document.createElement("option");
  addCategoryOption.value = "__add_new_category__";
  addCategoryOption.textContent = "+ Thêm danh mục mới...";
  categoryInput.appendChild(addCategoryOption);

  const nextCategory = preferredCategory && [...categoryInput.options].some((opt) => opt.value === preferredCategory)
    ? preferredCategory
    : (categories[0] || "");
  if (nextCategory) {
    categoryInput.value = nextCategory;
    populateSubCategoryOptions(nextCategory, preferredSubCategory);
  } else {
    subCategoryInput.innerHTML = "";
  }
}

function normalizeProduct(product) {
  const rawImage = product.image || "";
  const migratedImage = rawImage.includes("cf.shopee.vn/file/")
    ? `https://picsum.photos/seed/${encodeURIComponent(product.id || product.name || "mypham")}/600/600`
    : rawImage;

  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : [migratedImage].filter(Boolean);
  if (!images.length) images.push(FALLBACK_IMAGE);

  const specs = Array.isArray(product.specs)
    ? product.specs.filter(Boolean)
    : String(product.specs || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  return {
    id: product.id || makeId(),
    slug: createProductSlug(product.slug || product.name || product.id || "san-pham"),
    name: product.name || "",
    image: images[0] || FALLBACK_IMAGE,
    images,
    videoUrl: product.videoUrl || product.video || "",
    currentPrice: Number(product.currentPrice) || 0,
    oldPrice: Number(product.oldPrice) || 0,
    discount: Number(product.discount) || 0,
    affiliateLink: product.affiliateLink || "",
    category: product.category || "Chăm sóc da",
    subCategory: product.subCategory || "Khác",
    tags: normalizeTags(product.tags),
    description: product.description || "",
    details: product.details || product.longDescription || product.description || "",
    specs
  };
}

function parseMultilineUrls(value) {
  return String(value || "")
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAccountsByRole(role = "admin") {
  const key = role === "admin" ? ADMIN_ACCOUNTS_KEY : USER_ACCOUNTS_KEY;
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAccountsByRole(accounts, role = "admin") {
  const key = role === "admin" ? ADMIN_ACCOUNTS_KEY : USER_ACCOUNTS_KEY;
  localStorage.setItem(key, JSON.stringify(accounts));
}

function seedDefaultAccounts() {
  const adminAccounts = getAccountsByRole("admin");
  if (!adminAccounts.length) {
    saveAccountsByRole([{ username: "admin", password: "thainguyen123", role: "admin" }], "admin");
  }

  const userAccounts = getAccountsByRole("user");
  if (!userAccounts.length) {
    saveAccountsByRole([{ username: "user", password: "123456", role: "user" }], "user");
  }
}

function showAuthMessage(message, isError = true) {
  authMessage.textContent = message;
  authMessage.classList.toggle("error", isError);
  authMessage.classList.toggle("success", !isError);
}

function activateTab(mode) {
  const isLogin = mode === "login";
  loginTabBtn.classList.toggle("active", isLogin);
  registerTabBtn.classList.toggle("active", !isLogin);
  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);
  showAuthMessage("", true);
}

function setAuthRole(role = "admin") {
  selectedAuthRole = role === "user" ? "user" : "admin";
  const isAdmin = selectedAuthRole === "admin";
  adminRoleBtn.classList.toggle("active", isAdmin);
  userRoleBtn.classList.toggle("active", !isAdmin);
  adminRoleBtn.setAttribute("aria-selected", String(isAdmin));
  userRoleBtn.setAttribute("aria-selected", String(!isAdmin));
  loginRoleInput.value = selectedAuthRole;
  registerRoleInput.value = selectedAuthRole;
  socialAuthWrap?.classList.toggle("hidden", isAdmin);
  roleHint.textContent = isAdmin
    ? "Tài khoản Admin có quyền quản lý sản phẩm, import/export dữ liệu."
    : "Tài khoản thường chỉ dùng để đăng nhập theo dõi và không có quyền chỉnh sửa dữ liệu.";
  showAuthMessage("", true);
}

function handleSocialLogin(provider) {
  if (selectedAuthRole !== "user") {
    showAuthMessage("Đăng nhập Google/Facebook chỉ áp dụng cho tài khoản thường.");
    return;
  }

  const displayName = prompt(`Nhập tên hiển thị để đăng nhập bằng ${provider}:`, "");
  const safeName = String(displayName || "").trim();
  if (!safeName) return;

  const base = safeName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const username = `${provider.toLowerCase()}_${base || "user"}`;

  const userAccounts = getAccountsByRole("user");
  const existed = userAccounts.some((item) => item.username === username);
  if (!existed) {
    userAccounts.push({ username, password: "social_login", role: "user", provider });
    saveAccountsByRole(userAccounts, "user");
  }

  createSession(username, "user");
  showAuthMessage(`Đăng nhập ${provider} thành công. Đang chuyển về trang chủ...`, false);
  setTimeout(() => {
    window.location.href = "index.html";
  }, 700);
}

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return {
        username: String(parsed.username || "").trim(),
        role: parsed.role === "user" ? "user" : "admin"
      };
    }
    if (typeof parsed === "string") {
      return { username: parsed, role: "admin" };
    }
  } catch {
    const legacy = localStorage.getItem(SESSION_KEY) || "";
    if (legacy) return { username: legacy, role: "admin" };
  }
  return null;
}

function createSession(username, role = "admin") {
  const session = { username, role: role === "user" ? "user" : "admin" };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function enterDashboard() {
  authGate.classList.add("hidden");
  adminDashboard.classList.remove("hidden");
  if (!dashboardInitialized) {
    initDashboard().catch((error) => {
      console.error("Admin dashboard init error:", error);
      alert("Khong the tai du lieu admin.");
    });
  }
}

function backToAuthGate() {
  adminDashboard.classList.add("hidden");
  authGate.classList.remove("hidden");
  activateTab("login");
}

function handleLogin(event) {
  event.preventDefault();
  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value;
  const role = loginRoleInput.value === "user" ? "user" : "admin";

  if (!username || !password) {
    showAuthMessage("Vui long nhap day du ten dang nhap va mat khau.");
    return;
  }

  const account = getAccountsByRole(role).find(
    (item) => item.username === username && item.password === password
  );
  if (!account) {
    showAuthMessage(`Sai ten dang nhap hoac mat khau (${role === "admin" ? "Admin" : "Tài khoản thường"}).`);
    return;
  }

  createSession(username, role);
  loginForm.reset();
  if (role === "admin") {
    showAuthMessage("Dang nhap Admin thanh cong.", false);
    enterDashboard();
    return;
  }

  showAuthMessage("Dang nhap tai khoan thuong thanh cong. Dang chuyen ve trang chu...", false);
  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
}

function handleRegister(event) {
  event.preventDefault();
  const username = registerUsernameInput.value.trim();
  const password = registerPasswordInput.value;
  const role = registerRoleInput.value === "user" ? "user" : "admin";

  if (username.length < 3) {
    showAuthMessage("Ten dang nhap toi thieu 3 ky tu.");
    return;
  }

  if (password.length < 6) {
    showAuthMessage("Mat khau toi thieu 6 ky tu.");
    return;
  }

  const accounts = getAccountsByRole(role);
  const existed = accounts.some((item) => item.username === username);
  if (existed) {
    showAuthMessage("Ten dang nhap da ton tai.");
    return;
  }

  accounts.push({ username, password, role });
  saveAccountsByRole(accounts, role);
  registerForm.reset();
  showAuthMessage(`Dang ky ${role === "admin" ? "Admin" : "tài khoản thường"} thanh cong. Moi ban dang nhap.`, false);
  activateTab("login");
}

function bindAuthEvents() {
  loginTabBtn.addEventListener("click", () => activateTab("login"));
  registerTabBtn.addEventListener("click", () => activateTab("register"));
  adminRoleBtn.addEventListener("click", () => setAuthRole("admin"));
  userRoleBtn.addEventListener("click", () => setAuthRole("user"));
  loginForm.addEventListener("submit", handleLogin);
  registerForm.addEventListener("submit", handleRegister);
  googleLoginBtn?.addEventListener("click", () => handleSocialLogin("Google"));
  facebookLoginBtn?.addEventListener("click", () => handleSocialLogin("Facebook"));
  logoutBtn.addEventListener("click", () => {
    clearSession();
    backToAuthGate();
  });
}

function saveProductsToLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch (error) {
    showStorageError(error);
    return false;
  }
}

async function loadProducts() {
  const localData = localStorage.getItem(STORAGE_KEY);

  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed)) {
        products = ensureUniqueSlugs(parsed.map(normalizeProduct));
        saveProductsToLocal();
        return;
      }
    } catch {
      // fallback ve fetch json
    }
  }

  try {
    const res = await fetch(cacheBust(DATA_URL), { method: "GET", cache: "no-store", headers: NO_CACHE_HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    products = Array.isArray(data) ? ensureUniqueSlugs(data.map(normalizeProduct)) : [];
  } catch {
    // Neu mo local file:// hoac host loi, van co du lieu de admin su dung
    products = ensureUniqueSlugs(FALLBACK_PRODUCTS.map(normalizeProduct));
  }

  saveProductsToLocal();
}

function renderAdminList() {
  if (!products.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">Chua co san pham.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = products
    .map((p) => {
      const safeName = escapeHtml(p.name);
      const safeCategory = escapeHtml(p.category || "Chưa phân loại");
      const safeSubCategory = escapeHtml(p.subCategory || "Khác");
      const safeDescription = escapeHtml(p.description);
      const safeLink = escapeHtml(p.affiliateLink);
      const safeImage = escapeHtml((p.images && p.images[0]) || p.image || FALLBACK_IMAGE);
      const mediaInfo = `${p.images?.length || 0} anh${p.videoUrl ? " + video" : ""}`;

      return `
        <tr data-id="${p.id}">
          <td><img src="${safeImage}" alt="${safeName}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" /></td>
          <td>${safeName}</td>
          <td>
            <div>${formatVnd(p.currentPrice)}</div>
            <small style="text-decoration: line-through; color: #6b7280;">${formatVnd(p.oldPrice)}</small>
          </td>
          <td>${p.discount}%</td>
          <td>${safeCategory}<br/><small style="color:#6b7280;">${safeSubCategory}</small></td>
          <td><a href="${safeLink}" target="_blank" rel="noopener">Link</a></td>
          <td>${safeDescription}<br/><small style="color:#6b7280;">${mediaInfo}</small></td>
          <td class="action-cell">
            <button class="btn-sm btn-edit" data-action="edit">Sua</button>
            <button class="btn-sm btn-delete" data-action="delete">Xoa</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function loadAffiliateClickLogs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(AFFILIATE_CLICK_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDateTime(timestamp) {
  if (!timestamp) return "-";
  const date = new Date(Number(timestamp));
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function renderAffiliateAnalytics() {
  if (!affiliateTotalClicksEl || !affiliateTopProductsBody) return;

  const logs = loadAffiliateClickLogs();
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const clicks7d = logs.filter((item) => Number(item.timestamp) >= weekAgo);

  affiliateTotalClicksEl.textContent = String(logs.length);
  affiliate7dClicksEl.textContent = String(clicks7d.length);

  const sourceMap = new Map();
  logs.forEach((item) => {
    const source = String(item.source || "unknown");
    sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
  });
  const topSource = [...sourceMap.entries()].sort((a, b) => b[1] - a[1])[0];
  affiliateTopSourceEl.textContent = topSource ? `${topSource[0]} (${topSource[1]})` : "-";

  const productNameById = new Map(products.map((item) => [String(item.id), item.name]));
  const productStats = new Map();
  logs.forEach((item) => {
    const productId = String(item.productId || "");
    const key = productId || String(item.productName || "unknown");
    if (!productStats.has(key)) {
      productStats.set(key, {
        id: productId,
        name: String(item.productName || productNameById.get(productId) || "Sản phẩm không rõ"),
        count: 0,
        latest: Number(item.timestamp) || 0,
        sourceMap: new Map()
      });
    }
    const stat = productStats.get(key);
    if (!stat) return;
    stat.count += 1;
    stat.latest = Math.max(stat.latest, Number(item.timestamp) || 0);
    const src = String(item.source || "unknown");
    stat.sourceMap.set(src, (stat.sourceMap.get(src) || 0) + 1);
  });

  const topProducts = [...productStats.values()]
    .sort((a, b) => b.count - a.count || b.latest - a.latest)
    .slice(0, 10);

  if (!topProducts.length) {
    affiliateTopProductsBody.innerHTML = '<tr><td colspan="4">Chưa có dữ liệu click.</td></tr>';
    return;
  }

  affiliateTopProductsBody.innerHTML = topProducts
    .map((item) => {
      const topSourceOfProduct = [...item.sourceMap.entries()].sort((a, b) => b[1] - a[1])[0];
      const sourceText = topSourceOfProduct ? `${topSourceOfProduct[0]} (${topSourceOfProduct[1]})` : "-";
      return `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${item.count}</td>
          <td>${escapeHtml(sourceText)}</td>
          <td>${formatDateTime(item.latest)}</td>
        </tr>
      `;
    })
    .join("");
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
    const response = await fetch(cacheBust(BLOG_DATA_URL), { method: "GET", cache: "no-store", headers: NO_CACHE_HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed = await response.json();
    blogContent = normalizeBlogContent(parsed);
  } catch {
    blogContent = { posts: [], faqs: [] };
  }
}

function saveBlogContent() {
  try {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(blogContent));
    return true;
  } catch (error) {
    showStorageError(error);
    return false;
  }
}

function sanitizeRepoPath(path, fallbackPath) {
  const safe = String(path || "").trim().replace(/^\/+/, "");
  return safe || fallbackPath;
}

function getGithubPublishConfigFromInputs() {
  const fallbackSessionToken = String(sessionStorage.getItem(SESSION_GITHUB_TOKEN_KEY) || "").trim();
  return {
    owner: String(githubOwnerInput?.value || "").trim(),
    repo: String(githubRepoInput?.value || "").trim(),
    branch: String(githubBranchInput?.value || "").trim() || "main",
    productsPath: sanitizeRepoPath(githubProductsPathInput?.value, "assets/data/products.json"),
    blogsPath: sanitizeRepoPath(githubBlogsPathInput?.value, "assets/data/blogs.json"),
    token: String(githubTokenInput?.value || "").trim() || fallbackSessionToken
  };
}

function saveGithubPublishConfig() {
  const cfg = getGithubPublishConfigFromInputs();
  const withoutToken = {
    owner: cfg.owner,
    repo: cfg.repo,
    branch: cfg.branch,
    productsPath: cfg.productsPath,
    blogsPath: cfg.blogsPath
  };
  localStorage.setItem(GITHUB_PUBLISH_CONFIG_KEY, JSON.stringify(withoutToken));
}

function hydrateGithubPublishConfig() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GITHUB_PUBLISH_CONFIG_KEY) || "{}");
    if (githubOwnerInput) githubOwnerInput.value = String(parsed.owner || githubOwnerInput.value || DEFAULT_GITHUB_PUBLISH_CONFIG.owner).trim();
    if (githubRepoInput) githubRepoInput.value = String(parsed.repo || githubRepoInput.value || DEFAULT_GITHUB_PUBLISH_CONFIG.repo).trim();
    if (githubBranchInput) githubBranchInput.value = String(parsed.branch || githubBranchInput.value || DEFAULT_GITHUB_PUBLISH_CONFIG.branch).trim();
    if (githubProductsPathInput) githubProductsPathInput.value = sanitizeRepoPath(parsed.productsPath, DEFAULT_GITHUB_PUBLISH_CONFIG.productsPath);
    if (githubBlogsPathInput) githubBlogsPathInput.value = sanitizeRepoPath(parsed.blogsPath, DEFAULT_GITHUB_PUBLISH_CONFIG.blogsPath);
  } catch {
    // ignore invalid saved config
  }
}

function hydrateGithubTokenPreference() {
  const remember = localStorage.getItem(REMEMBER_GITHUB_TOKEN_KEY) === "1";
  if (rememberGithubTokenInput) rememberGithubTokenInput.checked = remember;
  if (remember && githubTokenInput) {
    githubTokenInput.value = String(sessionStorage.getItem(SESSION_GITHUB_TOKEN_KEY) || "");
  }
}

function syncGithubTokenSession() {
  if (!rememberGithubTokenInput?.checked) {
    sessionStorage.removeItem(SESSION_GITHUB_TOKEN_KEY);
    return;
  }
  const token = String(githubTokenInput?.value || "").trim();
  if (token) sessionStorage.setItem(SESSION_GITHUB_TOKEN_KEY, token);
}

function hydrateAutoPublishSetting() {
  const enabled = localStorage.getItem(AUTO_GITHUB_PUBLISH_KEY) === "1";
  if (autoGithubPublishInput) autoGithubPublishInput.checked = enabled;
}

function saveAutoPublishSetting() {
  if (!autoGithubPublishInput) return;
  localStorage.setItem(AUTO_GITHUB_PUBLISH_KEY, autoGithubPublishInput.checked ? "1" : "0");
}

function setGithubPublishStatus(message, isError = false) {
  if (!githubPublishStatus) return;
  githubPublishStatus.textContent = message;
  githubPublishStatus.style.color = isError ? "#dc2626" : "#0f766e";
}

function toBase64Utf8(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  let binary = "";
  bytes.forEach((item) => {
    binary += String.fromCharCode(item);
  });
  return btoa(binary);
}

function buildGithubContentApiUrl(owner, repo, path) {
  const encodedPath = String(path || "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}`;
}

async function upsertGithubFile({ owner, repo, branch, token, path, content, message }) {
  const endpoint = buildGithubContentApiUrl(owner, repo, path);
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`
  };

  let sha = "";
  const checkRes = await fetch(`${endpoint}?ref=${encodeURIComponent(branch)}`, { headers });
  if (checkRes.ok) {
    const checkJson = await checkRes.json();
    sha = String(checkJson.sha || "");
  } else if (checkRes.status !== 404) {
    const errorJson = await checkRes.json().catch(() => ({}));
    throw new Error(errorJson.message || `Không đọc được file ${path} (${checkRes.status}).`);
  }

  const putRes = await fetch(endpoint, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      branch,
      content: toBase64Utf8(content),
      sha: sha || undefined
    })
  });

  if (!putRes.ok) {
    const errorJson = await putRes.json().catch(() => ({}));
    throw new Error(errorJson.message || `Xuất bản thất bại (${putRes.status}) với file ${path}.`);
  }
}

async function publishToGithub(options = {}) {
  const { silent = false, reason = "" } = options;
  if (isGithubPublishing) {
    if (!silent) alert("Đang có tiến trình xuất bản, vui lòng đợi xong.");
    return;
  }
  const cfg = getGithubPublishConfigFromInputs();
  if (!cfg.owner || !cfg.repo || !cfg.token) {
    if (!silent) alert("Vui lòng nhập Owner, Repository và GitHub Token.");
    return;
  }

  try {
    isGithubPublishing = true;
    githubPublishBtn.disabled = true;
    setGithubPublishStatus(reason ? `Đang xuất bản (${reason})...` : "Đang xuất bản dữ liệu lên GitHub...");
    saveGithubPublishConfig();
    syncGithubTokenSession();

    products = ensureUniqueSlugs(products.map(normalizeProduct));
    if (!saveProductsToLocal()) {
      throw new Error("Không lưu được dữ liệu cục bộ trước khi xuất bản.");
    }
    blogContent = normalizeBlogContent(blogContent);
    if (!saveBlogContent()) {
      throw new Error("Không lưu được dữ liệu blog cục bộ trước khi xuất bản.");
    }

    const now = new Date().toLocaleString("vi-VN");
    await upsertGithubFile({
      owner: cfg.owner,
      repo: cfg.repo,
      branch: cfg.branch,
      token: cfg.token,
      path: cfg.productsPath,
      content: JSON.stringify(products, null, 2),
      message: `publish products from admin (${now})`
    });
    await upsertGithubFile({
      owner: cfg.owner,
      repo: cfg.repo,
      branch: cfg.branch,
      token: cfg.token,
      path: cfg.blogsPath,
      content: JSON.stringify(blogContent, null, 2),
      message: `publish blogs from admin (${now})`
    });

    if (!rememberGithubTokenInput?.checked) {
      githubTokenInput.value = "";
      sessionStorage.removeItem(SESSION_GITHUB_TOKEN_KEY);
    }
    setGithubPublishStatus(`Xuất bản thành công lúc ${now}.`);
    if (!silent) {
      alert("Đã xuất bản lên GitHub. Đợi GitHub Pages build 1-2 phút, sau đó purge cache Cloudflare.");
    }
  } catch (error) {
    console.error(error);
    setGithubPublishStatus(`Lỗi: ${error.message}`, true);
    if (!silent) alert(`Xuất bản thất bại: ${error.message}`);
  } finally {
    isGithubPublishing = false;
    githubPublishBtn.disabled = false;
  }
}

function triggerAutoPublish(reason = "auto") {
  if (!autoGithubPublishInput?.checked) return;
  publishToGithub({ silent: true, reason });
}

function resetBlogPostForm() {
  blogPostForm?.reset();
  if (blogPostIdInput) blogPostIdInput.value = "";
}

function resetFaqForm() {
  faqForm?.reset();
  if (faqIdInput) faqIdInput.value = "";
}

function renderBlogManagement() {
  if (blogPostTableBody) {
    if (!blogContent.posts.length) {
      blogPostTableBody.innerHTML = '<tr><td colspan="4">Chưa có bài viết.</td></tr>';
    } else {
      blogPostTableBody.innerHTML = blogContent.posts
        .map((item) => `
          <tr data-id="${item.id}">
            <td>${escapeHtml(item.title)}<br/><small style="color:#64748b;">${escapeHtml(item.summary)}</small></td>
            <td>${escapeHtml(item.tag)}</td>
            <td><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.url)}</a></td>
            <td class="action-cell">
              <button class="btn-sm btn-edit" data-action="edit-blog">Sua</button>
              <button class="btn-sm btn-delete" data-action="delete-blog">Xoa</button>
            </td>
          </tr>
        `)
        .join("");
    }
  }

  if (faqTableBody) {
    if (!blogContent.faqs.length) {
      faqTableBody.innerHTML = '<tr><td colspan="3">Chưa có FAQ.</td></tr>';
    } else {
      faqTableBody.innerHTML = blogContent.faqs
        .map((item) => `
          <tr data-id="${item.id}">
            <td>${escapeHtml(item.question)}</td>
            <td>${escapeHtml(item.answer)}</td>
            <td class="action-cell">
              <button class="btn-sm btn-edit" data-action="edit-faq">Sua</button>
              <button class="btn-sm btn-delete" data-action="delete-faq">Xoa</button>
            </td>
          </tr>
        `)
        .join("");
    }
  }
}

function resetForm() {
  const keepCategory = categoryInput.value;
  form.reset();
  productIdInput.value = "";
  existingImagesInput.value = "[]";
  existingVideoInput.value = "";
  imageFileInput.value = "";
  videoFileInput.value = "";
  uploadedBase64Images = [];
  uploadedBase64Video = "";
  isImageProcessing = false;
  isVideoProcessing = false;
  refreshCategoryOptions(keepCategory);
}

function fillFormForEdit(product) {
  productIdInput.value = product.id;
  existingImagesInput.value = JSON.stringify(product.images || []);
  existingVideoInput.value = product.videoUrl || "";
  nameInput.value = product.name;
  imageUrlsInput.value = (product.images || [])
    .filter((url) => !String(url).startsWith("data:"))
    .join("\n");
  videoUrlInput.value = String(product.videoUrl || "").startsWith("data:") ? "" : (product.videoUrl || "");
  currentPriceInput.value = product.currentPrice;
  oldPriceInput.value = product.oldPrice;
  discountInput.value = product.discount;
  affiliateLinkInput.value = product.affiliateLink;
  refreshCategoryOptions(product.category, product.subCategory || "");
  tagsInput.value = (product.tags || []).join(", ");
  descriptionInput.value = product.description;
  detailsInput.value = product.details || "";
  specsInput.value = (product.specs || []).join("\n");
}

function collectFormData() {
  const editingProduct = products.find((item) => item.id === productIdInput.value);
  let existingImages = [];
  try {
    existingImages = JSON.parse(existingImagesInput.value || "[]");
    if (!Array.isArray(existingImages)) existingImages = [];
  } catch {
    existingImages = [];
  }

  const mergedImages = [
    ...parseMultilineUrls(imageUrlsInput.value),
    ...uploadedBase64Images,
    ...existingImages
  ].filter(Boolean);
  const uniqueImages = [...new Set(mergedImages)];
  if (!uniqueImages.length) uniqueImages.push(FALLBACK_IMAGE);

  const specs = String(specsInput.value || "")
    .split(/\r?\n/g)
    .map((item) => item.trim())
    .filter(Boolean);

  const finalVideo = videoUrlInput.value.trim() || uploadedBase64Video || existingVideoInput.value.trim() || "";

  return normalizeProduct({
    id: productIdInput.value || makeId(),
    slug: editingProduct?.slug || "",
    name: nameInput.value.trim(),
    image: uniqueImages[0],
    images: uniqueImages,
    videoUrl: finalVideo,
    currentPrice: Number(currentPriceInput.value),
    oldPrice: Number(oldPriceInput.value),
    discount: Number(discountInput.value),
    affiliateLink: affiliateLinkInput.value.trim(),
    category: categoryInput.value,
    subCategory: subCategoryInput.value.trim(),
    tags: normalizeTags(tagsInput.value),
    description: descriptionInput.value.trim(),
    details: detailsInput.value.trim(),
    specs
  });
}

function validateProduct(product) {
  if (!product.name) return "Ten san pham la bat buoc.";
  if (String(product.category || "").startsWith("__")) return "Vui long chon danh muc hop le.";
  if (String(product.subCategory || "").startsWith("__")) return "Vui long chon danh muc con hop le.";
  if (!product.category) return "Vui long chon danh muc.";
  if (!product.subCategory) return "Vui long chon danh muc con.";
  if (!Array.isArray(product.images) || !product.images.length) return "Can it nhat 1 hinh anh.";
  if (!product.affiliateLink) return "Affiliate link la bat buoc.";
  if (!/^https?:\/\/\S+/i.test(product.affiliateLink)) {
    return "Affiliate link phai bat dau bang http:// hoac https://";
  }
  if (!product.description) return "Mo ta ngan la bat buoc.";
  if (product.currentPrice <= 0 || product.oldPrice <= 0) return "Gia phai lon hon 0.";
  if (product.oldPrice < product.currentPrice) return "Gia cu phai lon hon hoac bang gia hien tai.";
  if (product.discount < 0 || product.discount > 99) return "Discount tu 0 den 99.";
  return "";
}

function upsertProduct(product) {
  const index = products.findIndex((p) => p.id === product.id);
  if (index >= 0) products[index] = product;
  else products.unshift(product);
  products = ensureUniqueSlugs(products);

  if (!saveProductsToLocal()) return;
  refreshCategoryOptions(product.category, product.subCategory || "Khác");
  renderAdminList();
  renderAffiliateAnalytics();
  resetForm();
  triggerAutoPublish("lưu sản phẩm");
}

function deleteProductById(id) {
  const ok = confirm("Ban chac chan muon xoa san pham nay?");
  if (!ok) return;
  products = products.filter((p) => p.id !== id);
  if (!saveProductsToLocal()) return;
  refreshCategoryOptions();
  renderAdminList();
  renderAffiliateAnalytics();
  triggerAutoPublish("xóa sản phẩm");
}

function exportJsonFile() {
  const jsonString = JSON.stringify(products, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importJsonFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "[]"));
      if (!Array.isArray(parsed)) throw new Error("JSON khong dung dinh dang array.");
      products = ensureUniqueSlugs(parsed.map(normalizeProduct));
      if (!saveProductsToLocal()) return;
      refreshCategoryOptions();
      renderAdminList();
      renderAffiliateAnalytics();
      alert("Import JSON thanh cong.");
      triggerAutoPublish("import sản phẩm");
    } catch (error) {
      console.error(error);
      alert("Import that bai: file JSON khong hop le.");
    } finally {
      importFileInput.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function bindDashboardEvents() {
  imageFileInput.addEventListener("change", (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (files.length > 6) {
      alert("Toi da 6 anh moi lan upload.");
      imageFileInput.value = "";
      return;
    }

    const compressImageFile = (file) =>
      new Promise((resolve) => {
        if (file.size > 8 * 1024 * 1024) {
          resolve("");
          return;
        }
        const img = new Image();
        const reader = new FileReader();
        reader.onload = () => {
          img.src = String(reader.result || "");
        };
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 720;
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve("");
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          let quality = 0.75;
          let result = canvas.toDataURL("image/jpeg", quality);
          while (result.length > 420_000 && quality > 0.45) {
            quality -= 0.1;
            result = canvas.toDataURL("image/jpeg", quality);
          }
          resolve(result);
        };
        img.onerror = () => resolve("");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      });

    isImageProcessing = true;
    Promise.all(files.map((file) => compressImageFile(file)))
      .then((results) => {
        uploadedBase64Images = results.filter(Boolean);
        if (!uploadedBase64Images.length) {
          alert("Khong xu ly duoc anh nao. Thu anh khac hoac dung URL.");
        }
      })
      .finally(() => {
        isImageProcessing = false;
      });
  });

  videoFileInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      alert("Video qua lon (>12MB). Nen dung video URL de toi uu.");
      videoFileInput.value = "";
      return;
    }

    isVideoProcessing = true;
    uploadedBase64Video = "";
    const reader = new FileReader();
    reader.onload = () => {
      uploadedBase64Video = String(reader.result || "");
      isVideoProcessing = false;
    };
    reader.onerror = () => {
      uploadedBase64Video = "";
      isVideoProcessing = false;
      alert("Khong doc duoc video. Thu lai hoac dung URL.");
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (isImageProcessing || isVideoProcessing) {
      alert("Media dang duoc xu ly, vui long doi 1-2 giay roi bam Luu lai.");
      return;
    }

    const hasSelectedFile = Boolean(imageFileInput.files?.length);
    let existingImages = [];
    try {
      existingImages = JSON.parse(existingImagesInput.value || "[]");
      if (!Array.isArray(existingImages)) existingImages = [];
    } catch {
      existingImages = [];
    }
    const hasImageReady = Boolean(parseMultilineUrls(imageUrlsInput.value).length || uploadedBase64Images.length || existingImages.length);
    if (hasSelectedFile && !hasImageReady) {
      const ok = confirm("Anh upload chua san sang. Ban muon luu tam voi anh mac dinh khong?");
      if (!ok) return;
    }

    const product = collectFormData();
    const error = validateProduct(product);
    if (error) {
      alert(error);
      return;
    }
    upsertProduct(product);
  });

  resetFormBtn.addEventListener("click", resetForm);
  categoryInput.addEventListener("change", () => {
    if (categoryInput.value !== "__add_new_category__") {
      populateSubCategoryOptions(categoryInput.value);
      return;
    }
    const name = String(prompt("Nhập tên danh mục mới (ví dụ: Thiết bị làm đẹp):", "") || "").trim();
    if (!name) {
      refreshCategoryOptions();
      return;
    }
    categorySubCategoryMap[name] = categorySubCategoryMap[name] || ["Khác"];
    refreshCategoryOptions(name, "Khác");
  });
  subCategoryInput.addEventListener("change", () => {
    if (subCategoryInput.value !== "__add_new_subcategory__") return;
    const category = String(categoryInput.value || "").trim();
    if (!category || category === "__add_new_category__") {
      refreshCategoryOptions();
      return;
    }
    const subName = String(prompt(`Nhập danh mục con mới cho "${category}":`, "") || "").trim();
    if (!subName) {
      populateSubCategoryOptions(category);
      return;
    }
    categorySubCategoryMap[category] = categorySubCategoryMap[category] || [];
    pushUniqueLabel(categorySubCategoryMap[category], subName);
    categorySubCategoryMap[category].sort((a, b) => a.localeCompare(b, "vi"));
    populateSubCategoryOptions(category, subName);
  });

  tableBody.addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    if (!action) return;
    const tr = event.target.closest("tr");
    if (!tr) return;
    const id = tr.dataset.id;
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (action === "edit") {
      fillFormForEdit(product);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (action === "delete") deleteProductById(id);
  });

  exportBtn.addEventListener("click", exportJsonFile);
  importBtn.addEventListener("click", () => importFileInput.click());
  importFileInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    importJsonFile(file);
  });
  githubPublishBtn?.addEventListener("click", publishToGithub);
  autoGithubPublishInput?.addEventListener("change", saveAutoPublishSetting);
  rememberGithubTokenInput?.addEventListener("change", () => {
    localStorage.setItem(REMEMBER_GITHUB_TOKEN_KEY, rememberGithubTokenInput.checked ? "1" : "0");
    if (!rememberGithubTokenInput.checked) {
      sessionStorage.removeItem(SESSION_GITHUB_TOKEN_KEY);
      githubTokenInput.value = "";
    } else {
      syncGithubTokenSession();
    }
  });
  githubTokenInput?.addEventListener("input", syncGithubTokenSession);

  blogPostForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = blogTitleInput.value.trim();
    const summary = blogSummaryInput.value.trim();
    const url = blogUrlInput.value.trim();
    const tag = blogTagInput.value.trim() || "Review";
    const ctaText = blogCtaTextInput.value.trim() || "Xem thêm";
    if (!title || !summary || !url) {
      alert("Vui long nhap day du tieu de, tom tat va link bai viet.");
      return;
    }
    const post = normalizeBlogPost({
      id: blogPostIdInput.value || `blog_${Date.now()}`,
      title,
      summary,
      url,
      tag,
      ctaText
    });
    const index = blogContent.posts.findIndex((item) => item.id === post.id);
    if (index >= 0) blogContent.posts[index] = post;
    else blogContent.posts.unshift(post);
    if (!saveBlogContent()) return;
    renderBlogManagement();
    resetBlogPostForm();
    triggerAutoPublish("lưu bài viết");
  });

  faqForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = faqQuestionInput.value.trim();
    const answer = faqAnswerInput.value.trim();
    if (!question || !answer) {
      alert("Vui long nhap day du cau hoi va tra loi FAQ.");
      return;
    }
    const faq = normalizeFaqItem({
      id: faqIdInput.value || `faq_${Date.now()}`,
      question,
      answer
    });
    const index = blogContent.faqs.findIndex((item) => item.id === faq.id);
    if (index >= 0) blogContent.faqs[index] = faq;
    else blogContent.faqs.unshift(faq);
    if (!saveBlogContent()) return;
    renderBlogManagement();
    resetFaqForm();
    triggerAutoPublish("lưu FAQ");
  });

  resetBlogPostBtn?.addEventListener("click", resetBlogPostForm);
  resetFaqBtn?.addEventListener("click", resetFaqForm);

  blogPostTableBody?.addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    if (!action) return;
    const tr = event.target.closest("tr");
    if (!tr) return;
    const id = tr.dataset.id;
    const item = blogContent.posts.find((post) => post.id === id);
    if (!item) return;
    if (action === "edit-blog") {
      blogPostIdInput.value = item.id;
      blogTitleInput.value = item.title;
      blogSummaryInput.value = item.summary;
      blogUrlInput.value = item.url;
      blogTagInput.value = item.tag;
      blogCtaTextInput.value = item.ctaText;
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (action === "delete-blog") {
      if (!confirm("Ban chac chan muon xoa bai viet nay?")) return;
      blogContent.posts = blogContent.posts.filter((post) => post.id !== id);
      if (!saveBlogContent()) return;
      renderBlogManagement();
      resetBlogPostForm();
      triggerAutoPublish("xóa bài viết");
    }
  });

  faqTableBody?.addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    if (!action) return;
    const tr = event.target.closest("tr");
    if (!tr) return;
    const id = tr.dataset.id;
    const item = blogContent.faqs.find((faq) => faq.id === id);
    if (!item) return;
    if (action === "edit-faq") {
      faqIdInput.value = item.id;
      faqQuestionInput.value = item.question;
      faqAnswerInput.value = item.answer;
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (action === "delete-faq") {
      if (!confirm("Ban chac chan muon xoa FAQ nay?")) return;
      blogContent.faqs = blogContent.faqs.filter((faq) => faq.id !== id);
      if (!saveBlogContent()) return;
      renderBlogManagement();
      resetFaqForm();
      triggerAutoPublish("xóa FAQ");
    }
  });
}

async function initDashboard() {
  await loadProducts();
  await loadBlogContent();
  hydrateGithubPublishConfig();
  hydrateGithubTokenPreference();
  hydrateAutoPublishSetting();
  setGithubPublishStatus("Sẵn sàng xuất bản.");
  refreshCategoryOptions();
  renderAdminList();
  renderAffiliateAnalytics();
  renderBlogManagement();
  bindDashboardEvents();
  window.addEventListener("storage", (event) => {
    if (event.key === AFFILIATE_CLICK_KEY) renderAffiliateAnalytics();
  });
  dashboardInitialized = true;
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

function initAuthFlow() {
  initBottomNavActive();
  seedDefaultAccounts();
  bindAuthEvents();
  setAuthRole("admin");
  activateTab("login");

  const session = getSession();
  if (session?.role === "admin") {
    enterDashboard();
  } else {
    backToAuthGate();
    if (session?.role === "user") {
      showAuthMessage("Tài khoản thường không có quyền vào khu quản trị.", true);
    }
  }
}

initAuthFlow();
