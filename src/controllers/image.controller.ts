import {
  Request,
  Response,
} from 'express';

import {
  updateMenuItemImage,
} from '../services/image.service';

export const uploadMenuItemImage =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const menuItemId =
        req.params.menuItemId;

      if (typeof menuItemId !== 'string') {
        return res.status(400).json({
          success: false,
          message:
            'Invalid menu item ID',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            'Image file is required',
        });
      }

      const imageUrl =
        `/uploads/menu-items/${req.file.filename}`;

      const menuItem =
        await updateMenuItemImage(
          menuItemId,
          imageUrl
        );

      return res.status(200).json({
        success: true,
        message:
          'Menu item image uploaded successfully',
        data: {
          menuItem,
          image: {
            filename:
              req.file.filename,
            original_name:
              req.file.originalname,
            mime_type:
              req.file.mimetype,
            size:
              req.file.size,
            url: imageUrl,
          },
        },
      });
    } catch (error: any) {
      console.error(
        'Upload image error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to upload image',
      });
    }
  };