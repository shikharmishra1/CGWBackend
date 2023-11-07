// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';


const HUGGINGFACE_ENDPOINT = "https://api-inference.huggingface.co/models/OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5";
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const  prompt  = req.body ;
        

        if (!prompt) {
            return res.status(400).json({ error: 'No prompt provided' });
        }

        try {
            const response = await axios.post(
                HUGGINGFACE_ENDPOINT,
                { inputs: prompt },
                {
                    headers: {
                        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
                    }
                }
            );

            console.log(response)
            res.status(200).json(response.data);
        } catch (error:any) {
            
            console.error('Error calling Hugging Face API:', error);
            if ( error.response.status == 503) {
                res.status(503).json({ error: 'Hugging Face API is unavailable or is currently loading please try again after some time' });
            }
            res.status(500).json({ error: 'Error generating response' });
        }
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
