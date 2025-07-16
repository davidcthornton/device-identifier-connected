const port = 5000;


import OpenAI from "openai";
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();


// Create OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });




const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public')); // Serve index.html from /public


app.post('/api/image', upload.array('images'), async (req, res) => {
  try {
    // Build messages array with a proper system message
    const input = [      
      {
        role: 'user',
        content: [     
        ]
      }
    ];

   // Append image data URLs to the user message
    for (const file of req.files) {
		//console.log(file);
      const base64Image = fs.readFileSync(file.path, { encoding: 'base64' });
      input[0].content.push({
        type: 'input_image',
        image_url: `data:image/jpeg;base64,${base64Image}`        
      });
    }
	
	console.log(input);
	//for (const thingy of input) {
		//console.log(thingy);
	//}
	
    // Call OpenAI API with tuned parameters
   const response = await openai.responses.create({
      model: 'gpt-4o',
	  "max_output_tokens": 1000,	  
	  instructions: 'This GPT assists law enforcement officers in identifying electronic devices based on uploaded images. When provided with a photo of a device, it analyzes visual cues to determine the device type (e.g., smartphone, laptop, router) and, if possible, the specific model number and manufacturer. The GPT is optimized for accuracy and objectivity and avoids speculation. If identification is not possible, it clearly states this. It is not intended to provide legal advice or perform forensic analysis. It stays concise, professional, and focused strictly on the task of visual identification of electronics.  The GPT prioritizes clear and actionable feedback. It does not generate hypothetical scenarios or engage in conversation beyond device identification. It avoids making assumptions and refrains from guessing when visual information is insufficient.  It communicates in a neutral, precise tone appropriate for professional law enforcement contexts. It avoids jargon and keeps responses brief and direct.  It is prepared to interpret images showing partial views of devices and should highlight any identifiable features such as logos, button placement, screen type, or ports when making assessments.  Format your reply in the following style: "This device appears to be a <manufacturer> <model>.".',
	  tools: [{ type: "web_search_preview" }],
	  "tool_choice": "auto",
      input: input,      
      temperature: 0  // Deterministic, precise output
    });

    // Clean up uploaded files
    for (const file of req.files) {
      fs.unlinkSync(file.path);
    }

    // Send back the assistant's reply
	console.log(response);
	
    const reply = response.output_text;
	//const reply = "dave is testing";
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: 'Something went wrong!' });
  }
});



app.get('/', (req, res) => {
  res.send('Dave is very good looking');
});

app.listen(port, () => console.log('Server running on port 5000'));