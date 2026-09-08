import { Request, Response, NextFunction } from 'express';
import { createAuditLog } from '../services/audit-log.service';
import { AuthenticatedRequest } from './auth.middleware';

const SENSITIVE_KEYS = /password|token|secret|authorization|cookie|api[_-]?key|refresh/i;
const MAX_BODY_LENGTH = 10_000;

const sanitize = (value: unknown): unknown => {
  if (value === undefined || value === null) return value;
  if (typeof value === 'string') return value.length > MAX_BODY_LENGTH ? `${value.slice(0, MAX_BODY_LENGTH)}...[truncated]` : value;
  if (Array.isArray(value)) return value.slice(0, 100).map(sanitize);
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      result[key] = SENSITIVE_KEYS.test(key) ? '[REDACTED]' : sanitize(entry);
    }
    return result;
  }
  return value;
};

const shouldLog = (req: Request) =>
  req.path.startsWith('/api/v1/') &&
  !req.path.startsWith('/api/v1/audit-logs') &&
  req.path !== '/api/v1/health' &&
  !req.path.includes('/swagger');

export const httpAuditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!shouldLog(req)) return next();

  let responseBody: unknown;
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = ((body: unknown) => {
    responseBody = body;
    return originalJson(body);
  }) as Response['json'];
  res.send = ((body: unknown) => {
    responseBody = body;
    return originalSend(body);
  }) as Response['send'];

  res.on('finish', () => {
    const authReq = req as AuthenticatedRequest;
    const statusCode = res.statusCode;
    const userId = authReq.user?.id;
    const endpoint = `${req.baseUrl}${req.path}`;
    const resource = req.path.split('/').filter(Boolean).slice(-2, -1)[0] || 'HTTP';
    const action = req.path.includes('/permissions') && req.method === 'POST'
      ? 'UPDATE_USER_PERMISSIONS'
      : `${req.method}_${resource.toUpperCase()}`;
    const body = sanitize(responseBody);
    const requestBody = sanitize(req.body);

    void createAuditLog({
      user_id: userId,
      tenant_id: authReq.user?.tenantId,
      branch_id: authReq.user?.assignedBranchIds?.[0],
      user_role: authReq.user?.roleName,
      method: req.method,
      endpoint,
      status_code: statusCode,
      request_body: requestBody,
      response_body: body,
      success: statusCode >= 200 && statusCode < 400,
      error_message: statusCode >= 400 && typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { message?: unknown }).message ?? '')
        : undefined,
      module: 'http',
      action,
      entity_name: resource,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
    }).catch((error) => console.error('HTTP audit log failed:', error));
  });

  next();
};
