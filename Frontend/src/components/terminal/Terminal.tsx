import React from 'react';
import ReactDOM from 'react-dom';


import { X, Minimize2 } from 'lucide-react';

interface TerminalProps {
  logs: string[];
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, isOpen, onClose, onMinimize }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal (
    <div className="fixed inset-0  bg-black/50  backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Terminal Header */}
        <div className="bg-gray-800 rounded-t-lg px-4 py-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="w-3 h-3 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={8} className="text-red-900" />
              </button>
              <button
                onClick={onMinimize}
                className="w-3 h-3 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Minimize2 size={6} className="text-yellow-900" />
              </button>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-300 text-sm font-medium ml-3">Terminal - Live Logs</span>
          </div>
          <div className="text-gray-400 text-xs">
            {logs.length} entries
          </div>
        </div>

        {/* Terminal Body */}
        <div className="bg-black text-green-400 font-mono text-sm p-4 flex-1 overflow-auto min-h-64 max-h-96">
          <div className="mb-2">
            <span className="text-green-300">iitm-root@scanner:~$</span> <span className="text-white">Starting domain scan...</span>
          </div>
          {logs.length === 0 ? (
            <div className="text-gray-500 italic animate-pulse">
              <span className="text-green-300">iitm-root@scanner:~$</span> Waiting for logs...
            </div>
          ) : (
            logs.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap leading-relaxed">
                <span className="text-green-300">iitm-root@scanner:~$</span> <span className="text-green-400">{line}</span>
              </div>
            ))
          )}
          {logs.length > 0 && (
            <div className="text-green-300 animate-pulse">
              iitm-root@scanner:~$ <span className="bg-green-400 w-2 h-4 inline-block"></span>
            </div>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="bg-gray-800 rounded-b-lg px-4 py-2 text-xs text-gray-400 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span>Live streaming logs via SSE</span>
            <span>Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>,  document.body
  );
};