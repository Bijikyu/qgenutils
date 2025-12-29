import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import QGenUtils utilities  
import QGenUtils from './dist/index.js';

// Import centralized environment variables
import { PORT as CENTRALIZED_PORT } from './config/localVars.js';

const PORT = CENTRALIZED_PORT || 3000;
server.listen(PORT, () => {
  console.log(`QGenUtils demo server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to view the demo`);
});