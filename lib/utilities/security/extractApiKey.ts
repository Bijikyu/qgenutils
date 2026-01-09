import { qerrors } from 'qerrors';

export interface ExtractApiKeyOptions {
  headerNames?: string[];
  queryParam?: string;
  authPrefix?: string;
  checkBody?: boolean;
  bodyField?: string;
}

export interface Request {
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
}

const extractApiKey = (req: Request, options: ExtractApiKeyOptions = {}): string | null => {
  try {
    if (!req || typeof req !== 'object') return null;
    
    const {
      headerNames = ['x-api-key', 'api-key'],
      queryParam = 'api_key',
      authPrefix = 'Bearer ',
      checkBody = false,
      bodyField = 'api_key'
    } = options;
    
    const headers: Record<string, string | string[] | undefined> = req.headers || {};
    if (!headers || typeof headers !== 'object') return null;
    
    const authHeader = headers.authorization || headers.Authorization;
    if (authHeader && typeof authHeader === 'string') {
      const lowerAuthHeader = authHeader.toLowerCase();
      const lowerAuthPrefix = authPrefix.toLowerCase();
      if (lowerAuthHeader.startsWith(lowerAuthPrefix)) {
        const token = authHeader.slice(authPrefix.length).trim();
        if (token) return token;
      }
    }
    
    for (const headerName of headerNames) {
      const lowerName: string = headerName.toLowerCase();
      const value: string | string[] | undefined = headers[lowerName] || headers[headerName];
      if (value) {
        if (typeof value === 'string') {
          const trimmed: string = value.trim();
          if (trimmed) return trimmed;
        } else if (Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === 'string') {
              const trimmed: string = item.trim();
              if (trimmed) return trimmed;
            }
          }
        }
      }
    }
    
    const query: Record<string, string | string[] | undefined> = req.query || {};
    if (queryParam && query[queryParam]) {
      const value: string | string[] | undefined = query[queryParam];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    
    if (checkBody && req.body && typeof req.body === 'object') {
      const value: unknown = req.body?.[bodyField];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    
    return null;
  } catch (err) {
    qerrors(err instanceof Error ? err : new Error(String(err)), 'extractApiKey', 'API key extraction failed unexpectedly');
    return null;
  }
};

export default extractApiKey;