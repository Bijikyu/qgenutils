#!/usr/bin/env node

// Auto-fix script for critical import and qerrors issues
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'lib/utilities/url/parseUrlParts.ts',
  'lib/utilities/url/ensureProtocol.ts', 
  'lib/utilities/url/stripProtocol.ts',
  'lib/utilities/url/normalizeUrlOrigin.ts',
  'lib/utilities/datetime/formatDateTime.ts',
  'lib/utilities/datetime/formatDate.ts',
  'lib/utilities/datetime/formatDuration.ts',
  'lib/utilities/datetime/addDays.ts',
  'lib/utilities/id-generation/generateExecutionId.ts'
];

// Fix qerrors API calls
function fixQerrorsCalls(content) {
  return content
    // Fix qerrors calls with third parameter
    .replace(/qerrors\(([^,]+),\s*`([^`]+)`,\s*{([^}]+)}\s*\)/g, 
      'qerrors($1, `$2`)')
    // Fix error.message without type check
    .replace(/error\.message/g, 'error instanceof Error ? error.message : String(error)');
}

// Fix require() imports
function fixRequireImports(content, filePath) {
  // Extract directory path
  const dir = path.dirname(filePath);
  
  // Replace require() calls with import statements
  content = content.replace(/const\s+(\w+):\s*any\s*=\s*require\(['"`]([^'"`]+)['"`]\);?/g, 
    (match, varName, modulePath) => {
      // Convert relative path to proper import
      const importPath = modulePath.startsWith('./') ? modulePath : `./${modulePath}`;
      return `import ${varName} from '${importPath}';`;
    });
  
  return content;
}

// Process each file
filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Fixing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = fixRequireImports(content, filePath);
    content = fixQerrorsCalls(content);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Critical fixes applied successfully!');