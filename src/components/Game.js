// src/components/Game.js

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber'; // Updated import
import InputManager from './InputManager';
import PhysicsEngine from './PhysicsEngine';
import Character from './Character';
import AssetLoader from './AssetLoader';
import './Game.css';

function Game({ isHost, dataChannel }) {
  const [isMobile, setIsMobile] = useState(false);
  const [inputState, setInputState] = useState({
    move: { x: 0, y: 0 },
    look: { x: 0, y: 0 },
    attack: false,
  });
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const assets = useRef({});
  const canvasRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const userAgent = navigator.userAgent || '';
    setIsMobile(/android|iphone|ipad|mobile/i.test(userAgent));
  }, []);

  // Load assets
  useEffect(() => {
    AssetLoader.loadAssets().then((loadedAssets) => {
      assets.current = loadedAssets;
      setAssetsLoaded(true);
    });
  }, []);

  const handleMove = (vector) => {
    setInputState((prev) => ({ ...prev, move: vector }));
  };

  const handleLook = (vector) => {
    setInputState((prev) => ({ ...prev, look: vector }));
  };

  const handleAttack = useCallback(() => {
    setInputState((prev) => ({ ...prev, attack: true }));
  }, []);

  // Handle keyboard inputs for desktop
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

  // Game logic and rendering
  const GameScene = ({ inputState, setInputState, isMobile, dataChannel, isHost }) => {
    const physicsEngineRef = useRef(null);
    const [gameState, setGameState] = useState({
      players: {},
      projectiles: [],
    });

    const { gl } = useThree();
    const canvas = gl.domElement;

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
          if (data.type === 'input') {
            const otherPlayerId = isHost ? 'guest' : 'host';
            physicsEngineRef.current.updatePlayerInput(otherPlayerId, data.input);
          } else if (data.type === 'state') {
            if (!isHost) {
              setGameState(data.state);
            }
          }
        };
      }
    }, [dataChannel, isHost]);

    useFrame((state, delta) => {
      const physicsEngine = physicsEngineRef.current;
      if (!physicsEngine) return;

      // Update own player input
      const playerId = isHost ? 'host' : 'guest';
      physicsEngine.updatePlayerInput(playerId, inputState);

      // Update physics engine
      physicsEngine.update(delta);

      // Update game state
      if (isHost) {
        const newState = {
          players: { ...physicsEngine.players },
          projectiles: [...physicsEngine.projectiles],
        };
        setGameState(newState);

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
        }
      }

      // Reset attack state after processing
      if (inputState.attack) {
        setInputState((prev) => ({ ...prev, attack: false }));
      }
    });

    // Mouse movement handling for desktop
    useEffect(() => {
      if (!isMobile) {
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
    }, [isMobile, canvas, setInputState]);

    return (
      <>
        {/* Render players */}
        {Object.values(gameState.players).map((player) => (
          <Character
            key={player.playerId}
            isHost={player.isHost}
            position={[
              player.position.x,
              player.position.y,
              player.position.z,
            ]}
            rotation={[player.rotation.x, player.rotation.y, player.rotation.z]}
            inputState={player.input}
            assets={assets.current}
          />
        ))}
        {/* Render projectiles */}
        {/* Implement projectile rendering */}
      </>
    );
  };

  return (
    <div className={`game-container ${isMobile ? 'mobile-rotated' : ''}`}>
      {assetsLoaded ? (
        <>
          <Canvas
            style={{ width: '100%', height: '100%' }}
            camera={{ position: [0, 5, 10], fov: 60 }}
            onCreated={({ gl }) => {
              canvasRef.current = gl.domElement;
            }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 20, 10]} />
            <GameScene
              inputState={inputState}
              setInputState={setInputState}
              isMobile={isMobile}
              dataChannel={dataChannel}
              isHost={isHost}
            />
          </Canvas>
          <InputManager
            isMobile={isMobile}
            onMove={handleMove}
            onLook={handleLook}
            onAttack={handleAttack}
          />
        </>
      ) : (
        <div className="loading-screen">Loading assets...</div>
      )}
    </div>
  );
}

export default Game;