// /src/components/WASDSpacebarVisualizer.js
import React, { useState, useEffect } from 'react';
import './WASDSpacebarVisualizer.css';

function WASDSpacebarVisualizer() {
  const [keysPressed, setKeysPressed] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeysPressed((prev) => ({
        ...prev,
        [e.key.toLowerCase()]: true,
      }));
    };

    const handleKeyUp = (e) => {
      setKeysPressed((prev) => ({
        ...prev,
        [e.key.toLowerCase()]: false,
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="wasd-visualizer">
      <div className={`key ${keysPressed.w ? 'active' : ''}`}>W</div>
      <div className="key-row">
        <div className={`key ${keysPressed.a ? 'active' : ''}`}>A</div>
        <div className={`key ${keysPressed.s ? 'active' : ''}`}>S</div>
        <div className={`key ${keysPressed.d ? 'active' : ''}`}>D</div>
      </div>
      <div className={`key spacebar ${keysPressed[' '] ? 'active' : ''}`}>
        Space
      </div>
    </div>
  );
}

export default WASDSpacebarVisualizer;
