const fs = require("fs");
const path = "index.html";
const tag = '<script src="/luna-overrides.js"></script>';
let html = fs.readFileSync(path, "utf8");
if (!html.includes(tag)) {
  html = html.replace("</body>", tag + "\n</body>");
  fs.writeFileSync(path, html);
}
