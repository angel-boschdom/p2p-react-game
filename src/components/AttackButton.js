// /src/components/AttackButton.js
import React from 'react';
import './AttackButton.css';

function AttackButton({ onAttack }) {
  return (
    <button
      className="attack-button"
      onTouchStart={onAttack}
      onMouseDown={onAttack}
    >
      Attack
    </button>
  );
}

export default AttackButton;
