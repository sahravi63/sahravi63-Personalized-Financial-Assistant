import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TasksPanel from './TasksPanel';
import RemindersPanel from './RemindersPanel';
import QuickTransfer from './QuickTransfer';
import NotificationsPanel from './NotificationsPanel';
import api from '../../api';

jest.mock('../../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Dashboard backend integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TasksPanel fetches tasks from the backend and toggles completion', async () => {
    api.get.mockResolvedValueOnce({ data: [{ _id: 't1', text: 'Pay rent', done: false }] })
      .mockResolvedValueOnce({ data: [{ _id: 't1', text: 'Pay rent', done: true }] });
    api.put.mockResolvedValue({});

    render(<TasksPanel />);

    expect(await screen.findByText('Pay rent')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));

    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/api/dashboard/tasks/t1', { done: true }));
  });

  test('RemindersPanel loads, adds, and deletes reminders from the backend', async () => {
    api.get.mockResolvedValueOnce({ data: [{ _id: 'r1', text: 'Call bank', done: false, due: 'Today', priority: 'high' }] });
    api.post.mockResolvedValue({ data: { _id: 'r2', text: 'Book dentist', done: false, due: 'Tomorrow', priority: 'low' } });
    api.delete.mockResolvedValue({});

    render(<RemindersPanel />);

    expect(await screen.findByText('Call bank')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Add reminder'), { target: { value: 'Book dentist' } });
    fireEvent.click(screen.getAllByRole('button', { name: '+' })[0]);

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/dashboard/reminders', { text: 'Book dentist' }));

    fireEvent.click(screen.getByText('x'));
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/api/dashboard/reminders/r1'));
  });

  test('QuickTransfer records a transaction notification in the backend', async () => {
    api.post.mockResolvedValue({});

    render(<QuickTransfer />);

    fireEvent.click(screen.getByText('Dwight'));
    fireEvent.change(screen.getByPlaceholderText('Enter amount'), { target: { value: '150' } });
    fireEvent.change(screen.getByPlaceholderText('Add note'), { target: { value: 'Rent' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Money' }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/dashboard/notifications', expect.objectContaining({
      title: 'Transfer to Dwight',
      message: expect.stringContaining('150.00'),
      status: 'Transferred',
    })));
  });

  test('NotificationsPanel fetches notifications from the backend', async () => {
    api.get.mockResolvedValue({ data: [{ _id: 'n1', title: 'Transfer complete', message: 'You sent $50', status: 'Completed', timeLabel: 'Now', avatar: 'TR' }] });

    render(<NotificationsPanel onClose={jest.fn()} />);

    expect(await screen.findByText('Transfer complete')).toBeInTheDocument();
  });
});
