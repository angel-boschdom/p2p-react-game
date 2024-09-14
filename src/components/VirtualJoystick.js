// /src/components/VirtualJoystick.js
import React, { useState, useEffect } from 'react';
import nipplejs from 'nipplejs';
import './VirtualJoystick.css';

function VirtualJoystick({ onMove, onLook }) {
  const [leftJoystick, setLeftJoystick] = useState(null);
  const [rightJoystick, setRightJoystick] = useState(null);

  useEffect(() => {
    // Left joystick for movement
    const leftOptions = {
      zone: document.getElementById('left-joystick'),
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: 'blue',
    };
    const left = nipplejs.create(leftOptions);
    setLeftJoystick(left);

    // Right joystick for looking/aiming
    const rightOptions = {
      zone: document.getElementById('right-joystick'),
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: 'red',
    };
    const right = nipplejs.create(rightOptions);
    setRightJoystick(right);

    // Cleanup on unmount
    return () => {
      if (left) left.destroy();
      if (right) right.destroy();
    };
  }, []);

  useEffect(() => {
    if (leftJoystick) {
      leftJoystick.on('move', (evt, data) => {
        const { vector } = data;
        onMove(vector);
      });
      leftJoystick.on('end', () => {
        onMove({ x: 0, y: 0 });
      });
    }
  }, [leftJoystick, onMove]);

  useEffect(() => {
    if (rightJoystick) {
      rightJoystick.on('move', (evt, data) => {
        const { vector } = data;
        onLook(vector);
      });
      rightJoystick.on('end', () => {
        onLook({ x: 0, y: 0 });
      });
    }
  }, [rightJoystick, onLook]);

  return (
    <div className="virtual-joystick-container">
      <div id="left-joystick" className="joystick-zone left"></div>
      <div id="right-joystick" className="joystick-zone right"></div>
    </div>
  );
}

export default VirtualJoystick;
