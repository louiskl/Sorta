"use client"

import { useState } from "react"
import { View, TouchableOpacity, StyleSheet, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useTheme } from "../context/ThemeContext"
import MediaRecorder from "./MediaRecorder"
import { useMediaPicker } from "./MediaPicker"
import type { MediaAttachment } from "../types"

interface MediaInputBarProps {
  onMediaAttached: (attachment: MediaAttachment) => void
}

export default function MediaInputBar({ onMediaAttached }: MediaInputBarProps) {
  const [showRecorder, setShowRecorder] = useState(false)
  const { theme } = useTheme()
  const { pickImageFromGallery, takePhoto } = useMediaPicker()

  const handleVoiceRecord = () => {
    setShowRecorder(true)
    Haptics.selectionAsync()
  }

  const handleTakePhoto = async () => {
    Haptics.selectionAsync()
    const attachment = await takePhoto()
    if (attachment) {
      onMediaAttached(attachment)
    }
  }

  const handlePickImage = async () => {
    Haptics.selectionAsync()
    const attachment = await pickImageFromGallery()
    if (attachment) {
      onMediaAttached(attachment)
    }
  }

  const handleRecordingComplete = (attachment: MediaAttachment) => {
    setShowRecorder(false)
    onMediaAttached(attachment)
  }

  const styles = createStyles(theme)

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={[styles.mediaButton, { backgroundColor: theme.primary }]} onPress={handleVoiceRecord}>
          <Ionicons name="mic" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.mediaButton, { backgroundColor: theme.success }]} onPress={handleTakePhoto}>
          <Ionicons name="camera" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.mediaButton, { backgroundColor: theme.accent }]} onPress={handlePickImage}>
          <Ionicons name="image" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <Modal visible={showRecorder} animationType="slide" presentationStyle="pageSheet">
        <MediaRecorder onRecordingComplete={handleRecordingComplete} onClose={() => setShowRecorder(false)} />
      </Modal>
    </>
  )
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.surface,
    },
    mediaButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  })
