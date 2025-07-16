
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import uploadIcon from './assets/upload.svg';


const deviceName = 'iPhone 13';
const deviceType = 'Smartphone';


function Page1() {  

	const handleSend = () => {
		const deviceData = {
		  deviceName: 'iPhone 13',
		  deviceType: 'Smartphone',
		};

		// Send the message to the parent window
		window.opener.postMessage(deviceData, 'http://localhost:3000'); // Replace with actual Case Manager origin

		// Optionally close this tab after sending
		window.close();
	  };
  
  
	let serverURL;

	if (!process.env.REACT_APP_API_URL) {
		serverURL = 'http://127.0.0.1:5000/api/image';
	} else {
		serverURL = process.env.REACT_APP_API_URL + '/api/image';
	}
  
  console.log("API base URL:", process.env.REACT_APP_API_URL);
  console.log("serverURL is " + serverURL);
  
  
  const navigate = useNavigate();
  const [responseHtml, setResponseHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseHtml('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(serverURL, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.reply) {
        setResponseHtml(`<p>${data.reply}</p>`);
      } else {
        setResponseHtml('Unexpected response format.');
      }
    } catch (err) {
      console.error(err);
      setResponseHtml('Error contacting server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Page">
      <h1 className="text-2xl font-bold mb-4">Upload Images</h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <input type="file" className="fileinput" name="images" accept="image/*" multiple required />
        <div>
          <button
            type="submit"
			class="gray-button"
            disabled={loading}
          >
		  <img src={uploadIcon} alt="upload icon" class="icon" style={{ width: '30px', height: '30px' }} />
            {loading ? 'Identifying...' : 'Send to Assistant'}
			 
          </button>
        </div>
      </form>

		<div class="tips">
		  <strong>Tips:</strong>
		  <ol>
			<li>Take at least two photos, front and back, or from different angles/sides</li>
			<li>If applicable, remove protective cover</li>
		  </ol>
		</div>

      <div
        id="response"
		className="resultBox"
        dangerouslySetInnerHTML={{ __html: responseHtml }}
      />
	  
	   <button className="gray-button" onClick={handleSend}>
			Send to Case Manager
		  </button>
		</div>
	
  );
}

export default Page1;
