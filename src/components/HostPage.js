import React, { useState, useEffect, useCallback, useRef } from 'react';
import Game from './Game';

function HostPage() {
  const [offer, setOffer] = useState('');
  const [answer, setAnswer] = useState('');
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('Waiting to generate SDP offer...');
  const [error, setError] = useState(null);

  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);

  const createOffer = useCallback(async () => {
    if (peerConnectionRef.current) {
      try {
        setStatus('Generating offer...');
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

        setOffer(JSON.stringify(peerConnectionRef.current.localDescription));
        setStatus('SDP Offer generated! Copy and send it to the guest.');
      } catch (error) {
        setError('Failed to create offer: ' + error.message);
        setStatus('Error occurred. Please try again.');
      }
    } else {
      setError('PeerConnection is not initialized');
      setStatus('Error occurred. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = new RTCPeerConnection();

      dataChannelRef.current = peerConnectionRef.current.createDataChannel('gameData');

      dataChannelRef.current.onopen = () => {
        setStatus('Connected!');
        setConnected(true);
      };

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('New ICE candidate:', event.candidate);
        }
      };

      createOffer();
    }

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [createOffer]);

  const handleAnswerSubmit = async () => {
    if (peerConnectionRef.current) {
      try {
        const answerObj = JSON.parse(answer);
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answerObj));
        setStatus('SDP Answer received. Connecting...');
      } catch (error) {
        setError('Failed to set remote description: ' + error.message);
        setStatus('Error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="host-page">
      <h2>Host Page</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <p>Status: {status}</p>
      {!connected ? (
        <>
          <div>
            <h3>SDP Offer:</h3>
            <textarea value={offer} readOnly rows={10} cols={50} />
            <button onClick={() => navigator.clipboard.writeText(offer)}>Copy Offer</button>
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