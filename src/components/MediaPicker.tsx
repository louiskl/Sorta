"use client"

import { Alert } from "react-native"
import * as ImagePicker from "expo-image-picker"
import * as Camera from "expo-camera"
import type { MediaAttachment } from "../types"
import { saveMediaFile } from "../lib/mediaUtils"

export const useMediaPicker = () => {
  const pickImageFromGallery = async (): Promise<MediaAttachment | null> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Berechtigung erforderlich", "Bitte erlaube den Zugriff auf die Fotobibliothek.")
        return null
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]
        const attachment = await saveMediaFile(asset.uri, "image")
        attachment.width = asset.width
        attachment.height = asset.height
        return attachment
      }

      return null
    } catch (error) {
      console.error("Error picking image from gallery:", error)
      Alert.alert("Fehler", "Bild konnte nicht ausgewählt werden.")
      return null
    }
  }

  const takePhoto = async (): Promise<MediaAttachment | null> => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Berechtigung erforderlich", "Bitte erlaube den Zugriff auf die Kamera.")
        return null
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]
        const attachment = await saveMediaFile(asset.uri, "image")
        attachment.width = asset.width
        attachment.height = asset.height
        return attachment
      }

      return null
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Fehler", "Foto konnte nicht aufgenommen werden.")
      return null
    }
  }

  return {
    pickImageFromGallery,
    takePhoto,
  }
}
