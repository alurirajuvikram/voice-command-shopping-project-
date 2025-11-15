import { MessageSquare } from 'lucide-react';

interface TranscriptDisplayProps {
  transcript: string;
  isFinal: boolean;
}

export function TranscriptDisplay({ transcript, isFinal }: TranscriptDisplayProps) {
  if (!transcript) return null;

  return (
    <div className={`
      bg-white rounded-lg shadow-md border-2 p-4 transition-all duration-300
      ${isFinal ? 'border-green-400' : 'border-blue-400'}
    `}>
      <div className="flex items-start gap-3">
        <MessageSquare className={`w-5 h-5 mt-0.5 ${isFinal ? 'text-green-600' : 'text-blue-600'}`} />
        <div className="flex-1">
          <div className="text-xs font-medium text-gray-500 mb-1">
            {isFinal ? 'Command Received' : 'Listening...'}
          </div>
          <p className={`text-base ${isFinal ? 'text-gray-900 font-medium' : 'text-gray-600 italic'}`}>
            {transcript}
          </p>
        </div>
      </div>
    </div>
  );
}
