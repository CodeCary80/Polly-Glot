export type Message = {
  role: "user" | "assistant"
  content: string
}

type Props = {
  onTranslate: (text: string, language: string) => void
  onChat: () => void
}

export type ApiKeyModalProps = {
  isOpen: boolean
  onSubmit: (key: string) => void
}

export type ChatterBoxProps = {
  onBack: () => void
  userApiKey: string
  incrementUsage: () => void
  onInvalidKey: () => void
}