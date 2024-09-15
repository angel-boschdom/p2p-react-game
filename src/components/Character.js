// src/components/Character.js

import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import * as THREE from 'three';

function Character({ isHost, position, rotation, inputState, assets }) {
  const characterRef = useRef();
  const mixer = useRef();
  const actions = useRef({});
  const slingshotMixer = useRef();
  const slingshotAction = useRef();

  useEffect(() => {
    // Clone the character model
    const characterModel = clone(assets.characterModel);
    characterRef.current.add(characterModel);

    // Create animation mixer
    mixer.current = new THREE.AnimationMixer(characterModel);

    // Load animations
    assets.animations.forEach((clip) => {
      const action = mixer.current.clipAction(clip);
      actions.current[clip.name] = action;
    });

    // Play idle animation by default
    playAnimation('enemycharacter-animation-idle');

    // Attach slingshot to character
    const handBone = characterModel.getObjectByName('Hand.R'); // Replace with correct bone name
    if (handBone && assets.slingshotModel) {
      handBone.add(assets.slingshotModel);
      assets.slingshotModel.position.set(0, 0, 0);
      assets.slingshotModel.rotation.set(0, 0, 0);

      // Create mixer for slingshot animation
      slingshotMixer.current = new THREE.AnimationMixer(assets.slingshotModel);
      slingshotAction.current = slingshotMixer.current.clipAction(
        assets.slingshotAnimation
      );
    }
  }, [assets]);

  const playAnimation = (name) => {
    Object.values(actions.current).forEach((action) => action.stop());
    if (actions.current[name]) {
      actions.current[name].reset().play();
    }
  };

  const triggerShoot = () => {
    if (slingshotAction.current) {
      slingshotAction.current.reset().play();
    }
  };

  useEffect(() => {
    // Update animations based on inputState
    if (inputState.attack) {
      if (isHost) {
        playAnimation('enemycharacter-animation-slingshot');
        triggerShoot();
      } else {
        playAnimation('enemycharacter-animation-spearthrust');
      }
    } else if (
      inputState.move.x !== 0 ||
      inputState.move.y !== 0 ||
      inputState.look.x !== 0 ||
      inputState.look.y !== 0
    ) {
      playAnimation('enemycharacter-animation-runforward');
    } else {
      playAnimation('enemycharacter-animation-idle');
    }
  }, [inputState, isHost]);

  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);
    if (slingshotMixer.current) slingshotMixer.current.update(delta);
    if (characterRef.current) {
      characterRef.current.position.set(position[0], position[1], position[2]);
      characterRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
    }
  });

  return <group ref={characterRef}></group>;
}

export default Character;
