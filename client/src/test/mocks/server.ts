import { setupServer } from 'msw/node';
import { handlers, resetMockData } from './handlers';

export const server = setupServer(...handlers);

export { resetMockData };

export const startMockServer = () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  beforeEach(() => {
    resetMockData();
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
};
