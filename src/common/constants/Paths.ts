
export default {
  Base: '/api',
  Units: {
    Base: '/units',
    Get: '/',
    Create: '/',
    Update: '/:id',
    GetOne: '/:id',
  },
} as const;
