import {
  Request,
  Response,
} from 'express';

import {
  createTableSchema,
  updateTableSchema,
} from '../validators/table.validator';

import {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
} from '../services/table.service';

export const listTables = async (
  req: Request,
  res: Response
) => {
  try {
    const branchId =
      typeof req.query.branch_id === 'string'
        ? req.query.branch_id
        : undefined;

    const tables =
      await getAllTables(branchId);

    return res.status(200).json({
      success: true,
      message:
        'Tables retrieved successfully',
      data: {
        tables,
      },
    });
  } catch (error) {
    console.error(
      'List tables error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to retrieve tables',
    });
  }
};

export const getTable = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id;

    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid table ID',
      });
    }

    const table =
      await getTableById(id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Table retrieved successfully',
      data: {
        table,
      },
    });
  } catch (error) {
    console.error(
      'Get table error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to retrieve table',
    });
  }
};

export const createTableController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const validation =
        createTableSchema.safeParse(
          req.body
        );

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid request data',
          errors:
            validation.error.flatten(),
        });
      }

      const table =
        await createTable(
          validation.data
        );

      return res.status(201).json({
        success: true,
        message:
          'Table created successfully',
        data: {
          table,
        },
      });
    } catch (error: any) {
      console.error(
        'Create table error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to create table',
      });
    }
  };

export const updateTableController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const id = req.params.id;

      if (typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message:
            'Invalid table ID',
        });
      }

      const validation =
        updateTableSchema.safeParse(
          req.body
        );

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid request data',
          errors:
            validation.error.flatten(),
        });
      }

      const table =
        await updateTable(
          id,
          validation.data
        );

      return res.status(200).json({
        success: true,
        message:
          'Table updated successfully',
        data: {
          table,
        },
      });
    } catch (error: any) {
      console.error(
        'Update table error:',
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          'Failed to update table',
      });
    }
  };

export const deleteTableController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const id = req.params.id;

      if (typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message:
            'Invalid table ID',
        });
      }

      await deleteTable(id);

      return res.status(200).json({
        success: true,
        message:
          'Table deleted successfully',
      });
    } catch (error: any) {
      console.error(
        'Delete table error:',
        error
      );

      return res.status(404).json({
        success: false,
        message:
          error.message ||
          'Failed to delete table',
      });
    }
  };