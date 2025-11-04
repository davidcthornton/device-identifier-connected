
import React, { useState } from 'react';
import uploadIcon from './assets/upload.svg';
import removingProtectiveSleeveFromSmartphone from './assets/removingProtectiveSleeveFromSmartphone.png';

var deviceName = 'unknown';
var deviceType = 'other';



function Page1() {

	const [selectedImages, setSelectedImages] = useState([]);
	// Allow both pick-from-folder and camera captures to accumulate
	const appendToSelected = (files) =>
		setSelectedImages((prev) => [...prev, ...Array.from(files || [])]);


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

	// CRA only
	const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');
	const serverURL = `${API_BASE || ''}/image`;


	console.log("API base URL:", process.env.REACT_APP_API_URL);
	console.log("serverURL is " + serverURL);

	const [responseHtml, setResponseHtml] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setResponseHtml('');

		const form = e.currentTarget;
		const formData = new FormData(form);

		const allFiles = Array.from(
			form.querySelectorAll('input[name="images"]')
		).flatMap((inp) => Array.from(inp.files || []));


		if (allFiles.length === 0) {
			setLoading(false);
			setResponseHtml('Please select or capture at least one image.');
			return;
		}

		setSelectedImages(allFiles);




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
					"router",
					"other"
				];

				const match = inputString.match(/Device:\s*([^,]+)/);
				deviceName = match ? match[1].trim() : null;
				console.log("Detected device name: ", deviceName);

				const lowerInput = inputString.toLowerCase();
				const foundDevice = devices.find(device => lowerInput.includes(device.toLowerCase()));
				deviceType = foundDevice || "other";

				console.log("Detected device type:", deviceType);

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
			<h1 className="text-2xl font-bold mb-4">Device Identifier</h1>

			<form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">



				{/* Either/Or Section */}
				<fieldset
					style={{
						border: '1px solid #ccc',
						borderRadius: '8px',
						padding: '16px',
						marginTop: '16px',
					}}
				>



					<input
						type="file"
						className="fileinput"
						name="images"
						accept="image/*"
						multiple
						onChange={(e) => appendToSelected(e.target.files)}
					/>


					<p> or </p>
					{/* Hidden camera capture input */}
					<input
						id="cameraInput"
						type="file"
						name="images"
						accept="image/*"
						capture="environment"    // Prefer rear camera on mobile, falls back gracefully
						multiple
						style={{ display: 'none' }}
						onChange={(e) => appendToSelected(e.target.files)}
					/>

					{/* Visible button to trigger the camera input */}
					<div style={{ marginTop: 8 }}>
						<button
							type="button"

							onClick={() => document.getElementById('cameraInput')?.click()}
							style={{ display: 'flex', alignItems: 'left' }}
						>
							📷 Take Photos
						</button>
					</div>

				</fieldset>







				<div style={{ marginTop: 20 }}>
					<button
						type="submit"
						className="gray-button"
						disabled={loading}
						style={{
							fontWeight: 'bold',
							padding: '10px 20px',
							borderRadius: '6px',
							marginTop: '10px',
							border: '2px solid rgba(0,0,0)',
						}}
					>
						<img src={uploadIcon} alt="upload icon" className="icon" style={{ width: '30px', height: '30px', marginRight: '8px' }} />
						{loading ? 'Identifying...' : 'Identify Now'}
					</button>
				</div>
			</form>

			<div class="tips">
				<strong>Tips:</strong>
				<ol>
					<li>For best results, take two photos, front and back, or from different angles/sides</li>
					<li>If applicable, remove protective cover</li>
				</ol>
				<img
					src={removingProtectiveSleeveFromSmartphone}
					alt="Description of image"
					style={{ width: '40%', height: 'auto' }}
				/>
			</div>

			<div
				id="response"
				className="resultBox"
				dangerouslySetInnerHTML={{ __html: responseHtml }}
			/>

			{document.referrer && (
				<button className="gray-button" onClick={handleSend}>
					Back to Case Manager
				</button>
			)}

		</div>

	);
}

export default Page1;