import React from 'react';
import './homePage.css'; // Importing the CSS file

const HomePage = () => {
  return (
    <div className="homepage-container">
      <header className="header-section">
        <img 
          src="https://i.pinimg.com/564x/00/69/10/006910c2ea46ec122ce656109ed7079e.jpg" 
          alt="Personalized Financial Assistant Logo" 
          className="logo"
        />
        <h1>Welcome to Your Personalized Financial Assistant</h1>
        <p>Manage your finances effortlessly with tailored advice and insights.</p>
        <button className="get-started-button">Get Started</button>
      </header>

      <section className="features-section">
        <div className="feature">
          <img 
            src="https://i.pinimg.com/736x/fa/bc/a9/fabca99f101d8bc7e4f717a662a50e47.jpg" 
            alt="Track Spending" 
            className="feature-image"
          />
          <h3>Track Your Spending</h3>
          <p>Monitor your daily expenses and stay on top of your financial goals.</p>
        </div>

        <div className="feature">
          <img 
            src="https://i.pinimg.com/564x/af/a4/37/afa43727d61ebb71b08fa1acbe6dc076.jpg" 
            alt="Investment Insights" 
            className="feature-image"
          />
          <h3>Investment Insights</h3>
          <p>Get expert investment advice based on your unique financial situation.</p>
        </div>

        <div className="feature">
          <img 
            src="https://i.pinimg.com/564x/46/6c/dd/466cdd993c110fe377b2fc9dc2278a6e.jpg" 
            alt="Financial Planning" 
            className="feature-image"
          />
          <h3>Financial Planning</h3>
          <p>Plan for the future with personalized financial forecasts and budgeting tools.</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
