import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Nav from './components/Nav';
import Footer from './components/Footer/Footer';
import SignUp from './components/SignUp'; 
import Login from './components/Login/Login'; 
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import DashBoard from './components/DashBoard/dashboard';
import MainPage from './components/mainpage/mainpage';
import Profile from './components/profile';
import Home from './components/Home/homepage';
import Users from './components/Admin/Users';
import ResetPassword from './components/ResetPassword';
import ExpenseList from './components/mainpage/ExpenseList'; 
import AddExpense from './components/mainpage/AddExpense'; 
import IncomeList from './components/mainpage/IncomeList'; 
import AddIncome from './components/mainpage/AddIncome'; // Import the AddIncome component

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expenses, setExpenses] = useState([]);

  // Fetch expenses function
  const fetchExpenses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/expenses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setExpenses(data);
      } else {
        console.error('Failed to fetch expenses');
      }
    } catch (error) {
      console.error('Error fetching expenses', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchExpenses();
    }
  }, [isLoggedIn]);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setIsAdmin(userData.role === 'admin');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setIsAdmin(false);
  };

  const handleAddExpense = (expense) => {
    setExpenses([...expenses, expense]);
  };

  const handleRemoveExpense = (id) => {
    setExpenses(expenses.filter(expense => expense._id !== id));
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Nav isLoggedIn={isLoggedIn} user={user} isAdmin={isAdmin} onLogout={handleLogout} />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/dashboard" 
              element={isLoggedIn && !isAdmin ? <DashBoard /> : <Navigate to="/" />} 
            />
            <Route 
              path="/admin/dashboard" 
              element={isLoggedIn && isAdmin ? <AdminDashboard /> : <Navigate to="/admin-login" />} 
            />
            <Route 
              path="/mainpage" 
              element={isLoggedIn ? <MainPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/profile" 
              element={isLoggedIn && !isAdmin ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
            />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route 
              path="/admin-login" 
              element={!isLoggedIn ? <AdminLogin /> : <Navigate to="/admin/dashboard" />} 
            />
            <Route path="/contact-us" element={<h1>Contact Us</h1>} />
            <Route path="/more" element={<h1>More</h1>} />
            <Route path="/search" element={<h1>Search</h1>} />
            <Route 
              path="/users" 
              element={isLoggedIn && isAdmin ? <Users /> : <Navigate to="/" />} 
            />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route 
              path="/expenses" 
              element={isLoggedIn ? <ExpenseList expenses={expenses} onRemoveExpense={handleRemoveExpense} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/add-expense" 
              element={isLoggedIn ? <AddExpense onAddExpense={handleAddExpense} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/incomes" 
              element={isLoggedIn ? <IncomeList /> : <Navigate to="/" />} // Add route for IncomeList
            />
            <Route 
              path="/add-income" 
              element={isLoggedIn ? <AddIncome /> : <Navigate to="/" />} // Add route for AddIncome
            />
            <Route path="*" element={<h1>404 - Not Found</h1>} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
