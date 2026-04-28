"use client"

import { languages } from "@/app/lib/translatetion"
import { useState, useRef, useEffect } from 'react'
import { Message } from "@/app/types"

export default function ChatterBox({onBack}) {
  const [language, setLanguage] = useState(languages[0].id)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! Select a language and start chatting with me!" }
  ])
  const bottomRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend(){
            if(input.trim()==="") return
            setMessages(prev=>[...prev,{ role: "user", content: input }])
            setIsLoading(true)
            setError(null)

            try{
            const res = await fetch("/api/chatterbox",{
                        method:"POST",
                        headers:{"Content-Type":"application/json"},
                        body:JSON.stringify({ messages: [...messages, { role: "user", content: input }], language })
                    })
            const data = await res.json()

            if(data.error){setError("Sorry, something went wrong. Please try again.")}else{
            setMessages(prev=>[...prev,{ role: "assistant", content: data.reply }])
            }
          }catch(err){setError("Network error. Please check your connection.")}
          finally{
            setInput('')
            setIsLoading(false)
          }           
  }

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages])

  return (
    <div className="flex flex-col h-[767px] px-4 py-4">
     <div className="w-[360px] h-[647px] border-2 border-gray-800 rounded-2xl p-4 flex flex-col gap-2">
      {/* 1. chat bubbles area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`px-4 py-3 rounded-2xl max-w-[80%] font-semibold text-[18px] ${
            msg.role === "user"
              ? "bg-[#32CD32] self-end text-black"
              : "bg-[#035A9D] self-start text-white"
          }`}>
            {msg.content}
            <div ref={bottomRef}></div>
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* 2. input + send button */}
      <div className="flex gap-2 mb-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-200 bg-gray-100 rounded-lg px-4 py-2 outline-none resize-none text-[18px]"
          rows={2}
        />
        <button 
            className="bg-[#035A9D] text-white px-4 rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50"
            onClick={handleSend}
            disabled={isLoading || input.trim() === ""}
            >
          {isLoading? "..." : "Send"}
        </button>
      </div>

      {/* 3. language selector */}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="border border-gray-200 bg-gray-100 rounded-lg px-4 py-2 text-[18px]"
      >
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>{lang.label}</option>
        ))}
      </select>

       <button 
                className="w-full bg-[#035A9D] text-white font-bold text-xl py-2 rounded-xl mt-8 hover:bg-blue-800 text-[24px]"
                onClick={onBack}
                >
          Back to home page
        </button>
      </div>
    </div>
  )
}