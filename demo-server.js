const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

function serveFile(res, fullPath) {
  const ext = path.extname(fullPath);
  const type = mime[ext] || 'text/plain';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(fullPath).pipe(res);
}

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/demo.html';
  const fullPath = path.join(root, reqPath);
  fs.stat(fullPath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    serveFile(res, fullPath);
  });
});

const port = process.env.DEMO_PORT || 3000;
server.listen(port, () => {
  console.log(`Demo server listening on http://localhost:${port}`);
});
