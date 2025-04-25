import React, { useState } from 'react';

const Calculator: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('1 + 1');
  const [result, setResult] = useState<string>('');

  const handleClick = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5001/${inputValue}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.text();
      setResult(data);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setResult('Error occurred');
    }
  };

  return (
    <div>
      <h1>Simple Python Calculator!</h1>
      <p>Input something like <code>1 + 1</code>.</p>
      <input
        id="input"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button id="btn" onClick={handleClick}>
        Send to Python!
      </button>
      <br />
      <br />
      Got <span id="result">{result}</span>
      <div id="root"></div>
    </div>
  );
};

export default Calculator;