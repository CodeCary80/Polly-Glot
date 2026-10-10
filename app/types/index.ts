export type Message = {
  role: "user" | "assistant"
  content: string
}

export type ApiKeyModalProps = {
  isOpen: boolean
  onSubmit: (key: string) => void
  onClose: () => void
}

export type ChatterBoxProps = {
  onBack: () => void
  userApiKey: string
  incrementUsage: () => void
  onInvalidKey: () => void
}