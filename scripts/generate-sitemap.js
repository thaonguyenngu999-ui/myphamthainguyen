#!/usr/bin/env node
/**
 * Tạo sitemap.xml chuẩn SEO 2026 từ products.json
 * Chạy: node scripts/generate-sitemap.js
 */

const fs = require("fs");
const path = require("path");

const SITE_URL = "https://myphamthainguyen.com";
const TODAY = new Date().toISOString().split("T")[0];

const STATIC_PAGES = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/index.html", priority: "1.0", changefreq: "daily" },
  { loc: "/san-pham.html", priority: "0.95", changefreq: "daily" },
  { loc: "/sale.html", priority: "0.95", changefreq: "daily" },
  { loc: "/san-pham/chong-nang.html", priority: "0.85", changefreq: "weekly" },
  { loc: "/trung-tam-tro-giup.html", priority: "0.6", changefreq: "monthly" },
  { loc: "/huong-dan-mua-hang.html", priority: "0.6", changefreq: "monthly" },
  { loc: "/doi-tra-hoan-tien.html", priority: "0.6", changefreq: "monthly" },
  { loc: "/lien-he-ho-tro.html", priority: "0.6", changefreq: "monthly" },
  { loc: "/ve-chung-toi.html", priority: "0.6", changefreq: "monthly" },
  { loc: "/dieu-khoan-su-dung.html", priority: "0.5", changefreq: "monthly" },
  { loc: "/chinh-sach-bao-mat.html", priority: "0.5", changefreq: "monthly" },
  { loc: "/kenh-nguoi-ban.html", priority: "0.5", changefreq: "monthly" },
];

function slugify(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapeXml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

let products = [];
const productsPath = path.join(__dirname, "../assets/data/products.json");
if (fs.existsSync(productsPath)) {
  try {
    products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
  } catch (e) {
    console.warn("Khong doc duoc products.json:", e.message);
  }
}

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

for (const page of STATIC_PAGES) {
  const url = SITE_URL + (page.loc === "/" ? "" : page.loc);
  xml += `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
}

for (const p of products) {
  const slug = p.slug || slugify(p.name || p.id);
  const loc = `${SITE_URL}/san-pham/${encodeURIComponent(slug)}`;
  const img = p.images?.[0] || p.image || "";
  const title = escapeXml(p.name || "San pham");

  xml += `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>`;
  if (img) {
    xml += `
    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${title}</image:title>
    </image:image>`;
  }
  xml += `
  </url>
`;
}

xml += "</urlset>\n";

const outPath = path.join(__dirname, "../sitemap.xml");
fs.writeFileSync(outPath, xml, "utf8");
console.log("Da tao sitemap.xml voi", STATIC_PAGES.length + products.length, "URL");
