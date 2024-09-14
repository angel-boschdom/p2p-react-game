import React, { useState } from 'react';
import HostPage from './components/HostPage';
import GuestPage from './components/GuestPage';
import './App.css';

function App() {
  const [role, setRole] = useState(null);

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
  };

  return (
    <div className="App">
      {!role ? (
        <div className="role-selection">
          <h1>David vs Goliath - P2P 3D Game</h1>
          <button onClick={() => selectRole('host')}>Host Game</button>
          <button onClick={() => selectRole('guest')}>Join Game</button>
        </div>
      ) : role === 'host' ? (
        <HostPage />
      ) : (
        <GuestPage />
      )}
    </div>
  );
}

export default App;