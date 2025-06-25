export interface Note {
  id: string
  content: string
  categories: string[]
  timestamp: Date
  priority: "low" | "medium" | "high"
  attachments?: MediaAttachment[]
}

export interface Category {
  id: string
  name: string
  emoji: string
  color: string
}

export interface MediaAttachment {
  id: string
  type: "audio" | "image"
  uri: string
  filename: string
  size?: number
  duration?: number // for audio files
  width?: number // for images
  height?: number // for images
  thumbnail?: string // for images
}
