// scripts/clean-dist.mjs
// Remove compiled test files and __mocks__ from dist/ to prevent duplicate mock warnings.
import fs from 'fs';
import path from 'path';

// Try to import qerrors for consistent error reporting
let qerrors = null;
try {
  const qerrorsModule = await import('qerrors');
  qerrors = qerrorsModule.qerrors;
} catch {
  // qerrors not available, continue without it
}

function rmDirSafe(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch (error) {
    if (qerrors) {
      qerrors(error instanceof Error ? error : new Error(String(error)), 'rmDirSafe', `Directory removal failed for: ${p}`);
    }
  }
}

function cleanDist(root) {
  const dist = path.join(root, 'dist');
  try {
    if (!fs.existsSync(dist)) return;
  } catch (error) {
    if (qerrors) {
      qerrors(error instanceof Error ? error : new Error(String(error)), 'cleanDist', `Dist directory check failed for: ${dist}`);
    }
    return;
  }
  
  const stack = [dist];
  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      if (qerrors) {
        qerrors(error instanceof Error ? error : new Error(String(error)), 'cleanDist', `Directory read failed for: ${dir}`);
      }
      continue;
    }
    
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      
      if (ent.isDirectory()) {
        if (ent.name === '__mocks__') {
          rmDirSafe(full);
          continue;
        }
        stack.push(full);
        continue;
      }
      
      if (!ent.isFile()) continue;
      
      if (/\.(test|spec)\.[cm]?jsx?$/.test(ent.name) || /GeneratedTest/.test(ent.name)) {
        try {
          fs.rmSync(full, { force: true });
        } catch (error) {
          if (qerrors) {
            qerrors(error instanceof Error ? error : new Error(String(error)), 'cleanDist', `Test file removal failed for: ${full}`);
          }
        }
      }
    }
  }
}

cleanDist(process.cwd());
