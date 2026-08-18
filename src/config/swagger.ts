import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'QR Menu SaaS API',
      version: '1.0.0',
      description:
        'Complete API documentation for the multi-tenant QR Menu SaaS platform. ' +
        'Protected routes require a Bearer JWT token obtained from POST /api/v1/auth/login.',
      contact: {
        name: 'Addis System',
      },
    },

    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Paste your access_token here. Obtain it from POST /api/v1/auth/login',
        },
      },

      schemas: {
        // ── Shared / Generic ─────────────────────────────────────────
        PaginationMeta: {
          type: 'object',
          properties: {
            total:       { type: 'integer', example: 100 },
            page:        { type: 'integer', example: 1 },
            limit:       { type: 'integer', example: 10 },
            total_pages: { type: 'integer', example: 10 },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string',  example: 'Operation successful' },
            data:    { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string',  example: 'An error occurred' },
            errors:  { type: 'array', items: { type: 'string' } },
          },
        },

        // ── Auth ─────────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            full_name:     { type: 'string', example: 'John Doe' },
            email:         { type: 'string', format: 'email' },
            phone:         { type: 'string', example: '+251911000000' },
            profile_image: { type: 'string', example: 'https://example.com/photo.jpg' },
            is_active:     { type: 'boolean', example: true },
            created_at:    { type: 'string', format: 'date-time' },
            updated_at:    { type: 'string', format: 'date-time' },
          },
        },

        // ── Tenants ──────────────────────────────────────────────────
        Tenant: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            owner_id:      { type: 'string', format: 'uuid' },
            business_name: { type: 'string', example: 'Addis Coffee House' },
            business_slug: { type: 'string', example: 'addis-coffee-house' },
            email:         { type: 'string', format: 'email' },
            phone:         { type: 'string' },
            address:       { type: 'string' },
            city:          { type: 'string' },
            country:       { type: 'string' },
            logo_url:      { type: 'string' },
            brand_color:   { type: 'string', example: '#FF6B35' },
            status: {
              type: 'string',
              enum: ['PENDING', 'TRIAL', 'ACTIVE', 'SUSPENDED', 'INACTIVE'],
            },
            is_active:  { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },

        // ── Branches ─────────────────────────────────────────────────
        Branch: {
          type: 'object',
          properties: {
            id:         { type: 'string', format: 'uuid' },
            tenant_id:  { type: 'string', format: 'uuid' },
            name:       { type: 'string', example: 'Bole Branch' },
            address:    { type: 'string' },
            city:       { type: 'string' },
            country:    { type: 'string' },
            phone:      { type: 'string' },
            email:      { type: 'string', format: 'email' },
            is_main:    { type: 'boolean' },
            is_active:  { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },

        // ── Tables ───────────────────────────────────────────────────
        Table: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            branch_id:    { type: 'string', format: 'uuid' },
            table_number: { type: 'string', example: 'T-01' },
            capacity:     { type: 'integer', example: 4 },
            description:  { type: 'string' },
            is_active:    { type: 'boolean' },
            created_at:   { type: 'string', format: 'date-time' },
          },
        },

        // ── QR Codes ─────────────────────────────────────────────────
        QrCode: {
          type: 'object',
          properties: {
            id:         { type: 'string', format: 'uuid' },
            table_id:   { type: 'string', format: 'uuid' },
            qr_url:     { type: 'string', description: 'Public URL encoded in QR' },
            image_url:  { type: 'string', description: 'URL to the QR image file' },
            is_active:  { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },

        // ── Categories ───────────────────────────────────────────────
        Category: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            branch_id:   { type: 'string', format: 'uuid' },
            name:        { type: 'string', example: 'Hot Beverages' },
            description: { type: 'string' },
            image_url:   { type: 'string' },
            sort_order:  { type: 'integer' },
            is_active:   { type: 'boolean' },
            created_at:  { type: 'string', format: 'date-time' },
          },
        },

        // ── Menu Items ───────────────────────────────────────────────
        MenuItem: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            category_id:  { type: 'string', format: 'uuid' },
            branch_id:    { type: 'string', format: 'uuid' },
            name:         { type: 'string', example: 'Ethiopian Coffee' },
            description:  { type: 'string' },
            price:        { type: 'number', format: 'float', example: 45.00 },
            image_url:    { type: 'string' },
            is_available: { type: 'boolean' },
            is_featured:  { type: 'boolean' },
            sort_order:   { type: 'integer' },
            allergens:    { type: 'array', items: { type: 'string' } },
            calories:     { type: 'integer' },
            created_at:   { type: 'string', format: 'date-time' },
          },
        },

        // ── Notifications ────────────────────────────────────────────
        Notification: {
          type: 'object',
          properties: {
            id:         { type: 'string', format: 'uuid' },
            user_id:    { type: 'string', format: 'uuid' },
            title:      { type: 'string', example: 'New Order Received' },
            message:    { type: 'string' },
            type: {
              type: 'string',
              enum: ['SYSTEM', 'SUBSCRIPTION', 'BRANCH', 'MENU', 'PROMOTION', 'ALERT'],
            },
            is_read:    { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },

        // ── Audit Logs ───────────────────────────────────────────────
        AuditLog: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            user_id:     { type: 'string', format: 'uuid' },
            tenant_id:   { type: 'string', format: 'uuid' },
            module:      { type: 'string', example: 'auth' },
            action:      { type: 'string', example: 'LOGIN' },
            entity_name: { type: 'string', example: 'User' },
            entity_id:   { type: 'string', format: 'uuid' },
            old_values:  { type: 'object' },
            new_values:  { type: 'object' },
            ip_address:  { type: 'string' },
            user_agent:  { type: 'string' },
            created_at:  { type: 'string', format: 'date-time' },
          },
        },
      },
    },

    // ── Global Tags ──────────────────────────────────────────────────────
    tags: [
      // Auth & Access Control
      { name: 'Auth',             description: 'Authentication & account management' },
      { name: 'Users',            description: 'User management (Admin only)' },
      { name: 'Roles',            description: 'Role management' },
      { name: 'Role Permissions', description: 'Assign / revoke permissions on roles' },
      { name: 'User Roles',       description: 'Assign / revoke roles for users' },
      { name: 'Sessions',         description: 'Active session management' },
      // SaaS
      { name: 'Tenants',          description: 'Restaurant (tenant) management' },
      // Branch
      { name: 'Branches',         description: 'Branch management' },
      { name: 'Tables',           description: 'Restaurant table management' },
      { name: 'QR Codes',         description: 'QR code generation & management' },
      // Menu
      { name: 'Categories',       description: 'Menu category management' },
      { name: 'Menu Items',       description: 'Menu item management' },
      // Public
      { name: 'Public Menu',      description: 'Public-facing menu APIs — no auth required' },
      // System
      { name: 'Notifications',    description: 'User notification management' },
      { name: 'Audit Logs',       description: 'System audit log management' },
      // Internal (custom route groups)
      { name: 'Admin',            description: 'Admin dashboard & platform management' },
      { name: 'Executives',       description: 'Executive staff management' },
      { name: 'Branch Managers',  description: 'Branch manager staff management' },
    ],
  },

  // Scan every route file for @swagger JSDoc blocks
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;