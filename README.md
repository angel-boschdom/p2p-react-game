## **Project Name**: David vs Goliath - P2P 3D Game

### **Project Overview**

This project is a 3D multiplayer game where one player controls David and another player controls Goliath. The game uses **WebRTC** to establish peer-to-peer (P2P) communication between two clients (host and guest). No backend server should be used, and the game should function entirely as a client-side React web app. 

The host is responsible for preloading assets and maintaining the game state in memory. The guest connects to the host using WebRTC via manual signaling (SDP exchange). Both players can play the game after establishing the connection.

### **Requirements**

#### **Must Haves**:
1. **Tech Stack**:
   - **React**: For the frontend structure and component-based UI.
   - **Three.js**: For 3D rendering of the game environment and characters.
   - **WebRTC**: For peer-to-peer communication (manual SDP offer/answer exchange).
   - **JavaScript (ES6+)**: For general scripting.
   - **CSS**: For styling.
   - **No Backend**: The entire project must run without a backend server, including no signaling server. Manual copy-paste of SDP offers/answers will handle signaling.

2. **Game Structure**:
   - **David vs Goliath Theme**:
     - One player controls David (smaller, agile character).
     - The other controls Goliath (larger, more powerful).
   - Basic mechanics should include player movement, attack, and health system for each player.
   
3. **Manual WebRTC Signaling**:
   - **Host**:
     - Generates an SDP offer.
     - Provides a text area to allow the host to copy the SDP offer to send to the guest manually (e.g., via a messaging app).
     - Provides a text area where the host can paste the guest's SDP answer and submit it to complete the WebRTC connection.
   - **Guest**:
     - Provides a text area where the guest pastes the host’s SDP offer.
     - Generates an SDP answer after processing the offer and allows the guest to copy it.
     - Provides a text area where the guest can paste the host’s SDP offer.

4. **Asset Management**:
   - The host must preload 3D models, textures, and assets (e.g., `.fbx` files) before the game starts.
   - Store assets in the `/assets/` folder.

5. **P2P Game Synchronization**:
   - Game state, including positions, actions (attacks), and health, must be synchronized between the host and guest in real-time using the WebRTC data channel.

6. **No Backend or Third-Party Signaling Service**:
   - The app **must not** rely on any backend server or third-party services (e.g., Firebase, PeerJS) for signaling.
   - Use **manual signaling** via SDP offer/answer exchange.
   
7. **Peer-to-Peer Connection**:
   - After the SDP exchange, the connection should be direct between the two peers.
   - The game data should be exchanged using WebRTC data channels.

8. **Game Interface**:
   - **Landing Page**: Users select if they are a "Host" or "Guest."
   - **Host Page**: 
     - Displays the SDP offer in a text area.
     - Allows pasting the SDP answer received from the guest.
     - Shows a loading screen while assets are preloading.
   - **Guest Page**:
     - Allows pasting the SDP offer received from the host.
     - Displays the SDP answer in a text area for the guest to send back to the host.
   
9. **Responsive Design**:
   - The game must run smoothly on both desktop and mobile browsers.
   - Use CSS or React frameworks to ensure responsive layout for the game interface.

#### **Must Not Haves**:
1. **No Backend Server**: No backend or persistent server should be deployed for signaling or game state management. The game must be fully static and P2P.
2. **No Third-Party Signaling**: The project must not rely on external services like Firebase, PeerJS, or WebSocket servers for signaling.
3. **No Persistent Data Storage**: There should be no server-side or cloud-based persistent storage. Everything should be kept in memory during the session.
4. **No Game Lobbies**: Players must connect manually using copy-paste. There are no lobbies or matchmaking.


### **Tech Stack**

1. **React**: Main framework for the app.
2. **Three.js**: For 3D rendering and game world.
3. **WebRTC**: For peer-to-peer connection and data transfer.
4. **HTML5 & CSS3**: For the game’s interface.
5. **JavaScript (ES6)**: For app logic and WebRTC integration.
6. **Assets**: 3D models, textures, and any other game assets (stored locally in `/assets/`).


### **Component Descriptions**

1. **App.js**:
   - The root component that displays either the `HostPage` or `GuestPage` based on the user’s selection.

2. **HostPage.js**:
   - Manages the WebRTC connection setup for the host.
   - Generates and displays the SDP offer.
   - Provides an input for the host to paste the SDP answer from the guest.
   - Preloads assets in the background.

3. **GuestPage.js**:
   - Manages the WebRTC connection setup for the guest.
   - Accepts and processes the host's SDP offer.
   - Generates and displays the SDP answer.
   - Handles WebRTC data channel setup to communicate with the host.

4. **Game.js**:
   - Implements the actual 3D game using Three.js.
   - Contains the game loop, rendering logic, and player movement/interaction.
   - Synchronizes the game state (player positions, actions) between host and guest via WebRTC.

5. **index.html**:
   - The basic HTML structure for the React app.
   
6. **Assets**:
   - 3D models (e.g., David and Goliath characters) should be stored here.
   - Other game assets (e.g., textures) should also be stored here.


### **WebRTC Setup**

1. **Host**:
   - Creates a new `RTCPeerConnection` object.
   - Generates an SDP offer and allows the host to copy it.
   - Listens for the guest's SDP answer and processes it.

2. **Guest**:
   - Receives the host’s SDP offer and sets it as the remote description.
   - Generates an SDP answer and allows the guest to copy it.
   - Sends ICE candidates to the host after the connection is established.

3. **WebRTC Data Channel**:
   - Used for real-time synchronization of game state between host and guest (e.g., player movement, health status, attacks).


### **Asset Preloading** (Host Only)
- The host must preload 3D assets (stored in `/assets/`).
- Preloading should occur while waiting for the guest to connect.
- Use JavaScript’s `Promise.all()` to handle the preloading process and show a loading screen until complete.


### **Game State Synchronization**
- The host maintains the authoritative game state.
- The game state (e.g., player positions, actions, health) is synchronized via WebRTC data channels between host and guest.
- Use efficient data serialization (e.g., JSON or binary formats) to minimize latency.


### **Error Handling**
- Provide error handling for connection failures, SDP issues, and unsupported browsers.
- Ensure smooth fallback or error messages when WebRTC connections fail.


### **Deployment Considerations**
- The entire app should be deployable as static files on a service like GitHub Pages, Vercel, or Netlify.
- The game should work purely on the frontend with no backend interaction.
