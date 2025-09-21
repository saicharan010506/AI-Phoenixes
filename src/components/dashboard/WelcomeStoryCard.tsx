import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Download, Share2, Trash2, Volume2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Recording {
  id: string;
  name: string;
  duration: number;
  timestamp: Date;
  audioBlob: Blob;
  transcription?: string;
  story?: string;
}

const WelcomeStoryCard: React.FC = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load recordings from localStorage
    const savedRecordings = localStorage.getItem(`kalahasta_recordings_${user?.id}`);
    if (savedRecordings) {
      const parsed = JSON.parse(savedRecordings);
      // Convert blob data back to Blob objects
      const recordingsWithBlobs = parsed.map((rec: any) => ({
        ...rec,
        timestamp: new Date(rec.timestamp),
        audioBlob: new Blob([new Uint8Array(rec.audioBlobData)], { type: 'audio/webm' })
      }));
      setRecordings(recordingsWithBlobs);
    }
  }, [user?.id]);

  const saveRecordings = (newRecordings: Recording[]) => {
    // Convert Blob to array buffer for storage
    const recordingsForStorage = newRecordings.map(rec => ({
      ...rec,
      audioBlobData: Array.from(new Uint8Array(rec.audioBlob as any))
    }));
    localStorage.setItem(`kalahasta_recordings_${user?.id}`, JSON.stringify(recordingsForStorage));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const newRecording: Recording = {
          id: Date.now().toString(),
          name: `Recording ${recordings.length + 1}`,
          duration: recordingTime,
          timestamp: new Date(),
          audioBlob,
          transcription: generateMockTranscription(),
          story: generateMockStory()
        };

        const updatedRecordings = [...recordings, newRecording];
        setRecordings(updatedRecordings);
        saveRecordings(updatedRecordings);
        setCurrentRecording(newRecording);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setShowRecordingModal(true);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const playRecording = (recording: Recording) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audioUrl = URL.createObjectURL(recording.audioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentRecording(null);
    };

    audio.play();
    setIsPlaying(true);
    setCurrentRecording(recording);
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const downloadRecording = (recording: Recording) => {
    const url = URL.createObjectURL(recording.audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareRecording = (recording: Recording) => {
    if (navigator.share) {
      const file = new File([recording.audioBlob], `${recording.name}.webm`, { type: 'audio/webm' });
      navigator.share({
        title: recording.name,
        files: [file]
      });
    } else {
      // Fallback: copy link or show share options
      alert('Sharing feature not available on this device');
    }
  };

  const deleteRecording = (recordingId: string) => {
    const updatedRecordings = recordings.filter(rec => rec.id !== recordingId);
    setRecordings(updatedRecordings);
    saveRecordings(updatedRecordings);
    
    // Add to delete bin
    const deletedRecording = recordings.find(rec => rec.id === recordingId);
    if (deletedRecording) {
      const deleteBin = JSON.parse(localStorage.getItem(`kalahasta_delete_bin_${user?.id}`) || '[]');
      deleteBin.push(deletedRecording);
      localStorage.setItem(`kalahasta_delete_bin_${user?.id}`, JSON.stringify(deleteBin));
    }
  };

  const generateMockTranscription = (): string => {
    return "I am a traditional Kalamkari artist from Andhra Pradesh. My family has been practicing this ancient art form for generations. We use natural dyes and hand-painted techniques to create beautiful textiles that tell stories of our culture and heritage.";
  };

  const generateMockStory = (): string => {
    return `Meet ${user?.fullName}, a master ${user?.primaryCraft} artist whose family has preserved this ancient craft for generations. With skilled hands and a deep connection to cultural traditions, ${user?.fullName} creates stunning pieces that bridge the gap between traditional artistry and contemporary appreciation. Each work tells a story of heritage, patience, and the timeless beauty of handcrafted art.`;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome, {user?.fullName}! 
        </h2>
        <p className="text-gray-300 text-lg">
          Your story is your power. Let's share it.
        </p>
      </div>

      <div className="space-y-6">
        {/* Record Button */}
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 disabled:opacity-50"
        >
          <Mic className="w-6 h-6" />
          <span className="text-lg">🎤 Record My Story</span>
        </button>

        {/* Recent Recordings */}
        {recordings.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Recordings</h3>
            <div className="space-y-3">
              {recordings.slice(-3).reverse().map((recording) => (
                <div key={recording.id} className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{recording.name}</p>
                      <p className="text-gray-400 text-sm">
                        {formatTime(recording.duration)} • {recording.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => isPlaying && currentRecording?.id === recording.id ? pauseRecording() : playRecording(recording)}
                      className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    >
                      {isPlaying && currentRecording?.id === recording.id ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => downloadRecording(recording)}
                      className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => shareRecording(recording)}
                      className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recording Modal */}
      {showRecordingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Mic className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Recording...</h3>
              <p className="text-gray-300 mb-6">Share your story in your native language</p>
              <div className="text-3xl font-mono text-yellow-400 mb-8">
                {formatTime(recordingTime)}
              </div>
              <button
                onClick={() => {
                  stopRecording();
                  setShowRecordingModal(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl flex items-center space-x-2 mx-auto transition-colors"
              >
                <Square className="w-5 h-5" />
                <span>Stop Recording</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeStoryCard;