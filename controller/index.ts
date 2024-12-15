// Backend: Node.js Server
import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import bodyParser from 'body-parser';
import fs from 'fs';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(bodyParser.json());

type SliderValues = [number, number, number, number, number];

// Store slider values
let sliderValues: SliderValues = [0, 0, 0, 0, 0];

// REST API to update slider values
app.post('/api/sliders', (req: Request, res: Response) => {
  const { sliders } = req.body;
  if (!Array.isArray(sliders) || sliders.length !== 5 || sliders.some((v: any) => typeof v !== 'number')) {
    return res.status(400).json({ error: 'Invalid slider values' });
  }

  sliderValues = sliders as SliderValues;
    console.log(sliderValues)
  // Broadcast new values to all WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(sliderValues));
    }
  });

  res.json({ success: true, sliders: sliderValues });
});

// Serve frontend
app.use(express.static('public'));

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('A user connected');

  // Send current slider values on new connection
  ws.send(JSON.stringify(sliderValues));

  ws.on('close', () => {
    console.log('A user disconnected');
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
