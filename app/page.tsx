"use client"
import { useState } from 'react'
import Logo from "@/public/parrot.png"
import HeroBanner from "@/public/worldmap.png"
import OriginalSelections from "@/app/components/OriginalSelections"
import TranslationOutput from "@/app/components/TranslationOuput"
import ChatterBox from "@/app/components/ChatterBox"


export default function Home() {
  const [view, setView] = useState("input")
  const [translation, setTranslation] = useState('')
  const [originalText, setOriginalText] = useState('')


  async function onTranslate(text,language){
      const res = await fetch("/api/translate",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({text,language})
      })
      const data = await res.json()
      setTranslation(data.translation)
      setOriginalText(text)
      setView("result")
  }

  return (
    <main className="flex justify-center py-6">
  
  <div className="w-[390px] h-[900px] border-1 border-[#BCBCBC] rounded-b-2xl overflow-hidden flex flex-col">
    
    <section className="relative w-full h-[213px] flex-shrink-0">
      <img 
        src={HeroBanner.src}  
        alt="Hero banner" 
        className="absolute w-[400px] h-full object-cover"
      />
      <div className="absolute left-14 bottom-18">
        <img src={Logo.src} className="w-[95px] h-auto" alt="LOGO" />
      </div>
      <div className="absolute bottom-18 left-48">
        <h1 className="text-[43px] text-[#32CD32]" style={{ fontFamily: "Big Shoulders Display, sans-serif" }}>PollyGlot</h1>
        <p className="text-[12px] text-[#fff]">Perfect Translation Every Time</p>
      </div>
    </section>

    {view === "input"
      ? <OriginalSelections onTranslate={onTranslate} onChat={() => setView("chat")} />
      : view === "result"
      ? <TranslationOutput onTranslate={() => setView("input")} translatetion={translation} originalText={originalText} />
      : <ChatterBox onBack={() => setView("input")} />
    }

  </div>

</main>
  )
}


