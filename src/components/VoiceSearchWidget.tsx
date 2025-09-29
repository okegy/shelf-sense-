import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { voiceService, VoiceSearchResult } from '../services/voiceService';
import { useToast } from './ui/ToastProvider';

interface VoiceSearchWidgetProps {
  onSearchResult?: (result: VoiceSearchResult) => void;
  onCommand?: (command: string) => void;
  className?: string;
}

export default function VoiceSearchWidget({ 
  onSearchResult, 
  onCommand, 
  className = '' 
}: VoiceSearchWidgetProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Set up voice service callbacks
    voiceService.onSearchResult((result) => {
      setIsListening(false);
      setIsProcessing(false);
      if (onSearchResult) {
        onSearchResult(result);
      }
      addToast(`Voice search: Found ${result.results.length} results`, 'success');
    });

    voiceService.onCommand((command) => {
      setIsListening(false);
      setIsProcessing(false);
      if (onCommand) {
        onCommand(command);
      }
      addToast(`Voice command executed: ${command}`, 'info');
    });

    voiceService.onError((error) => {
      setIsListening(false);
      setIsProcessing(false);
      addToast(`Voice error: ${error}`, 'error');
    });

    voiceService.onStatus((newStatus) => {
      setStatus(newStatus);
      setIsListening(newStatus === 'listening');
      setIsProcessing(newStatus === 'processing');
    });

    return () => {
      voiceService.stopListening();
    };
  }, [onSearchResult, onCommand, addToast]);

  const handleVoiceToggle = async () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      setIsProcessing(false);
    } else {
      const started = await voiceService.startListening();
      if (started) {
        setIsListening(true);
        addToast('Voice activated. Say a command or search query.', 'info');
      } else {
        addToast('Voice recognition not available', 'error');
      }
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      // Mute speech synthesis
      window.speechSynthesis.cancel();
      addToast('Voice feedback muted', 'info');
    } else {
      addToast('Voice feedback enabled', 'info');
    }
  };

  const handleShowHelp = () => {
    setShowCommands(!showCommands);
    if (!showCommands && !isMuted) {
      voiceService.speakHelp();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'text-green-400 bg-green-500/20';
      case 'processing':
        return 'text-blue-400 bg-blue-500/20';
      case 'error':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };

  const availableCommands = voiceService.getAvailableCommands();

  return (
    <div className={`relative ${className}`}>
      {/* Main Voice Control */}
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-3">
        {/* Voice Toggle Button */}
        <button
          onClick={handleVoiceToggle}
          disabled={isProcessing}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isListening 
              ? 'bg-red-500/20 text-red-400 animate-pulse' 
              : isProcessing
              ? 'bg-blue-500/20 text-blue-400 animate-spin'
              : 'hover:bg-white/10 text-white'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice commands'}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Status Indicator */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>

        {/* Mute Toggle */}
        <button
          onClick={handleMuteToggle}
          className={`p-2 rounded-lg transition-colors ${
            isMuted 
              ? 'text-red-400 bg-red-500/20' 
              : 'text-white hover:bg-white/10'
          }`}
          title={isMuted ? 'Enable voice feedback' : 'Mute voice feedback'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Help Button */}
        <button
          onClick={handleShowHelp}
          className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          title="Show voice commands"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Commands Panel */}
      {showCommands && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-lg border border-gray-200 rounded-xl p-4 shadow-lg z-50 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-3">Available Voice Commands</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableCommands.map((cmd, index) => (
              <div key={index} className="flex flex-col p-2 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-800 text-sm">"{cmd.command}"</span>
                <span className="text-xs text-gray-600">{cmd.description}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> You can also search by saying "search for [product name]" or "find [item]"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
