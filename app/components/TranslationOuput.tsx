export default function TranslationOutput({onTranslate, translatetion, originalText}) {
  return (
    <div className="flex justify-center px-4 py-6 ">
      <div className="w-[360px] min-h-[567px] border-2 border-gray-800 rounded-2xl p-4 flex flex-col gap-6">
        
        <div className="flex flex-col gap-4 ">
          <label className="text-center font-bold text-[#035A9D] text-[20px]">Text to translate 👇</label>
          <textarea
            name="query"
            value={originalText} 
            readOnly
            className="border border-gray-200 bg-gray-100 rounded-lg font-semibold px-4 py-4 w-full outline-none focus:border-[#32CD32] min-h-[150px] resize-none text-[20px]"
          />
        </div>

        <div className="flex flex-col gap-4 ">
          <label className="text-center font-bold text-[#035A9D] text-[20px]">Your translation 👇</label>
          <textarea
            name="query"
            value={translatetion}
            readOnly
            className="border border-gray-200 bg-gray-100 rounded-lg font-semibold px-4 py-4 w-full outline-none focus:border-[#32CD32] min-h-[150px] resize-none text-[20px]"
          />
        </div>

        <button 
                className="w-full bg-[#035A9D] text-white font-bold text-xl py-2 rounded-xl mt-8 hover:bg-blue-800 text-[24px]"
                onClick={onTranslate}
                >
          Start Over
        </button>

      </div>
    </div>
  )
}