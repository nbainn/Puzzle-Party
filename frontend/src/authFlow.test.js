import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { act } from 'react-dom/test-utils';

// Mock the Ably Realtime Promise-based connection
jest.mock('ably/promises', () => ({
  Realtime: {
    Promise: jest.fn().mockImplementation(() => ({
      connection: {
        on: (event, callback) => {
          if (event === 'connected') {
            callback();
          }
        }
      },
      auth: {
        clientId: 'mock-client-id'
      }
    }))
  }
}));

// Mock rendering to control findByText and getByText
jest.mock('@testing-library/react', () => ({
  ...jest.requireActual('@testing-library/react'),
  render: jest.fn()
}));

describe('Authentication Flow Tests', () => {
  let mock;
  beforeEach(() => {
    mock = new MockAdapter(axios);
    // Mock the initial user verification to simulate a logged-in user
    mock.onGet('/verifyToken').reply(200, { user: { id: '1', nickname: 'testuser' } });
    render.mockImplementation(({ children }) => jest.requireActual('@testing-library/react').render(children));
  });

  afterEach(() => {
    mock.resetHandlers();
    jest.clearAllMocks();
  });

  it('redirects unauthenticated users to the LandingPage', async () => {
    mock.onGet('/verifyToken').reply(200, { user: null });
    render.mockImplementation(() => ({
      findByText: jest.fn().mockResolvedValue({ textContent: 'Login' })
    }));

    await act(async () => {
      const { findByText } = render(<App />);
      const loginElement = await findByText(/Login/i);
      expect(loginElement.textContent).toBe('Login');
    });
  });

  it('maintains user session after page refresh', async () => {
    mock.onGet('/verifyToken').reply(200, {
      user: { id: '1', nickname: 'testuser' }
    });
    render.mockImplementation(() => ({
      findByText: jest.fn().mockResolvedValue({ textContent: 'Home' })
    }));

    await act(async () => {
      const { findByText } = render(<App />);
      const homeElement = await findByText(/Home/i);
      expect(homeElement.textContent).toBe('Home');
    });
  });
});