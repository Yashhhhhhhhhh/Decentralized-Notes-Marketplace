import React from 'react';

function EnvTester() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px', border: '2px solid blue' }}>
      <h3>🔧 Environment Variables Test</h3>
      <div>
        <strong>REACT_APP_PINATA_JWT:</strong> 
        <span style={{ color: process.env.REACT_APP_PINATA_JWT ? 'green' : 'red' }}>
          {process.env.REACT_APP_PINATA_JWT ? '✅ Loaded' : '❌ Missing'}
        </span>
        {process.env.REACT_APP_PINATA_JWT && (
          <div style={{ fontSize: '0.8em', fontFamily: 'monospace' }}>
            Length: {process.env.REACT_APP_PINATA_JWT.length}<br />
            First 50 chars: {process.env.REACT_APP_PINATA_JWT.substring(0, 50)}...
          </div>
        )}
      </div>
      <div>
        <strong>REACT_APP_PINATA_API_KEY:</strong> 
        <span style={{ color: process.env.REACT_APP_PINATA_API_KEY ? 'green' : 'red' }}>
          {process.env.REACT_APP_PINATA_API_KEY ? '✅ Loaded' : '❌ Missing'}
        </span>
      </div>
      <div>
        <strong>All REACT_APP_ variables:</strong>
        <ul>
          {Object.keys(process.env)
            .filter(key => key.startsWith('REACT_APP'))
            .map(key => (
              <li key={key}>{key}: {process.env[key] ? '✅' : '❌'}</li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export default EnvTester;
