"use client"


import { useState } from "react";
import { ApiKeyModalProps } from "@/app/types"


export default function ApiKeyModal({isOpen, onSubmit, onClose}:ApiKeyModalProps){
    
    const [input, setInput] = useState("")

    const handleInput= (event:React.ChangeEvent<HTMLInputElement>)=>{
      setInput(event.target.value);
  }
    if (!isOpen) return null
    return(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full relative">
                <h2 className="text-white font-bold text-xl mb-4">You've used your 10 free translations</h2>
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold"
                    >
                        ✕
                    </button>
                    <input 
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 mb-4"
                    type="password"
                    onChange={handleInput}
                    />

                    <p className="text-gray-300 text-sm mb-3">Enter your Anthropic API key to continue. Your key is stored in your browser's localStorage and used to call Anthropic directly from your browser. It never touches our server.</p>

                    <a 
                    className="text-[#32CD32] text-sm block mb-4" 
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    Don't have a key? Create a free account →
                    </a>
                    <button 
                    className="w-full bg-[#32CD32] text-black font-bold py-2 rounded-lg disabled:opacity-50"
                    disabled={input.trim() === ""} 
                    onClick={() => onSubmit(input)}
                    >
                    Confirm
                    </button>
            </div>
        </div>
    
    )
    
}