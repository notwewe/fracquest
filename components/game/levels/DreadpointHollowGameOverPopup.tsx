import React from "react"
import { Button } from "@/components/ui/button"

interface DreadpointHollowGameOverPopupProps {
  open: boolean
  dialogue: string
  onRetry: () => void
  onQuit: () => void
}

const DreadpointHollowGameOverPopup: React.FC<DreadpointHollowGameOverPopupProps> = ({ open, dialogue, onRetry, onQuit }) => {
  if (!open) return null
  return (
    <>
      <style jsx global>{`
        @keyframes eerie-fade {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        @keyframes popup-fade-in {
          0% { opacity: 0; transform: scale(0.92); }
          80% { opacity: 0.95; transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }
        .popup-fade-in {
          animation: popup-fade-in 1.5s cubic-bezier(0.32,0,0.67,0) both;
        }
        .no-hover-red:hover, .no-hover-red:focus {
          background-color: #b91c1c !important;
        }
        .no-hover-gray:hover, .no-hover-gray:focus {
          background-color: #1f2937 !important;
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
        <div className="bg-gray-900 border-4 border-red-900 rounded-xl shadow-2xl p-12 flex flex-col items-center max-w-lg w-full popup-fade-in" style={{ animation: "eerie-fade 3.5s infinite, popup-fade-in 1.5s cubic-bezier(0.32,0,0.67,0) both" }}>
          <h2 className="text-4xl font-pixel text-red-700 mb-6">Game Over</h2>
          <div className="text-lg font-pixel text-red-300 mb-8 text-center">{dialogue}</div>
          <div className="flex gap-6 mt-4">
            <Button
              onClick={onRetry}
              className="font-pixel bg-red-700 text-white text-xl px-10 py-4 mt-0 focus:outline-none border-none shadow-lg no-hover-red"
              style={{ boxShadow: "none" }}
            >
              Retry
            </Button>
            <Button
              onClick={onQuit}
              className="font-pixel bg-gray-800 text-white text-xl px-10 py-4 mt-0 focus:outline-none border-none shadow-lg no-hover-gray"
              style={{ boxShadow: "none" }}
            >
              Quit
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default DreadpointHollowGameOverPopup 