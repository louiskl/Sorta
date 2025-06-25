import * as FileSystem from "expo-file-system"
import type { MediaAttachment } from "../types"

const MEDIA_DIRECTORY = FileSystem.documentDirectory + "media/"

export const initializeMediaDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(MEDIA_DIRECTORY)
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MEDIA_DIRECTORY, { intermediates: true })
  }
}

export const saveMediaFile = async (sourceUri: string, type: "audio" | "image"): Promise<MediaAttachment> => {
  await initializeMediaDirectory()

  const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${type === "audio" ? "m4a" : "jpg"}`
  const destinationUri = MEDIA_DIRECTORY + filename

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destinationUri,
  })

  const fileInfo = await FileSystem.getInfoAsync(destinationUri)

  const attachment: MediaAttachment = {
    id: Date.now().toString(),
    type,
    uri: destinationUri,
    filename,
    size: fileInfo.size,
  }

  // Get additional info for images
  if (type === "image") {
    try {
      const imageInfo = await FileSystem.getInfoAsync(destinationUri)
      // You might want to use expo-image-manipulator to get dimensions
      attachment.width = 300 // placeholder
      attachment.height = 300 // placeholder
    } catch (error) {
      console.error("Error getting image info:", error)
    }
  }

  return attachment
}

export const deleteMediaFile = async (uri: string) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri)
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri)
    }
  } catch (error) {
    console.error("Error deleting media file:", error)
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
