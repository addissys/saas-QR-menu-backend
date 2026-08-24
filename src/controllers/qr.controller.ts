import {
  Request,
  Response,
} from 'express';

import {
  generateTableQr,
  getTableQr,
  regenerateTableQr,
  deleteTableQr,
} from '../services/qr.service';

export const generateQrController = async (
  req: Request,
  res: Response
) => {
  try {
    const tableId = req.params.tableId;

    if (typeof tableId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid table ID',
      });
    }

    /*
     * For now we take the generating user from
     * the authenticated request.
     */
    const authenticatedUser =
      (req as Request & {
        user?: { id: string };
      }).user;

    if (!authenticatedUser?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const result =
      await generateTableQr(
        tableId,
        authenticatedUser.id
      );

    return res.status(201).json({
      success: true,
      message:
        'QR code generated successfully',
      data: result,
    });
  } catch (error: any) {
    console.error(
      'Generate QR error:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to generate QR code',
    });
  }
};

export const getQrController = async (
  req: Request,
  res: Response
) => {
  try {
    const tableId = req.params.tableId;

    if (typeof tableId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid table ID',
      });
    }

    const qr =
      await getTableQr(tableId);

    if (!qr) {
      return res.status(404).json({
        success: false,
        message:
          'QR code not found',
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'QR code retrieved successfully',
      data: {
        qr,
      },
    });
  } catch (error) {
    console.error(
      'Get QR error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to retrieve QR code',
    });
  }
};

export const regenerateQrController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const tableId = req.params.tableId;

      if (typeof tableId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid table ID',
        });
      }

      const authenticatedUser =
        (req as Request & {
          user?: { id: string };
        }).user;

      if (!authenticatedUser?.id) {
        return res.status(401).json({
          success: false,
          message:
            'Authentication required',
        });
      }

      const result =
        await regenerateTableQr(
          tableId,
          authenticatedUser.id
        );

      return res.status(201).json({
        success: true,
        message:
          'QR code regenerated successfully',
        data: result,
      });
    } catch (error: any) {
      console.error(
        'Regenerate QR error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to regenerate QR code',
      });
    }
  };

export const deleteQrController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const tableId = req.params.tableId;

      if (typeof tableId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid table ID',
        });
      }

      await deleteTableQr(tableId);

      return res.status(200).json({
        success: true,
        message:
          'QR code deleted successfully',
      });
    } catch (error: any) {
      console.error(
        'Delete QR error:',
        error
      );

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          'Failed to delete QR code',
      });
    }
  };