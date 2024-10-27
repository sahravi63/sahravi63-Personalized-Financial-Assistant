import React from 'react';
import { Bar } from 'react-chartjs-2';
import GaugeChart from 'react-gauge-chart';
import 'chart.js/auto';
import './dashboard.css';

const Dashboard = () => {
  // Data for bar chart
  const barData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Income',
        data: [5000, 6000, 7500, 8000, 8500, 9000],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Expenses',
        data: [4000, 3000, 5000, 4500, 6000, 5000],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  // Options for bar chart
  const barOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Gauge value (for example, showing 60% expenses used)
  const gaugeValue = 0.6;

  return (
    <div className="dashboard-container">
      <div className="gauge-container">
        <h2>Expense vs Income</h2>
        <GaugeChart
          id="gauge-chart"
          nrOfLevels={10}
          percent={gaugeValue}
          textColor="#000"
          colors={['#FF5F6D', '#FFC371']}
          arcWidth={0.3}
          needleColor="#345243"
        />
      </div>

      <div className="graph-container">
        <h2>Income and Expense Overview</h2>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
};

export default Dashboard;
