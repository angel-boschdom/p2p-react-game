import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';

function Player({ isHost, position, color }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Box ref={meshRef} args={isHost ? [1, 1, 1] : [2, 2, 2]} position={position}>
      <meshStandardMaterial color={color} />
    </Box>
  );
}

function Game({ isHost, dataChannel }) {
  useEffect(() => {
    if (dataChannel) {
      dataChannel.onmessage = (event) => {
        // Handle incoming game state updates
        console.log('Received data:', event.data);
      };
    }
  }, [dataChannel]);

  const sendGameState = (state) => {
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify(state));
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Player isHost={isHost} position={isHost ? [-2, 0, 0] : [2, 0, 0]} color={isHost ? 'blue' : 'red'} />
      </Canvas>
    </div>
  );
}

export default Game;