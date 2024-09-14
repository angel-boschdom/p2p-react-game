import React, { useState, useEffect, useCallback, useRef } from 'react';
import Game from './Game';

function HostPage() {
  const [offer, setOffer] = useState('');
  const [answer, setAnswer] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);

  const createOffer = useCallback(async () => {
    if (peerConnectionRef.current) {
      try {
        console.log('Creating offer...');
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        // Wait for ICE gathering to complete
        await new Promise((resolve) => {
          if (peerConnectionRef.current.iceGatheringState === 'complete') {
            resolve();
          } else {
            const checkState = () => {
              if (peerConnectionRef.current.iceGatheringState === 'complete') {
                peerConnectionRef.current.removeEventListener('icegatheringstatechange', checkState);
                resolve();
              }
            };
            peerConnectionRef.current.addEventListener('icegatheringstatechange', checkState);
          }
        });

        console.log('Local description set with ICE candidates');
        setOffer(JSON.stringify(peerConnectionRef.current.localDescription));
      } catch (error) {
        console.error('Error creating offer:', error);
        setError('Failed to create offer: ' + error.message);
      }
    } else {
      console.error('PeerConnection is null');
      setError('PeerConnection is not initialized');
    }
  }, []);

  useEffect(() => {
    console.log('Initializing peer connection...');
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = new RTCPeerConnection();

      dataChannelRef.current = peerConnectionRef.current.createDataChannel('gameData');

      dataChannelRef.current.onopen = () => {
        console.log('Data channel opened');
        setConnected(true);
      };

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('New ICE candidate:', event.candidate);
        }
      };

      // Call createOffer here, after peerConnection is initialized
      createOffer();
    }

    return () => {
      console.log('Cleaning up peer connection');
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [createOffer]);

  const handleAnswerSubmit = async () => {
    if (peerConnectionRef.current) {
      try {
        console.log('Setting remote description...');
        const answerObj = JSON.parse(answer);
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answerObj));
        console.log('Remote description set');
      } catch (error) {
        console.error('Error setting remote description:', error);
        setError('Failed to set remote description: ' + error.message);
      }
    }
  };

  return (
    <div className="host-page">
      <h2>Host Page</h2>
      {error && <div style={{color: 'red'}}>{error}</div>}
      {!connected ? (
        <>
          <div>
            <h3>SDP Offer:</h3>
            <textarea value={offer} readOnly rows={10} cols={50} />
          </div>
          <div>
            <h3>Paste SDP Answer:</h3>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={10}
              cols={50}
            />
            <button onClick={handleAnswerSubmit}>Submit Answer</button>
          </div>
        </>
      ) : (
        <Game isHost={true} dataChannel={dataChannelRef.current} />
      )}
    </div>
  );
}

export default HostPage;