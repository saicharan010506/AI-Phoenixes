import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Download, Share2, Trash2, Volume2, RotateCcw, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Recording {
  id: string;
  name: string;
  duration: number;
  timestamp: Date;
  audioBlob: Blob;
  transcription?: string;
  story?: string;
  approved?: boolean;
}

interface RecordingBinProps {
  onBack: () => void;
}

const RecordingBin: React.FC<RecordingBinProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [deletedRecordings, setDeletedRecordings] = useState<Recording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'recordings' | 'deleted'>('recordings');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadRecordings();
    loadDeletedRecordings();
  }, [user?.id]);

  const loadRecordings = () => {
    const savedRecordings = localStorage.getItem(`kalahasta_recordings_${user?.id}`);
    if (savedRecordings) {
      const parsed = JSON.parse(savedRecordings);
      const recordingsWithBlobs = parsed.map((rec: any) => ({
        ...rec,
        timestamp: new Date(rec.timestamp),
        audioBlob: new Blob([new Uint8Array(rec.audioBlobData)], { type: 'audio/webm' })
      }));
      setRecordings(recordingsWithBlobs);
    }
  };

  const loadDeletedRecordings = () => {
    const deleteBin = localStorage.getItem(`kalahasta_delete_bin_${user?.id}`);
    if (deleteBin) {
      const parsed = JSON.parse(deleteBin);
      const recordingsWithBlobs = parsed.map((rec: any) => ({
        ...rec,
        timestamp: new Date(rec.timestamp),
        audioBlob: new Blob([new Uint8Array(rec.audioBlobData)], { type: 'audio/webm' })
      }));
      setDeletedRecordings(recordingsWithBlobs);
    }
  };

  const saveRecordings = (newRecordings: Recording[]) => {
    const recordingsForStorage = newRecordings.map(rec => ({
      ...rec,
      audioBlobData: Array.from(new Uint8Array(rec.audioBlob as any))
    }));
    localStorage.setItem(`kalahasta_recordings_${user?.id}`, JSON.stringify(recordingsForStorage));
  };

  const saveDeletedRecordings = (deletedRecs: Recording[]) => {
    const recordingsForStorage = deletedRecs.map(rec => ({
      ...rec,
      audioBlobData: Array.from(new Uint8Array(rec.audioBlob as any))
    }));
    localStorage.setItem(`kalahasta_delete_bin_${user?.id}`, JSON.stringify(recordingsForStorage));
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
      alert('Sharing feature not available on this device');
    }
  };

  const deleteRecording = (recordingId: string) => {
    const recordingToDelete = recordings.find(rec => rec.id === recordingId);
    if (recordingToDelete) {
      const updatedRecordings = recordings.filter(rec => rec.id !== recordingId);
      const updatedDeleted = [...deletedRecordings, recordingToDelete];
      
      setRecordings(updatedRecordings);
      setDeletedRecordings(updatedDeleted);
      saveRecordings(updatedRecordings);
      saveDeletedRecordings(updatedDeleted);
    }
  };

  const restoreRecording = (recordingId: string) => {
    const recordingToRestore = deletedRecordings.find(rec => rec.id === recordingId);
    if (recordingToRestore) {
      const updatedDeleted = deletedRecordings.filter(rec => rec.id !== recordingId);
      const updatedRecordings = [...recordings, recordingToRestore];
      
      setDeletedRecordings(updatedDeleted);
      setRecordings(updatedRecordings);
      saveDeletedRecordings(updatedDeleted);
      saveRecordings(updatedRecordings);
    }
  };

  const permanentlyDelete = (recordingId: string) => {
    const updatedDeleted = deletedRecordings.filter(rec => rec.id !== recordingId);
    setDeletedRecordings(updatedDeleted);
    saveDeletedRecordings(updatedDeleted);
  };

  const approveStory = (recordingId: string) => {
    const updatedRecordings = recordings.map(rec => 
      rec.id === recordingId ? { ...rec, approved: true } : rec
    );
    setRecordings(updatedRecordings);
    saveRecordings(updatedRecordings);
    setShowStoryModal(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Recording Bin</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-6">
          <div className="flex space-x-1 bg-gray-700/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('recordings')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'recordings'
                  ? 'bg-yellow-400 text-gray-900'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              My Recordings ({recordings.length})
            </button>
            <button
              onClick={() => setActiveTab('deleted')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'deleted'
                  ? 'bg-yellow-400 text-gray-900'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Delete Bin ({deletedRecordings.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'recordings' && (
            <div className="space-y-4">
              {recordings.length > 0 ? (
                recordings.map((recording) => (
                  <div key={recording.id} className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full flex items-center justify-center">
                          <Volume2 className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{recording.name}</h3>
                          <p className="text-gray-400 text-sm">
                            {formatTime(recording.duration)} • {formatDate(recording.timestamp)}
                          </p>
                          {recording.approved && (
                            <div className="flex items-center space-x-1 text-green-400 text-sm mt-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>Story Approved</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Transcription */}
                    {recording.transcription && (
                      <div className="bg-gray-600/30 rounded-lg p-4 mb-4">
                        <h4 className="text-white font-medium mb-2">Transcription:</h4>
                        <p className="text-gray-300 text-sm">{recording.transcription}</p>
                      </div>
                    )}

                    {/* Generated Story */}
                    {recording.story && (
                      <div className="bg-gradient-to-r from-yellow-400/10 to-purple-400/10 rounded-lg p-4 mb-4 border border-yellow-400/20">
                        <h4 className="text-white font-medium mb-2">AI-Generated Story:</h4>
                        <p className="text-gray-300 text-sm mb-3">{recording.story}</p>
                        {!recording.approved && (
                          <button
                            onClick={() => {
                              setSelectedRecording(recording);
                              setShowStoryModal(true);
                            }}
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                          >
                            Review & Approve
                          </button>
                        )}
                      </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => isPlaying && currentRecording?.id === recording.id ? pauseRecording() : playRecording(recording)}
                        className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        {isPlaying && currentRecording?.id === recording.id ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => downloadRecording(recording)}
                        className="p-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => shareRecording(recording)}
                        className="p-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                      >
                        <Share2 className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => deleteRecording(recording.id)}
                        className="p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Volume2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">No recordings yet. Start recording your story from the dashboard!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'deleted' && (
            <div className="space-y-4">
              {deletedRecordings.length > 0 ? (
                deletedRecordings.map((recording) => (
                  <div key={recording.id} className="bg-red-900/20 rounded-lg p-6 border border-red-500/30">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-500/50 rounded-full flex items-center justify-center">
                          <Volume2 className="w-6 h-6 text-red-300" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{recording.name}</h3>
                          <p className="text-gray-400 text-sm">
                            {formatTime(recording.duration)} • {formatDate(recording.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => isPlaying && currentRecording?.id === recording.id ? pauseRecording() : playRecording(recording)}
                        className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        {isPlaying && currentRecording?.id === recording.id ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => restoreRecording(recording.id)}
                        className="p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => permanentlyDelete(recording.id)}
                        className="p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">Delete bin is empty.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Story Review Modal */}
      {showStoryModal && selectedRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4">Review Your Story</h3>
            
            <div className="space-y-6">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Original Recording:</h4>
                <p className="text-gray-300 text-sm mb-3">{selectedRecording.transcription}</p>
                <button
                  onClick={() => playRecording(selectedRecording)}
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  <Play className="w-4 h-4" />
                  <span>Listen Again</span>
                </button>
              </div>

              <div className="bg-gradient-to-r from-yellow-400/10 to-purple-400/10 rounded-lg p-4 border border-yellow-400/20">
                <h4 className="text-white font-semibold mb-2">AI-Generated Story for Your Profile:</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{selectedRecording.story}</p>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <h4 className="text-blue-400 font-semibold mb-2">What happens when you approve:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• This story will become your public profile narrative</li>
                  <li>• It will be used for digital certificates</li>
                  <li>• Customers will see this when viewing your products</li>
                  <li>• You can always re-record and update later</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => approveStory(selectedRecording.id)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve & Go Live</span>
                </button>
                <button
                  onClick={() => setShowStoryModal(false)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Review Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingBin;