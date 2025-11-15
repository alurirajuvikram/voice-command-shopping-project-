import { Mic, MicOff } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function VoiceButton({ isListening, onToggle, disabled }: VoiceButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        relative w-20 h-20 rounded-full flex items-center justify-center
        transition-all duration-300 shadow-lg
        ${isListening
          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
          : 'bg-blue-500 hover:bg-blue-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isListening ? (
        <MicOff className="w-8 h-8 text-white" />
      ) : (
        <Mic className="w-8 h-8 text-white" />
      )}

      {isListening && (
        <span className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ping" />
      )}
    </button>
  );
}
