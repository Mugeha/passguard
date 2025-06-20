import React from 'react';
import './styles/styles.css';
import PasswordChecker from './components/PasswordChecker';

function App() {
  return (
    <div className="app">
      <h1>Password Strength Tester 🔐</h1>
      <PasswordChecker />
    </div>
  );
}

export default App;
