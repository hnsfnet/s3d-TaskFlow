import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { startMockServer } from './mocks/server';

startMockServer();

export const renderWithRouter = (ui: ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return {
    ...render(ui, { wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter> }),
  };
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
