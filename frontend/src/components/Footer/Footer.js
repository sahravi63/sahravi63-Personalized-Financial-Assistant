import React from "react";
import './Footer.css'; // Importing the CSS file for footer styling

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>About Us</h3>
          <p>
            DONNA, your personalized financial assistant, helps you make smarter financial decisions by providing tailored insights and tracking your spending habits.
          </p>
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p>Email: support@donna.com</p>
          <p>Phone: +1 123 456 7890</p>
        </div>

        <div className="footer-section social">
          <h3>Follow Us</h3>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 DONNA - Your Personalized Financial Assistant | All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
