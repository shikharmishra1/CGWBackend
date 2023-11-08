import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { HfInferenceEndpoint } from '@huggingface/inference';

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const prompt = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    try {
      // Set up headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const hf = new HfInferenceEndpoint('https://api-inference.huggingface.co/models/OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5', HUGGINGFACE_API_KEY);
      const stream = hf.textGenerationStream({ inputs: prompt, parameters: { max_new_tokens: 100 } });
      
      for await (const r of stream) { 

          res.write(r.token.text);
          

      }
      res.end();
      
    } catch (error:any) {
      console.error('Error calling Hugging Face API:', error);
      res.status(error?.response?.status || 500).json({ error: 'Error generating response' });
    }
  } else {
    // Handle any non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
