import React from 'react';
import VirtualJoystick from './VirtualJoystick';
import WASDSpacebarVisualizer from './WASDSpacebarVisualizer';
import AttackButton from './AttackButton';

function InputManager({ isMobile, onMove, onLook, onAttack }) {
  return isMobile ? (
    <>
      <VirtualJoystick onMove={onMove} onLook={onLook} />
      <AttackButton onAttack={onAttack} />
    </>
  ) : (
    <WASDSpacebarVisualizer onMove={onMove} onAttack={onAttack} />
  );
}

export default InputManager;