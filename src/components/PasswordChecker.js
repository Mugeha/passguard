import React, { useState } from 'react';
import zxcvbn from 'zxcvbn';
import sha1 from 'js-sha1';


const PasswordChecker = () => {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [pwnedCount, setPwnedCount] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');


  const generateStrongPassword = (length = 16) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};



 const handleChange = async (e) => {
  const val = e.target.value;
  setPassword(val);
  const analysis = zxcvbn(val);
  setResult(analysis);

  if (val.length > 0) {
    const count = await checkPwned(val);
    setPwnedCount(count);
  } else {
    setPwnedCount(null);
  }
};


  const getStrength = (score) => {
    switch (score) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return '';
    }
  };
  const checkPwned = async (password) => {
  const hash = sha1(password).toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await response.text();

  const lines = text.split('\n');
  for (const line of lines) {
    const [hashSuffix, count] = line.split(':');
    if (hashSuffix === suffix) {
      return parseInt(count);
    }
  }

  return 0; // Not found
};


 return (
  <div className="checker">
    {/* 🔁 Password Generator Section */}
    <div className="generator">
      <button
        onClick={() => {
          const newPass = generateStrongPassword();
          setPassword(newPass);
          setGeneratedPassword(newPass);
          handleChange({ target: { value: newPass } });
        }}
      >
        🔁 Generate Strong Password
      </button>

      {generatedPassword && (
        <div className="generated-output">
          <p><strong>Generated:</strong> {generatedPassword}</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedPassword);
              alert('Password copied to clipboard!');
            }}
          >
            📋 Copy
          </button>
        </div>
      )}
    </div>

    {/* 🔐 Password Input */}
    <input
      type="password"
      placeholder="Enter password"
      value={password}
      onChange={handleChange}
    />

    {/* 📊 Strength + Feedback */}
    {password && result && (
      <div className="feedback">
        <p><strong>Strength:</strong> {getStrength(result.score)}</p>
        <progress value={result.score} max="4"></progress>

        {result.feedback.suggestions.length > 0 && (
          <div className="suggestions">
            <p><strong>Suggestions:</strong></p>
            <ul>
              {result.feedback.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {result.feedback.warning && (
          <p><strong>Warning:</strong> {result.feedback.warning}</p>
        )}

        {/* 🔎 Pwned Password Check */}
        {pwnedCount !== null && (
          <div className="pwned-check">
            {pwnedCount > 0 ? (
              <p style={{ color: 'red' }}>
                ⚠️ This password has been seen <strong>{pwnedCount.toLocaleString()}</strong> times in data breaches. Don’t use it!
              </p>
            ) : (
              <p style={{ color: 'green' }}>
                ✅ This password hasn’t been seen in known breaches.
              </p>
            )}
          </div>
        )}
      </div>
    )}
  </div>
);


};

export default PasswordChecker;
