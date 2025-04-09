import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinRoom } from '../services/api';

function JoinRoom() {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roomCode) {
      setError('Please enter a room code');
      return;
    }

    try {
      setJoining(true);
      setError('');
      
      const response = await joinRoom(roomCode);
      
      if (response.success) {
        navigate(`/room/${roomCode}`);
      } else {
        setError(response.message || 'Failed to join room');
      }
    } catch (error) {
      setError('Error joining room. Room may not exist or is no longer available.');
      console.error('Error joining room:', error);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Join a Multiplayer Room</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="roomCode">
            Enter Room Code
          </label>
          <input
            type="text"
            id="roomCode"
            className="w-full p-2 border rounded text-center tracking-wider uppercase font-bold"
            placeholder="ABCD12"
            maxLength="6"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Enter the 6-digit code provided by the room host
          </p>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={joining}
          >
            {joining ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      </form>
      
      <div className="mt-8 border-t pt-6">
        <h2 className="text-lg font-semibold mb-3">Want to create your own room?</h2>
        <button
          onClick={() => navigate('/create-room')}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create a Room
        </button>
      </div>
    </div>
  );
}

export default JoinRoom; 