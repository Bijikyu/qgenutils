// Ensures qtests-runner.mjs exists at project root by copying a valid shipped template.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = process.cwd();

// Try to import qerrors for consistent error reporting
let qerrors = null;
try {
  const qerrorsModule = await import('@bijikyu/qerrors');
  qerrors = qerrorsModule.qerrors;
} catch {
  // qerrors not available, continue without it
}

function isValid(content) {
  try {
    return /runCLI/.test(content) && /API Mode/.test(content);
  } catch (error) {
    if (qerrors) {
      qerrors(error instanceof Error ? error : new Error(String(error)), 'isValid', 'Template validation check failed');
    }
    return false;
  }
}

try {
  const target = path.join(cwd, 'qtests-runner.mjs');
  
  try {
    if (!fs.existsSync(target)) {
      const candidates = [
        path.join(cwd, 'lib', 'templates', 'qtests-runner.mjs.template'),
        path.join(cwd, 'templates', 'qtests-runner.mjs.template'),
        path.join(cwd, 'node_modules', 'qtests', 'lib', 'templates', 'qtests-runner.mjs.template'),
        path.join(cwd, 'node_modules', 'qtests', 'templates', 'qtests-runner.mjs.template')
      ];
      
      let content = null;
      
      for (const p of candidates) {
        try {
          if (fs.existsSync(p)) {
            const c = await fs.promises.readFile(p, 'utf8');
            if (isValid(c)) {
              content = c;
              break;
            }
          }
        } catch (error) {
          if (qerrors) {
            qerrors(error instanceof Error ? error : new Error(String(error)), 'ensureRunner', `Template read failed for: ${p}`);
          }
        }
      }
      
      if (!content) {
        if (qerrors) {
          qerrors(new Error('No valid template found'), 'ensureRunner', 'Template search failed');
        }
      } else {
        try {
          await fs.promises.writeFile(target, content, 'utf8');
        } catch (error) {
          if (qerrors) {
            qerrors(error instanceof Error ? error : new Error(String(error)), 'ensureRunner', `Template write failed for: ${target}`);
          }
        }
      }
    }
  } catch (error) {
    if (qerrors) {
      qerrors(error instanceof Error ? error : new Error(String(error)), 'ensureRunner', `Target file check failed for: ${target}`);
    }
  }
} catch (error) {
  if (qerrors) {
    qerrors(error instanceof Error ? error : new Error(String(error)), 'ensureRunner', 'Runner ensure process failed');
  }
}
