import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [status, setStatus] = useState('Disconnected');
  const [location, setLocation] = useState({ lat: '0.0000', lng: '0.0000' });
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Automatically switch between local bridge and Render cloud bridge
    const SOCKET_URL = window.location.hostname === 'localhost' || window.location.protocol === 'file:'
      ? 'ws://localhost:8080' 
      : 'wss://panda-switch-bridge.onrender.com'; // Replace with your actual Render service URL if different

    const websocket = new WebSocket(SOCKET_URL);

    websocket.onopen = () => {
      setStatus('Connected to Cyber-Bridge ⚡');
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.lat && data.lng) {
          setLocation({ lat: data.lat, lng: data.lng });
        }
      } catch (e) {
        console.error('Failed to parse incoming message', e);
      }
    };

    websocket.onclose = () => {
      setStatus('Disconnected 🔌');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const sendLocationUpdate = (lat, lng) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ lat, lng }));
      setLocation({ lat, lng });
    }
  };

  return (
    <div className="cyber-container">
      <header className="cyber-header">
        <h1>🐼 PANDA Switch</h1>
        <p className="status-badge">{status}</p>
      </header>

      <main className="cyber-main">
        <div className="glass-card">
          <h2>Telemetry Coordinates</h2>
          <div className="coords-display">
            <span>Lat: {location.lat}</span>
            <span>Lng: {location.lng}</span>
          </div>
          <button 
            className="cyber-btn"
            onClick={() => sendLocationUpdate('40.7128', '-74.0060')}
          >
            Transmit Test Vector
          </button>
        </div>
      </main>
    </div>
  );
}
