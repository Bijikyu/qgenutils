#!/bin/bash

# Convert all JS files to TS in lib/utilities directory
# This script converts require() to import and module.exports to export

cd /home/runner/workspace/lib/utilities

# Function to convert a single file
convert_file() {
    local file="$1"
    if [[ ! -f "$file" ]] || [[ "$file" == *.test.js ]] || [[ "$file" == *.ts ]]; then
        return
    fi
    
    echo "Converting $file"
    local ts_file="${file%.js}.ts"
    mv "$file" "$ts_file"
    
    # Basic conversions using sed
    sed -i "s/const { \([^}]*\) } = require('\([^']*\)');/import { \1 } from '\2';/g" "$ts_file"
    sed -i "s/const { qerrors } = require('@bijikyu/qerrors');/import { qerrors } from '@bijikyu/qerrors';/g" "$ts_file"
    sed -i "s/const logger = require('\.\./\.\./logger');/import logger from '..\/..\/logger.js';/g" "$ts_file"
    sed -i "s/const logger = require('\.\./\.\./\.\./logger');/import logger from '..\/..\/..\/logger.js';/g" "$ts_file"
    sed -i "s/const logger = require('\.\./\.\./\.\./\.\./logger');/import logger from '..\/..\/..\/..\/logger.js';/g" "$ts_file"
    sed -i "s/const \([^=]*\) = require('\.\./\.\./helpers/\([^']*\)');/import \1 from '..\/..\/helpers\/\2.js';/g" "$ts_file"
    sed -i "s/module.exports = /export default /g" "$ts_file"
    sed -i "s/module.exports = {/export {/g" "$ts_file"
    
    # Add basic TypeScript types for common patterns
    sed -i 's/function \([^(]*)(\([^)]*\))/function \1(\2: any)/g' "$ts_file"
}

# Convert files in current directory and subdirectories
find . -name "*.js" -not -name "*.test.js" | while read file; do
    convert_file "$file"
done

echo "Conversion completed!"