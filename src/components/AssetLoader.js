// src/components/AssetLoader.js

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const AssetLoader = {
  loadAssets: async () => {
    const MODEL_PATH = `${process.env.PUBLIC_URL}/assets/models3d/enemycharacter.glb`;
    const ANIMATION_NAMES = [
      'enemycharacter-animation-idle.glb',
      'enemycharacter-animation-runforward.glb',
      'enemycharacter-animation-hit.glb',
      'enemycharacter-animation-slingshot.glb',
      // Add other animations as needed
    ];
    const SLINGSHOT_PATH = `${process.env.PUBLIC_URL}/assets/models3d/slingshot.glb`;

    const loader = new GLTFLoader();
    const manager = new THREE.LoadingManager();

    return new Promise((resolve, reject) => {
      const assets = {
        characterModel: null,
        animations: [],
        slingshotModel: null,
        slingshotAnimation: null,
      };
      let itemsLoaded = 0;
      const totalItems = 2 + ANIMATION_NAMES.length;

      manager.onLoad = () => {
        resolve(assets);
      };

      manager.onError = (url) => {
        reject(new Error(`Failed to load ${url}`));
      };

      const checkProgress = () => {
        itemsLoaded += 1;
        if (itemsLoaded >= totalItems) {
          manager.onLoad();
        }
      };

      // Load character model
      loader.load(
        MODEL_PATH,
        (gltf) => {
          assets.characterModel = gltf.scene;
          checkProgress();
        },
        undefined,
        (error) => {
          reject(error);
        }
      );

      // Load animations
      ANIMATION_NAMES.forEach((name) => {
        const path = `${process.env.PUBLIC_URL}/assets/models3d/${name}`;
        loader.load(
          path,
          (gltf) => {
            if (gltf.animations && gltf.animations.length > 0) {
              assets.animations.push(gltf.animations[0]);
            }
            checkProgress();
          },
          undefined,
          (error) => {
            reject(error);
          }
        );
      });

      // Load slingshot model and animation
      loader.load(
        SLINGSHOT_PATH,
        (gltf) => {
          assets.slingshotModel = gltf.scene;
          if (gltf.animations && gltf.animations.length > 0) {
            assets.slingshotAnimation = gltf.animations[0];
          }
          checkProgress();
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  },
};

export default AssetLoader;
