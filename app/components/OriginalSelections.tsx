"use client"

import { languages } from "@/app/lib/translatetion"
import { useState } from 'react';

type Props = {
  onTranslate: (text: string, language: string) => void
  onChat: () => void
}

export default function OriginalSelections({onTranslate,onChat }:Props) {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleTextChange= (event:React.ChangeEvent<HTMLTextAreaElement>)=>{
      setText(event.target.value);
  }

  const handleLanguagesChange= (event:React.ChangeEvent<HTMLSelectElement>)=>{
      setLanguage(event.target.value);
  }

  function handleTranslate(){
        if(text.trim()==="" || language.trim()==="")
        {setError("Please enter text and select a language.")
          return
        }
        setError(null)
        onTranslate(text,language)   
  }

  return (
    <div className="flex justify-center  px-4 py-6 ">
      <div className="w-[360px] min-h-[647px] border-2 border-gray-800 rounded-2xl p-4 flex flex-col gap-6">
        
        <div className="flex flex-col mt-4 gap-4 ">
          <label className="text-center font-bold text-[#035A9D] text-[20px]">Text to translate 👇</label>
          <textarea
            name="query"
            placeholder="How are you?"
            onChange={handleTextChange}
            className="border border-gray-200 bg-gray-100 rounded-lg font-semibold px-4 py-4 w-full outline-none focus:border-[#32CD32] min-h-[180px] resize-none text-[20px]"
          />
        </div>

        <div className="flex flex-col mt-4 gap-5" >
          <label className="text-center font-bold text-[#035A9D] text-[20px] ">Select language 👇</label>
          <select onChange={handleLanguagesChange} className="w-full border-2 border-gray-800 rounded-xl px-4 py-2 text-[16px] bg-gray-100 font-semibold text-gray-800 outline-none focus:border-[#32CD32]">
           {languages.map((lang)=>(
                    <option key={lang.id} id={lang.id} value={lang.id} className="flex items-center gap-3 pl-4 text-[20px] ">{lang.label}</option>
           ))}
           </select>
        </div>

        {error && <p className="text-red-500 text-sm text-center">⚠️ {error}</p>}
        
          <button 
              className="w-full bg-[#32CD32] text-black font-bold py-2 rounded-xl mt-auto -mb-20 hover:bg-green-400 text-[20px]"
              onClick={onChat}
            >
              Chat with Polly
          </button>


        <button 
              className="w-full bg-[#035A9D] text-white font-bold text-xl py-2 rounded-xl mt-auto hover:bg-blue-800 text-[20px]"
              onClick={()=>handleTranslate()} >
          Translate
        </button>

      </div>
    </div>
  )
}