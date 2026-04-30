"use client"
import { useState, useEffect  } from 'react'
import Logo from "@/public/parrot.png"
import HeroBanner from "@/public/worldmap.png"
import OriginalSelections from "@/app/components/OriginalSelections"
import TranslationOutput from "@/app/components/TranslationOuput"
import ChatterBox from "@/app/components/ChatterBox"
import ApiKeyModal from './components/ApiKeyModal'


export default function Home() {
  const [view, setView] = useState("input")
  const [translation, setTranslation] = useState('')
  const [originalText, setOriginalText] = useState('')
  const [usageCount,setUsageCount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [userApiKey, setUserApiKey] = useState("")


  async function onTranslate(text: string, language: string) {
          const key = userApiKey || localStorage.getItem("userApiKey") || ""
          const count = parseInt(localStorage.getItem("usageCount") || "0")
          if(count >= 10 && !key){
            setShowModal(true)
            return
          }
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
          model: "claude-haiku-4-5-20251001",
                max_tokens: 1024,
                temperature: 1,
                system: `
                          You are a professional translator. Your task is to translate all input content into the language specified by the user. 

                          Follow these strict rules:
                          1. Accuracy: Maintain the original meaning, tone, and technical terminology.
                          2. Formatting: Preserve all original Markdown formatting (headings, lists, bold text, etc.) in the translated output.
                          3. No Conversational Filler: Do not respond with "Here is your translation" or "Sure, I can help." Output only the translated text.
                          4. Context Preservation: If the input contains code snippets or variables, do not translate the code—only the comments or strings if applicable.
                      `,
                messages: [{ role: "user", content: `trasnlate ${text} to ${language}`  }],
          })
        })
              const data = await res.json()
              console.log(data)
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
                    console.log(data)
                    if (data.error) {
                      setShowModal(true)
                      return
                    }
                    setTranslation(data.translation)
                    setOriginalText(text)
                }
                setView("result")
                incrementUsage()
          }catch(err){console.error("Translation error:", err)}
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

  useEffect(()=>{
      const count =localStorage.getItem("usageCount")
      const key = localStorage.getItem("userApiKey")
      console.log("count:", count, "key:", key) //
      if(count) setUsageCount(parseInt(count))
      if(key) setUserApiKey(key)
      if (parseInt(count || "0") >= 10 && !key) setShowModal(true)
  },[])

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
      : <ChatterBox onBack={() => setView("input")} incrementUsage={incrementUsage} userApiKey={userApiKey} onInvalidKey={() => setShowModal(true)}/>
    }

    <ApiKeyModal isOpen={showModal} onSubmit={handleApiKeySubmit} onClose={() => setShowModal(false)}/>

  </div>

</main>
  )
}


