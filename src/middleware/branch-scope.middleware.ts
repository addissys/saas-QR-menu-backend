import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from './auth.middleware';

export const isBranchManager = (req: Request) =>
  (req as AuthenticatedRequest).user?.roleName?.toUpperCase() === 'BRANCH_MANAGER';

export const getScopedBranchIds = (req: Request): string[] | undefined => {
  const authReq = req as AuthenticatedRequest;
  const role = authReq.user?.roleName?.toUpperCase();
  if (role === 'SUPER_ADMIN' || role === 'CAFE_OWNER' || role === 'OWNER' || role === 'RESTAURANT_OWNER') return undefined;
  return authReq.user?.assignedBranchIds ?? [];
};

export const requireBranchAccess = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  const role = authReq.user?.roleName?.toUpperCase();
  if (role === 'SUPER_ADMIN' || role === 'CAFE_OWNER' || role === 'OWNER' || role === 'RESTAURANT_OWNER') return next();

  const branchId = req.params.id || req.params.branchId || req.query.branch_id;
  if (typeof branchId !== 'string' || !authReq.user?.assignedBranchIds?.includes(branchId)) {
    return res.status(403).json({ success: false, message: 'You are not authorized to access this branch.' });
  }

  return next();
};

export const assertBranchAccess = async (req: Request, branchId: string) => {
  const authReq = req as AuthenticatedRequest;
  const role = authReq.user?.roleName?.toUpperCase();
  if (role === 'SUPER_ADMIN' || role === 'CAFE_OWNER' || role === 'OWNER' || role === 'RESTAURANT_OWNER') return true;
  if (!authReq.user?.assignedBranchIds?.includes(branchId)) throw new Error('You are not authorized to access this branch.');
  return true;
};

export const findBranchForResource = async (resource: 'table' | 'menuItem' | 'category' | 'qrCode', id: string) => {
  if (resource === 'table') return (await prisma.table.findFirst({ where: { id, deleted_at: null }, select: { branch_id: true } }))?.branch_id;
  if (resource === 'menuItem') return (await prisma.menuItem.findFirst({ where: { id, deleted_at: null }, select: { branch_id: true } }))?.branch_id;
  if (resource === 'category') return (await prisma.category.findFirst({ where: { id, deleted_at: null }, select: { branch_id: true } }))?.branch_id;
  return (await prisma.qrCode.findFirst({ where: { id, deleted_at: null }, select: { table: { select: { branch_id: true } } } }))?.table.branch_id;
};
