#!/bin/bash

# Fix common TypeScript conversion issues in utility files

cd /home/runner/workspace/lib/utilities

echo "Fixing common TypeScript issues..."

# Fix common import patterns
find . -name "*.ts" -not -name "*.test.ts" -exec sed -i 's/const { \([^}]*\) } = require('\''\([^'\'']*\)'\'');/import { \1 } from '\''\2'\'';/g' {} \;

# Fix logger imports 
find . -name "*.ts" -not -name "*.test.ts" -exec sed -i "s/const logger = require('\.\.\/\.\.\/logger');/import logger from '..\/..\/logger.js';/g" {} \;
find . -name "*.ts" -not -name "*.test.ts" -exec sed -i "s/const logger = require('\.\.\/\.\.\/\.\.\/logger');/import logger from '..\/..\/..\/logger.js';/g" {} \;
find . -name "*.ts" -not -name "*.test.ts" -exec sed -i "s/const logger = require('\.\.\/\.\.\/\.\.\/\.\.\/logger');/import logger from '..\/..\/..\/..\/logger.js';/g" {} \;

# Fix qerrors import
find . -name "*.ts" -not -name "*.test.ts" -exec sed -i "s/const { qerrors } = require('qerrors');/import { qerrors } from 'qerrors';/g" {} \;

# Fix helper imports
find . -name "*.ts" -not -name "*.test.ts" -exec sed -i "s/const \([^=]*\) = require('\.\.\/\.\.\/helpers\/\([^']*\)');/import \1 from '..\/..\/helpers\/\2.js';/g" {} \;

# Fix module.exports to export default 
find . -name "*.ts" -not -name "*.test.ts" -exec sed -i 's/module\.exports = /export default /g' {} \;

# Fix module.exports = { to export {
find . -name "*.ts" -not -name "*.test.ts" -exec sed -i 's/module\.exports = {/export {/g' {} \;

# Add basic function types for simple functions (this is a heuristic)
find . -name "*.ts" -not -name "*.test.ts" -exec sed -i 's/function \([^(]*)(\([^)]*\)) {/function \1(\2: any): any {/g' {} \;

# Fix const variable types where there are simple assignments
find . -name "*.ts" -not -name "*.test.ts" -exec sed -i 's/const \([a-zA-Z_][a-zA-Z0-9_]*\) = \([^;]*\);/const \1: any = \2;/g' {} \;

echo "TypeScript fixes applied!"