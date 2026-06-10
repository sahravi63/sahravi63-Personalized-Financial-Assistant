import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-gauge-chart', () => () => <div>Gauge Chart</div>);
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div>Chart</div>,
}));
jest.mock('chart.js/auto', () => ({}));

test('renders the home page hero text', () => {
  render(<App />);
  expect(screen.getByText(/Welcome to Your Personalized Financial Assistant/i)).toBeInTheDocument();
});
