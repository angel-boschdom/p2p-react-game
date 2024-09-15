// /src/components/Game.js

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber'; // Added useFrame import
import { useGLTF } from '@react-three/drei';
import InputManager from './InputManager';
import useSound from 'use-sound';
import PhysicsEngine from './PhysicsEngine';
import './Game.css';

function PlayerModel({ modelPath, position, rotation }) {
  const { scene } = useGLTF(modelPath);
  return (
    <primitive object={scene} position={position} rotation={rotation} />
  );
}

function ProjectileModel({ modelPath, position }) {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} position={position} />;
}

// Move the game logic into a new component that is rendered inside Canvas
function GameScene({
  isHost,
  dataChannel,
  inputState,
  playSlingshot,
  playSpearThrust,
}) {
  const physicsEngineRef = useRef(null);
  const [gameState, updateGameState] = useState({
    players: {},
    projectiles: [],
  });

  const playerId = isHost ? 'host' : 'guest';

  useEffect(() => {
    // Initialize PhysicsEngine
    physicsEngineRef.current = new PhysicsEngine();

    // Add players
    physicsEngineRef.current.addPlayer('host', {
      playerId: 'host',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      health: 100,
      isHost: true,
      speed: 5,
    });

    physicsEngineRef.current.addPlayer('guest', {
      playerId: 'guest',
      position: { x: 10, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI, z: 0 },
      health: 100,
      isHost: false,
      speed: 4,
    });

    // Handle incoming data
    if (dataChannel) {
      dataChannel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received data:', data);

        if (data.type === 'input') {
          // Update input state of the other player
          const otherPlayerId = isHost ? 'guest' : 'host';
          physicsEngineRef.current.updatePlayerInput(otherPlayerId, data.input);
        } else if (data.type === 'state') {
          // Guest receives state from host
          if (!isHost) {
            updateGameState(data.state);
          }
        }
      };
    }
  }, [dataChannel, isHost]);

  // Use the useFrame hook inside the Canvas
  useFrame((state, delta) => {
    const physicsEngine = physicsEngineRef.current;
    if (!physicsEngine) return;

    // Update own player input
    physicsEngine.updatePlayerInput(playerId, inputState);

    // Update physics engine
    physicsEngine.update(delta);

    // Update game state
    if (isHost) {
      const newState = {
        players: { ...physicsEngine.players },
        projectiles: [...physicsEngine.projectiles],
      };
      updateGameState(newState);

      // Send state to guest
      if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(
          JSON.stringify({
            type: 'state',
            state: newState,
          })
        );
      }
    } else {
      // Guest sends input to host
      if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(
          JSON.stringify({
            type: 'input',
            input: inputState,
          })
        );
        console.log('Sent input:', inputState);
      }
    }

    // Reset attack state after processing
    if (inputState.attack) {
      inputState.attack = false;
    }
  });

  return (
    <>
      {/* Render players */}
      {Object.values(gameState.players).map((player) => (
        <PlayerModel
          key={player.playerId}
          modelPath={
            player.isHost
              ? `${process.env.PUBLIC_URL}/assets/models3d/david.glb`
              : `${process.env.PUBLIC_URL}/assets/models3d/goliath.glb`
          }
          position={[
            player.position.x,
            player.position.y,
            player.position.z,
          ]}
          rotation={[player.rotation.x, player.rotation.y, player.rotation.z]}
        />
      ))}
      {/* Render projectiles */}
      {gameState.projectiles.map((projectile, index) => (
        <ProjectileModel
          key={index}
          modelPath={
            projectile.ownerId === 'host'
              ? `${process.env.PUBLIC_URL}/assets/models3d/stone.glb`
              : `${process.env.PUBLIC_URL}/assets/models3d/spear.glb`
          }
          position={[
            projectile.position.x,
            projectile.position.y,
            projectile.position.z,
          ]}
        />
      ))}
    </>
  );
}

function Game({ isHost, dataChannel }) {
  const [isMobile, setIsMobile] = useState(false);
  const [inputState, setInputState] = useState({
    move: { x: 0, y: 0 },
    look: { x: 0, y: 0 },
    attack: false,
  });
  const [playSlingshot] = useSound(`${process.env.PUBLIC_URL}/assets/audio/slingshoot.wav`);
  const [playSpearThrust] = useSound(`${process.env.PUBLIC_URL}/assets/audio/spearthrust.wav`);

  useEffect(() => {
    // Detect if mobile device
    const userAgent = navigator.userAgent || '';
    setIsMobile(/android|iphone|ipad|mobile/i.test(userAgent));
  }, []);

  const handleMove = (vector) => {
    setInputState((prev) => ({ ...prev, move: vector }));
  };

  const handleLook = (vector) => {
    setInputState((prev) => ({ ...prev, look: vector }));
  };

  const handleAttack = useCallback(() => {
    setInputState((prev) => ({ ...prev, attack: true }));
    if (isHost) {
      playSlingshot();
    } else {
      playSpearThrust();
    }
  }, [isHost, playSlingshot, playSpearThrust]);

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
  }, [isMobile, handleAttack]);

  // Mouse movement handling for desktop
  useEffect(() => {
    if (!isMobile) {
      const canvas = document.querySelector('canvas');
      const sensitivity = 0.002;

      const handleMouseMove = (e) => {
        if (document.pointerLockElement === canvas) {
          const movementX = e.movementX || 0;
          const movementY = e.movementY || 0;
          setInputState((prev) => ({
            ...prev,
            look: {
              x: movementX * sensitivity,
              y: movementY * sensitivity,
            },
          }));
        }
      };

      const handleCanvasClick = () => {
        canvas.requestPointerLock();
      };

      canvas.addEventListener('click', handleCanvasClick);
      document.addEventListener('mousemove', handleMouseMove);

      return () => {
        canvas.removeEventListener('click', handleCanvasClick);
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [isMobile]);

  return (
    <div className="game-container">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 20, 10]} />
        <GameScene
          isHost={isHost}
          dataChannel={dataChannel}
          inputState={inputState}
          playSlingshot={playSlingshot}
          playSpearThrust={playSpearThrust}
        />
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
