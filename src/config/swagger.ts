import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'QR Menu SaaS API',
      version: '1.0.0',
      description:
        'Complete API documentation for the multi-tenant QR Menu SaaS platform. ' +
        'Protected routes require a Bearer JWT token.',
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
    },

    tags: [
      { name: 'Auth',          description: 'Authentication & account management' },
      { name: 'Admin',         description: 'Admin dashboard & tenant management' },
      { name: 'Public Menu',   description: 'Public menu APIs (no auth required)' },
      { name: 'Notifications', description: 'User notification management' },
      { name: 'Audit Logs',    description: 'System audit log management' },
    ],
  },

  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;