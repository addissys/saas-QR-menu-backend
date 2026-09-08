import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import prisma from '../src/config/prisma';
import { listAuditLogs, getAuditLog } from '../src/controllers/audit-log.controller';
import { requireRoles } from '../src/middleware/role.middleware';

const tenantId = '11111111-1111-4111-8111-111111111111';
const otherTenantId = '22222222-2222-4222-8222-222222222222';
const logId = '33333333-3333-4333-8333-333333333333';

const originalFindMany = prisma.auditLog.findMany;
const originalCount = prisma.auditLog.count;
const originalFindFirst = prisma.auditLog.findFirst;
const originalRoleFindFirst = prisma.role.findFirst;

const responseFor = () => {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      response.statusCode = code;
      return response;
    },
    json(body: unknown) {
      response.body = body;
      return response;
    },
  };

  return response;
};

const userFor = (roleName: string, scopedTenantId?: string) => ({
  id: '44444444-4444-4444-8444-444444444444',
  roleId: '55555555-5555-4555-8555-555555555555',
  roleName,
  tenantId: scopedTenantId,
});

afterEach(() => {
  prisma.auditLog.findMany = originalFindMany;
  prisma.auditLog.count = originalCount;
  prisma.auditLog.findFirst = originalFindFirst;
  prisma.role.findFirst = originalRoleFindFirst;
});

describe('audit-log authorization', () => {
  it('allows an owner to read only their tenant logs and preserves the response shape', async () => {
    let receivedWhere: Record<string, unknown> | undefined;
    prisma.auditLog.findMany = (async (args: any) => {
      receivedWhere = args.where;
      return [];
    }) as typeof prisma.auditLog.findMany;
    prisma.auditLog.count = (async () => 0) as typeof prisma.auditLog.count;

    const response = responseFor();
    await listAuditLogs(
      {
        query: { tenant_id: otherTenantId, page: '1', limit: '20' },
        user: userFor('CAFE_OWNER', tenantId),
      } as any,
      response as any
    );

    assert.equal(response.statusCode, 200);
    assert.deepEqual(receivedWhere?.tenant_id, tenantId);
    assert.deepEqual(response.body, {
      success: true,
      message: 'Audit logs retrieved successfully',
      data: {
        auditLogs: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
    });
  });

  it('allows super admins to read all logs while retaining client filters', async () => {
    let receivedWhere: Record<string, unknown> | undefined;
    prisma.auditLog.findMany = (async (args: any) => {
      receivedWhere = args.where;
      return [];
    }) as typeof prisma.auditLog.findMany;
    prisma.auditLog.count = (async () => 0) as typeof prisma.auditLog.count;

    const response = responseFor();
    await listAuditLogs(
      {
        query: { tenant_id: otherTenantId, method: 'GET' },
        user: userFor('SUPER_ADMIN'),
      } as any,
      response as any
    );

    assert.equal(response.statusCode, 200);
    assert.deepEqual(receivedWhere?.tenant_id, otherTenantId);
  });

  it('blocks an unauthorized role with 403', async () => {
    prisma.role.findFirst = (async () => ({
      id: '55555555-5555-4555-8555-555555555555',
      name: 'BRANCH_MANAGER',
      deleted_at: null,
    } as any)) as typeof prisma.role.findFirst;

    const response = responseFor();
    let nextCalled = false;
    await requireRoles(
      'SUPER_ADMIN',
      'OWNER',
      'CAFE_OWNER',
      'RESTAURANT_OWNER'
    )(
      { user: userFor('BRANCH_MANAGER') } as any,
      response as any,
      () => {
        nextCalled = true;
      }
    );

    assert.equal(response.statusCode, 403);
    assert.equal(nextCalled, false);
  });

  it('restricts owner detail access to the owner tenant', async () => {
    let receivedWhere: Record<string, unknown> | undefined;
    prisma.auditLog.findFirst = (async (args: any) => {
      receivedWhere = args.where;
      return null;
    }) as typeof prisma.auditLog.findFirst;

    const response = responseFor();
    await getAuditLog(
      {
        params: { id: logId },
        user: userFor('RESTAURANT_OWNER', tenantId),
      } as any,
      response as any
    );

    assert.deepEqual(receivedWhere, {
      id: logId,
      tenant_id: tenantId,
    });
    assert.equal(response.statusCode, 404);
  });

  it('does not require a tenant scope for super-admin detail access', async () => {
    let receivedWhere: Record<string, unknown> | undefined;
    prisma.auditLog.findFirst = (async (args: any) => {
      receivedWhere = args.where;
      return { id: logId };
    }) as typeof prisma.auditLog.findFirst;

    const response = responseFor();
    await getAuditLog(
      {
        params: { id: logId },
        user: userFor('SUPER_ADMIN'),
      } as any,
      response as any
    );

    assert.deepEqual(receivedWhere, { id: logId });
    assert.equal(response.statusCode, 200);
  });
});
