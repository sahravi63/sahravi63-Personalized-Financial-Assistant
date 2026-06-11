import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import api from '../../api';

jest.mock('../../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login redirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockReset();
  });

  it('redirects regular users to the dashboard after a successful login', async () => {
    api.post.mockResolvedValue({
      data: {
        token: 'fake-token',
        user: { id: '1', username: 'Test User', email: 'user@example.com', role: 'user' },
      },
    });

    render(
      <MemoryRouter>
        <Login onLogin={jest.fn()} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/login', {
      email: 'user@example.com',
      password: 'Password123!',
    }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true }));
  });
});
