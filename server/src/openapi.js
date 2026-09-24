export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Vendor Onboarding API',
    version: '1.0.0',
    description:
      'REST API for vendor onboarding pipeline. **Web UI** runs separately at http://localhost:5173 (Vite). This server serves JSON APIs and Swagger only.',
  },
  servers: [{ url: 'http://localhost:4000', description: 'Local API' }],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health + DB status',
        responses: {
          200: {
            description: 'Service and database OK',
          },
        },
      },
    },
    '/api/submit': {
      post: {
        summary: 'Submit vendor onboarding payload and run pipeline',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VendorSubmission' },
            },
          },
        },
        responses: {
          201: { description: 'Run completed' },
        },
      },
    },
    '/api/runs': {
      get: { summary: 'List past runs', responses: { 200: { description: 'Run list' } } },
    },
    '/api/runs/{id}': {
      get: {
        summary: 'Run detail with steps',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Full run' } },
      },
    },
    '/api/vendors': {
      get: { summary: 'Seeded vendor registry', responses: { 200: { description: 'Vendors' } } },
    },
  },
  components: {
    schemas: {
      VendorSubmission: {
        type: 'object',
        required: [
          'company_name',
          'country',
          'tax_id',
          'bank_account_holder_name',
          'bank_account_number',
          'bank_name',
          'swift_or_ifsc',
          'contact_email',
          'contact_phone',
          'documents',
        ],
        properties: {
          company_name: { type: 'string' },
          country: { type: 'string', example: 'IN' },
          tax_id: { type: 'string' },
          bank_account_holder_name: { type: 'string' },
          bank_account_number: { type: 'string' },
          bank_name: { type: 'string' },
          swift_or_ifsc: { type: 'string' },
          contact_email: { type: 'string' },
          contact_phone: { type: 'string' },
          documents: { type: 'object' },
        },
      },
    },
  },
};
