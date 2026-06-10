import React, { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

const MonthlyFinanceChart = ({
  labels = [],
  incomeTotals = [],
  expenseTotals = [],
  type = 'line',
}) => {
  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeTotals,
          borderColor: '#38bdf8',
          backgroundColor: type === 'bar' ? 'rgba(56, 189, 248, 0.54)' : 'rgba(56, 189, 248, 0.12)',
          borderRadius: type === 'bar' ? 6 : 0,
          fill: type === 'line',
          tension: 0.38,
        },
        {
          label: 'Expenses',
          data: expenseTotals,
          borderColor: '#fb7185',
          backgroundColor: type === 'bar' ? 'rgba(251, 113, 133, 0.54)' : 'rgba(251, 113, 133, 0.1)',
          borderRadius: type === 'bar' ? 6 : 0,
          fill: type === 'line',
          tension: 0.38,
        },
      ],
    }),
    [labels, incomeTotals, expenseTotals, type]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: 'rgba(226, 232, 240, 0.72)', boxWidth: 12 },
        },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          ticks: { color: 'rgba(226, 232, 240, 0.54)' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
        },
        y: {
          beginAtZero: true,
          ticks: { color: 'rgba(226, 232, 240, 0.54)', precision: 0 },
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
        },
      },
    }),
    []
  );

  return (
    <div className="chart-wrapper">
      {type === 'bar' ? <Bar data={data} options={options} /> : <Line data={data} options={options} />}
    </div>
  );
};

export default MonthlyFinanceChart;
