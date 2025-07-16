// App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Page1 from './Page1';
import Page2 from './Page2';
import './App.css';

import magnifyingGlassIcon from './assets/magnifyingglass.svg';


function Home() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/')
      .then(response => response.text())
      .then(data => setMessage(data));
  }, []);

  return (
    <div className="Page">
	  <h1>Device Identifier 1.0</h1>
      <button onClick={() => navigate('/page1')} class="gray-button">
		<img src={magnifyingGlassIcon} alt="magnifying glass icon" class="icon" style={{ width: '30px', height: '30px' }} />
			Identify
			</button>
      
		
  
	  
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/page1" element={<Page1 />} />
      <Route path="/page2" element={<Page2 />} />
    </Routes>
  );
}

export default App;
