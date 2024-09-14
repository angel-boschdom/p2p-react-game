import React, { useState, useEffect } from 'react';
import Game from './Game';

function GuestPage() {
  const [peerConnection, setPeerConnection] = useState(null);
  const [offer, setOffer] = useState('');
  const [answer, setAnswer] = useState('');
  const [connected, setConnected] = useState(false);
  const [dataChannel, setDataChannel] = useState(null);

  useEffect(() => {
    const pc = new RTCPeerConnection();
    setPeerConnection(pc);

    pc.ondatachannel = (event) => {
      const dc = event.channel;
      setDataChannel(dc);
      dc.onopen = () => {
        console.log('Data channel opened');
        setConnected(true);
      };
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate);
      }
    };
  }, []);

  const handleOfferSubmit = async () => {
    const offerObj = JSON.parse(offer);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offerObj));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Wait for ICE gathering to complete
    await new Promise((resolve) => {
      if (peerConnection.iceGatheringState === 'complete') {
        resolve();
      } else {
        const checkState = () => {
          if (peerConnection.iceGatheringState === 'complete') {
            peerConnection.removeEventListener('icegatheringstatechange', checkState);
            resolve();
          }
        };
        peerConnection.addEventListener('icegatheringstatechange', checkState);
      }
    });

    setAnswer(JSON.stringify(peerConnection.localDescription));
  };

  return (
    <div className="guest-page">
      <h2>Guest Page</h2>
      {!connected ? (
        <>
          <div>
            <h3>Paste SDP Offer:</h3>
            <textarea
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              rows={10}
              cols={50}
            />
            <button onClick={handleOfferSubmit}>Submit Offer</button>
          </div>
          {answer && (
            <div>
              <h3>SDP Answer:</h3>
              <textarea value={answer} readOnly rows={10} cols={50} />
            </div>
          )}
        </>
      ) : (
        <Game isHost={false} dataChannel={dataChannel} />
      )}
    </div>
  );
}

export default GuestPage;