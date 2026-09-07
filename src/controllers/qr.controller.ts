import { Request, Response } from 'express';

import {
  generateTableQr,
  getTableQr,
  regenerateTableQr,
  deleteTableQr,
  getAllQrCodes,
  getQrCodeById,
  downloadQrImage,
  regenerateQrById,
  deleteQrById,
} from '../services/qr.service';
import prisma from '../config/prisma';
import { assertBranchAccess, getScopedBranchIds, findBranchForResource } from '../middleware/branch-scope.middleware';

export const listQrCodesController = async (req: Request, res: Response) => {
  try {
    const branchId = typeof req.query.branch_id === 'string' ? req.query.branch_id : undefined;
    const tenantId = typeof req.query.tenant_id === 'string' ? req.query.tenant_id : undefined;
    const scopedBranchIds = getScopedBranchIds(req);
    if (scopedBranchIds && branchId && !scopedBranchIds.includes(branchId)) return res.status(403).json({ success: false, message: 'You are not authorized to access this branch.' });
    const qrCodes = await getAllQrCodes(branchId, tenantId, scopedBranchIds);

    return res.status(200).json({
      success: true,
      message: 'QR codes listed successfully',
      data: qrCodes,
    });
  } catch (error: any) {
    console.error('List QR codes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve QR codes',
    });
  }
};

export const getQrCodeByIdController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid QR code ID' });
    }

    const resourceBranchId = await findBranchForResource('qrCode', id);
    if (resourceBranchId) await assertBranchAccess(req, resourceBranchId);
    const qr = await getQrCodeById(id);

    return res.status(200).json({
      success: true,
      message: 'QR code retrieved successfully',
      data: qr,
    });
  } catch (error: any) {
    console.error('Get QR code error:', error);
    if (error.message === 'QR code not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve QR code',
    });
  }
};

export const generateQrCodeController = async (req: Request, res: Response) => {
  try {
    const tableId = (req.body.table_id || req.body.tableId || req.params.tableId) as string;
    const userId = (req as any).user?.id;

    if (!tableId || typeof tableId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'table_id is required',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const table = await prisma.table.findFirst({ where: { id: tableId, deleted_at: null }, select: { branch_id: true } });
    if (table) await assertBranchAccess(req, table.branch_id);

    const result = await generateTableQr(tableId, userId);

    return res.status(201).json({
      success: true,
      message: 'QR code generated successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Generate QR code error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate QR code',
    });
  }
};

export const downloadQrImageController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid QR code ID' });
    }

    const resourceBranchId = await findBranchForResource('qrCode', id);
    if (resourceBranchId) await assertBranchAccess(req, resourceBranchId);

    const qrImageUrl = await downloadQrImage(id);

    return res.status(200).json({
      success: true,
      message: 'QR code image retrieved successfully',
      data: {
        qr_image_url: qrImageUrl,
      },
    });
  } catch (error: any) {
    console.error('Download QR image error:', error);
    if (error.message === 'QR code not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to download QR code image',
    });
  }
};

export const regenerateQrByIdController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user?.id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid QR code ID' });
    }

    const resourceBranchId = await findBranchForResource('qrCode', id);
    if (resourceBranchId) await assertBranchAccess(req, resourceBranchId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const result = await regenerateQrById(id, userId);

    return res.status(200).json({
      success: true,
      message: 'QR code regenerated successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Regenerate QR code error:', error);
    if (error.message === 'QR code not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to regenerate QR code',
    });
  }
};

export const deleteQrByIdController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid QR code ID' });
    }

    await deleteQrById(id);

    return res.status(200).json({
      success: true,
      message: 'QR code deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete QR code error:', error);
    if (error.message === 'QR code not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to delete QR code',
    });
  }
};

/* Legacy table-based controllers */
export const generateQrController = async (req: Request, res: Response) => {
  return generateQrCodeController(req, res);
};

export const getQrController = async (req: Request, res: Response) => {
  try {
    const tableId = req.params.tableId as string;
    if (!tableId) return res.status(400).json({ success: false, message: 'Invalid table ID' });

    const qr = await getTableQr(tableId);
    if (!qr) return res.status(404).json({ success: false, message: 'QR code not found' });
    return res.status(200).json({ success: true, message: 'QR code retrieved successfully', data: { qr } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve QR code' });
  }
};

export const regenerateQrController = async (req: Request, res: Response) => {
  try {
    const tableId = req.params.tableId as string;
    const userId = (req as any).user?.id;
    if (!tableId || !userId) return res.status(400).json({ success: false, message: 'Invalid table ID or unauthenticated user' });
    const result = await regenerateTableQr(tableId, userId);
    return res.status(200).json({ success: true, message: 'QR code regenerated successfully', data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to regenerate QR code' });
  }
};

export const deleteQrController = async (req: Request, res: Response) => {
  try {
    const tableId = req.params.tableId as string;
    if (!tableId) return res.status(400).json({ success: false, message: 'Invalid table ID' });

    await deleteTableQr(tableId);
    return res.status(200).json({ success: true, message: 'QR code deleted successfully' });
  } catch (error: any) {
    return res.status(404).json({ success: false, message: error.message || 'Failed to delete QR code' });
  }
};