"use client"
import { useState } from 'react'
import Logo from "@/public/parrot.png"
import HeroBanner from "@/public/worldmap.png"
import OriginalSelections from "@/app/components/OriginalSelections"
import TranslationOutput from "@/app/components/TranslationOuput"
import ChatterBox from "@/app/components/ChatterBox"
import ApiKeyModal from './components/ApiKeyModal'
import Image from "next/image"
import { MODEL, TRANSLATOR_PROMPT } from "@/app/lib/prompts"



export default function Home() {
  const [view, setView] = useState("input")
  const [translation, setTranslation] = useState('')
  const [originalText, setOriginalText] = useState('')
  const [usageCount,setUsageCount] = useState(()=>{
    if(typeof window === "undefined")return 0
    return parseInt(localStorage.getItem("usageCount") || "0")
  })

  const [userApiKey, setUserApiKey] = useState(()=>{
    if(typeof window === "undefined") return ""
    return localStorage.getItem("userApiKey") || ""
  })
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onTranslate(text: string, language: string) {
          const key = userApiKey || localStorage.getItem("userApiKey") || ""
          const count = parseInt(localStorage.getItem("usageCount") || "0")
          if(count >= 10 && !key){
            setShowModal(true)
            return
          }
          setError(null)
          try{
          if (key) {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "x-api-key": key,
                          "anthropic-version": "2023-06-01",
                          "anthropic-dangerous-direct-browser-access": "true"
                        },
          body:JSON.stringify({
          model: MODEL,
                max_tokens: 1024,
                temperature: 1,
                system: TRANSLATOR_PROMPT,
                messages: [{ role: "user", content: `translate ${text} to ${language}`  }],
          })
        })
              const data = await res.json()
              if (data.error) {
                setShowModal(true)
                return           
              }
              setTranslation(data.content[0].text)
              setOriginalText(text) 
                } else {
                  const res = await fetch("/api/translate",{
                      method:"POST",
                      headers:{"Content-Type":"application/json"},
                      body:JSON.stringify({text,language})
                    })
                    const data = await res.json()
                    if (data.error) {
                      setShowModal(true)
                      return
                    }
                    setTranslation(data.translation)
                    setOriginalText(text)
                }
                setView("result")
                incrementUsage()
          }catch(err){console.error("Translation error:", err)
                      setError("Network error. Please check your connection.")
                      }
              }

  function incrementUsage(){
  const newCount = usageCount + 1
  setUsageCount(newCount)
  localStorage.setItem("usageCount", String(newCount))
  if(newCount >= 10 && !userApiKey && !localStorage.getItem("userApiKey")) setShowModal(true)
}

  function handleApiKeySubmit(Key:string){
        setUserApiKey(Key)
        localStorage.setItem("userApiKey",Key )
        setShowModal(false)
  }


  return (
    <main className="flex justify-center py-6">
  
  <div className="w-[390px] h-[900px] border-1 border-[#BCBCBC] rounded-b-2xl overflow-hidden flex flex-col">
    
    <section className="relative w-full h-[213px] flex-shrink-0">
      <Image 
        src={HeroBanner}  
        alt="Hero banner" 
        className="absolute w-[400px] h-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute left-14 bottom-18">
        <Image src={Logo} className="w-[95px] h-auto" alt="LOGO" />
      </div>
      <div className="absolute bottom-18 left-48">
        <h1 className="font-display text-[43px] text-[#32CD32]">PollyGlot</h1>
        <p className="text-[12px] text-[#fff]">Perfect Translation Every Time</p>
      </div>
    </section>

    {error && <p role="alert" className="text-red-500 text-sm text-center mt-2">⚠️ {error}</p>}

    {view === "input"
      ? <OriginalSelections onTranslate={onTranslate} onChat={() => setView("chat")} />
      : view === "result"
      ? <TranslationOutput onTranslate={() => setView("input")} translatetion={translation} originalText={originalText} />
      : <ChatterBox onBack={() => setView("input")} incrementUsage={incrementUsage} userApiKey={userApiKey} onInvalidKey={() => setShowModal(true)}/>
    }

    <ApiKeyModal isOpen={showModal} onSubmit={handleApiKeySubmit} onClose={() => setShowModal(false)}/>

  </div>

</main>
  )
}


