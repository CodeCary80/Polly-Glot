"use client"

import { languages } from "@/app/lib/translatetion"
import { useState } from 'react';

export default function OriginalSelections({onTranslate,onChat }) {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('')

  const handleTextChange= (event)=>{
      setText(event.target.value);
  }

  const handleLanguagesChange= (event)=>{
      setLanguage(event.target.value);
  }


  return (
    <div className="flex justify-center  px-4 py-6 ">
      <div className="w-[360px] min-h-[547px] border-2 border-gray-800 rounded-2xl p-4 flex flex-col gap-6">
        
        <div className="flex flex-col mt-4 gap-4 ">
          <label className="text-center font-bold text-[#035A9D] text-[20px]">Text to translate 👇</label>
          <textarea
            name="query"
            placeholder="How are you?"
            onChange={handleTextChange}
            className="border border-gray-200 bg-gray-100 rounded-lg font-semibold px-4 py-4 w-full outline-none focus:border-[#32CD32] min-h-[150px] resize-none text-[20px]"
          />
        </div>

        <div className="flex flex-col mt-4 gap-5" >
          <label className="text-center font-bold text-[#035A9D] text-[20px]">Select language 👇</label>
          <select onChange={handleLanguagesChange}>
           {languages.map((lang)=>(
                    <option key={lang.id} id={lang.id} value={lang.id} className="flex items-center gap-3 pl-4 text-[20px]">{lang.label}</option>
           ))}
           </select>
        </div>
        
          <button 
                className="w-full bg-[#035A9D] text-white font-bold text-xl py-2 rounded-xl mt-10 mb-0 hover:bg-blue-800 text-[24px]"
                onClick={onChat}
                >
            Chat with Polly
          </button>

        <button 
              className="w-full bg-[#035A9D] text-white font-bold text-xl py-2 rounded-xl mt-auto hover:bg-blue-800 text-[24px]"
              onClick={()=>onTranslate(text,language)} >
          Translate
        </button>

      </div>
    </div>
  )
}