const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

http.createServer((req, res) => {
  const pathname = decodeURIComponent(req.url.split("?")[0]);
  const requested = path.normalize(path.join(root, pathname === "/" ? "index.html" : pathname));
  if (!requested.startsWith(root) || !fs.existsSync(requested) || fs.statSync(requested).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const stat = fs.statSync(requested);
  const type = types[path.extname(requested).toLowerCase()] || "application/octet-stream";
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Type", type);

  const range = req.headers.range;
  if (range) {
    const [startText, endText] = range.replace("bytes=", "").split("-");
    const start = Number(startText);
    const end = endText ? Number(endText) : stat.size - 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Content-Length": end - start + 1,
    });
    fs.createReadStream(requested, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { "Content-Length": stat.size });
    fs.createReadStream(requested).pipe(res);
  }
}).listen(4173, "127.0.0.1", () => {
  console.log("Portfolio preview: http://127.0.0.1:4173");
});
