// /src/components/Game.js
import React, { useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import InputManager from './InputManager';
import useSound from 'use-sound';
import './Game.css';

function Player({ modelPath, position, rotation }) {
  const { scene } = useGLTF(modelPath);
  return (
     <primitive object={scene} position={position} rotation={rotation} />
  );
}

function Projectile({ modelPath, position, velocity, onCollide }) {
  const [pos, setPos] = useState(position);
  const glb = useGLTF(modelPath);

  useFrame((_, delta) => {
    // Simple physics update
    setPos((prev) => ({
      x: prev.x + velocity.x * delta,
      y: prev.y + velocity.y * delta - 0.5 * 9.81 * delta * delta, // gravity
      z: prev.z + velocity.z * delta,
    }));
    // Collision detection placeholder
    // if (detectCollision()) {
    //   onCollide();
    // }
  });

  return <primitive object={glb} position={[pos.x, pos.y, pos.z]} />;
}

function Game({ isHost, dataChannel }) {
  const [isMobile, setIsMobile] = useState(false);
  const [inputState, setInputState] = useState({
    move: { x: 0, y: 0 },
    look: { x: 0, y: 0 },
    attack: false,
  });
  const [playSlingshot] = useSound("/assets/audio/slingshoot.wav");
  const [playSpearThrust] = useSound("/assets/audio/spearthrust.wav");

  useEffect(() => {
    // Detect if mobile device
    const userAgent = navigator.userAgent || navigator.vendor || window.opera; // FixMe: 'vendor' is deprecated.ts(6385) lib.dom.d.ts(16003, 8): The declaration was marked as deprecated here. (property) NavigatorID.vendor: string @deprecated — MDN Reference
    setIsMobile(/android|iphone|ipad|mobile/i.test(userAgent));

    // Handle incoming data
    if (dataChannel) {
      dataChannel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Update game state with received data
      };
    }
  }, [dataChannel]);

  const handleMove = (vector) => {
    setInputState((prev) => ({ ...prev, move: vector }));
  };

  const handleLook = (vector) => {
    setInputState((prev) => ({ ...prev, look: vector }));
  };

  const handleAttack = () => {
    setInputState((prev) => ({ ...prev, attack: true }));
    if (isHost) {
      playSlingshot();
    } else {
      playSpearThrust();
    }
    // Send attack action to the other peer
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify({ type: 'attack' }));
    }
  };

  // Keyboard input handling for desktop
  useEffect(() => {
    if (!isMobile) {
      const handleKeyDown = (e) => {
        switch (e.key.toLowerCase()) {
          case 'w':
            setInputState((prev) => ({ ...prev, move: { ...prev.move, y: 1 } }));
            break;
          case 'a':
            setInputState((prev) => ({ ...prev, move: { ...prev.move, x: -1 } }));
            break;
          case 's':
            setInputState((prev) => ({ ...prev, move: { ...prev.move, y: -1 } }));
            break;
          case 'd':
            setInputState((prev) => ({ ...prev, move: { ...prev.move, x: 1 } }));
            break;
          case ' ':
            handleAttack();
            break;
          default:
            break;
        }
      };

      const handleKeyUp = (e) => {
        switch (e.key.toLowerCase()) {
          case 'w':
          case 's':
            setInputState((prev) => ({ ...prev, move: { ...prev.move, y: 0 } }));
            break;
          case 'a':
          case 'd':
            setInputState((prev) => ({ ...prev, move: { ...prev.move, x: 0 } }));
            break;
          default:
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // Cleanup
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [isMobile]);

  // Game loop and state management
  // ...

  return (
    <div className="game-container">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 20, 10]} />
        {/* Load and render players */}
        {isHost ? (
          <>
            <Player modelPath="/assets/models3d/david.glb" position={[0, 0, 0]} rotation={[0, 0, 0]} />
            {/* Other game elements */}
          </>
        ) : (
          <>
            <Player modelPath="/assets/models3d/goliath.glb" position={[0, 0, 0]} rotation={[0, 0, 0]} />
            {/* Other game elements */}
          </>
        )}
      </Canvas>
      <InputManager
        isMobile={isMobile}
        onMove={handleMove}
        onLook={handleLook}
        onAttack={handleAttack}
      />
    </div>
  );
}

export default Game;
