import { Peer } from 'peerjs';

class PeerService {
  constructor() {
    this.peer = null;
    this.conn = null;
  }

  createRoom(onConnected, onDataReceived, onError) {
    const roomId = `CHAOS-${Math.floor(1000 + Math.random() * 9000)}`;
    this.peer = new Peer(roomId);

    this.peer.on('open', id => {
      onConnected({ roomId: id, role: 'blue' });
    });

    this.peer.on('connection', conn => {
      this.conn = conn;
      this.setupConnection(onDataReceived);
      onConnected({ roomId, role: 'blue', isGuestConnected: true });
    });

    this.peer.on('error', err => {
      if (onError) onError(err);
    });

    return roomId;
  }

  joinRoom(roomId, onConnected, onDataReceived, onError) {
    this.peer = new Peer();

    this.peer.on('open', () => {
      this.conn = this.peer.connect(roomId);
      this.setupConnection(onDataReceived);

      this.conn.on('open', () => {
        onConnected({ roomId, role: 'red', isGuestConnected: true });
      });
    });

    this.peer.on('error', err => {
      if (onError) onError(err);
    });
  }

  setupConnection(onDataReceived) {
    if (!this.conn) return;

    this.conn.on('data', data => {
      if (onDataReceived) onDataReceived(data);
    });

    this.conn.on('close', () => {
      console.log('Peer connection closed');
    });
  }

  sendData(data) {
    if (this.conn && this.conn.open) {
      this.conn.send(data);
    }
  }

  disconnect() {
    if (this.conn) this.conn.close();
    if (this.peer) this.peer.destroy();
    this.conn = null;
    this.peer = null;
  }
}

export const peerService = new PeerService();
