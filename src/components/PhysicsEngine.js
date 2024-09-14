// /src/components/PhysicsEngine.js

class PhysicsEngine {
    constructor() {
      this.players = {}; // PlayerID to player state mapping
      this.projectiles = []; // List of active projectiles
    }
  
    addPlayer(playerId, initialState) {
      this.players[playerId] = {
        ...initialState,
        input: { move: { x: 0, y: 0 }, look: { x: 0, y: 0 }, attack: false },
      };
    }
  
    removePlayer(playerId) {
      delete this.players[playerId];
    }
  
    updatePlayerInput(playerId, inputState) {
      if (this.players[playerId]) {
        this.players[playerId].input = { ...inputState };
      }
    }
  
    spawnProjectile(projectile) {
      this.projectiles.push({ ...projectile });
    }
  
    update(deltaTime) {
      // Update players
      Object.values(this.players).forEach((player) => {
        this.updatePlayerPosition(player, deltaTime);
        if (player.input.attack) {
          this.handleAttack(player);
          player.input.attack = false; // Reset attack state
        }
      });
  
      // Update projectiles
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const projectile = this.projectiles[i];
        this.updateProjectile(projectile, deltaTime);
        if (this.checkProjectileCollision(projectile)) {
          this.handleProjectileCollision(projectile);
          this.projectiles.splice(i, 1); // Remove the projectile after collision
        }
      }
    }
  
    updatePlayerPosition(player, deltaTime) {
      const speed = player.speed || 5; // Units per second
  
      // Update rotation based on look input
      player.rotation.y -= player.input.look.x;
      player.rotation.x -= player.input.look.y;
      // Optionally clamp the rotation.x to prevent flipping over
      player.rotation.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, player.rotation.x)
      );
  
      // Reset look input after applying
      player.input.look.x = 0;
      player.input.look.y = 0;
  
      // Calculate forward and right vectors
      const forward = {
        x: Math.sin(player.rotation.y),
        y: 0,
        z: Math.cos(player.rotation.y),
      };
      const right = {
        x: Math.sin(player.rotation.y + Math.PI / 2),
        y: 0,
        z: Math.cos(player.rotation.y + Math.PI / 2),
      };
  
      // Update position based on move input
      player.position.x +=
        (forward.x * player.input.move.y + right.x * player.input.move.x) *
        speed *
        deltaTime;
      player.position.z +=
        (forward.z * player.input.move.y + right.z * player.input.move.x) *
        speed *
        deltaTime;
    }
  
    updateProjectile(projectile, deltaTime) {
      projectile.velocity.y -= 9.81 * deltaTime; // Apply gravity
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;
      projectile.position.z += projectile.velocity.z * deltaTime;
    }
  
    checkProjectileCollision(projectile) {
      return Object.values(this.players).some((player) => {
        if (player.playerId !== projectile.ownerId) {
          if (this.detectCollision(projectile, player)) {
            projectile.hitPlayerId = player.playerId;
            return true;
          }
        }
        return false;
      });
    }
  
    detectCollision(projectile, player) {
      const dx = projectile.position.x - player.position.x;
      const dy = projectile.position.y - player.position.y;
      const dz = projectile.position.z - player.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const collisionDistance = (projectile.radius || 0.5) + (player.radius || 1.0);
      return distance < collisionDistance;
    }
  
    handleProjectileCollision(projectile) {
      const player = this.players[projectile.hitPlayerId];
      player.health -= projectile.damage || 10;
      // Additional logic like playing sound effects can be added here
    }
  
    handleAttack(player) {
      if (player.isHost) {
        // David attacks (throws stone)
        const direction = {
          x: Math.sin(player.rotation.y),
          y: 0,
          z: Math.cos(player.rotation.y),
        };
        const stone = {
          position: { ...player.position },
          velocity: {
            x: direction.x * 10,
            y: 5, // Initial upward velocity
            z: direction.z * 10,
          },
          radius: 0.2,
          damage: 20,
          ownerId: player.playerId,
        };
        this.spawnProjectile(stone);
      } else {
        // Goliath attacks (spear thrust)
        const otherPlayer = Object.values(this.players).find(
          (p) => p.playerId !== player.playerId
        );
        const dx = otherPlayer.position.x - player.position.x;
        const dz = otherPlayer.position.z - player.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance < 2) {
          otherPlayer.health -= 15;
          // Play spear hit sound effect if necessary
        }
      }
    }
  }
  
  export default PhysicsEngine;
  