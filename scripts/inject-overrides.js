const fs = require("fs");
const path = "index.html";
const tag = '<script src="/luna-overrides.js"></script>';
let html = fs.readFileSync(path, "utf8");

// Remove the Wellness Journal section from the source at build time.
// This is done before the override script is injected so the section
// cannot be recreated by the original render logic.
html = html.replace(
  /\s*<section class="section" style="padding-top:28px;">\s*<div class="section-head"><div><h2>Luna Wellness Journal<\/h2><p class="small-note" style="padding:4px 0 0;">Simple tips for a healthier everyday life\.<\/p><\/div><\/div>\s*<div class="wellness-carousel" id="wellness-carousel"><\/div>\s*<\/section>\s*/,
  "\n"
);

if (!html.includes(tag)) {
  html = html.replace("</body>", tag + "\n</body>");
}

fs.writeFileSync(path, html);
