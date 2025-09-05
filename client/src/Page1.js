
import React, { useState } from 'react';
import uploadIcon from './assets/upload.svg';

var deviceName = 'iPhone 13';
var deviceType = 'smartphone';


function Page1() {

	const [selectedImages, setSelectedImages] = useState([]);

	const handleSend = () => {
		const deviceData = {
			deviceName,
			deviceType,
			// NEW: optional array of File objects (can be empty)
			images: selectedImages,
		};

		// NEW: Prefer dynamic opener origin so dev/prod both work.
		const openerOrigin =
			document.referrer ? new URL(document.referrer).origin : 'https://appdemo.gamificationsoftware.org';

		window.opener.postMessage(deviceData, openerOrigin);
		window.close();
	};

	let serverURL;

	if (!process.env.REACT_APP_API_URL) {
		serverURL = 'http://127.0.0.1:5000/api/image';
	} else {
		//serverURL = process.env.REACT_APP_API_URL + '/api/image';
		serverURL = '/imageapi/image';
	}

	//console.log("API base URL:", process.env.REACT_APP_API_URL);
	//console.log("serverURL is " + serverURL);

	const [responseHtml, setResponseHtml] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setResponseHtml('');

		const form = e.currentTarget;
		const formData = new FormData(form);

		// NEW: also keep a copy of the files the user picked so we can postMessage them later
		// Note: we read from the <input name="images" ...> that already exists
		const files = form.querySelector('input[name="images"]')?.files;
		setSelectedImages(files ? Array.from(files) : []);



		try {
			const res = await fetch(serverURL, {
				method: 'POST',
				body: formData,
			});

			const data = await res.json();

			if (data.reply) {
				console.log(data.reply);
				const inputString = data.reply;

				const devices = [
					"desktop",
					"laptop",
					"smartphone",
					"tablet",
					"externaldrive",
					"removablemedia",
					"other"
				];

				const match = inputString.match(/Device:\s*([^,]+)/);
				deviceName = match ? match[1].trim() : null;
				console.log("Detected device name: ", deviceName);

				const lowerInput = inputString.toLowerCase();
				const foundDevice = devices.find(device => lowerInput.includes(device.toLowerCase()));
				deviceType = foundDevice || "other";

				//console.log("Detected device type:", deviceType);

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
				<input
					type="file"
					className="fileinput"
					name="images"
					accept="image/*"
					multiple
					required
					onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
				/>
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
				Back to Case Manager
			</button>
		</div>

	);
}

export default Page1;