"use client"

import { useState, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Audio } from "expo-av"
import * as Haptics from "expo-haptics"
import { useTheme } from "../context/ThemeContext"
import type { MediaAttachment } from "../types"
import { saveMediaFile } from "../lib/mediaUtils"

interface MediaRecorderProps {
  onRecordingComplete: (attachment: MediaAttachment) => void
  onClose: () => void
}

export default function MediaRecorder({ onRecordingComplete, onClose }: MediaRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const { theme } = useTheme()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Berechtigung erforderlich", "Bitte erlaube den Zugriff auf das Mikrofon.")
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      setRecording(recording)
      setIsRecording(true)
      setRecordingDuration(0)

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      console.error("Failed to start recording:", error)
      Alert.alert("Fehler", "Aufnahme konnte nicht gestartet werden.")
    }
  }

  const stopRecording = async () => {
    if (!recording) return

    try {
      setIsRecording(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()

      if (uri) {
        const attachment = await saveMediaFile(uri, "audio")
        attachment.duration = recordingDuration
        onRecordingComplete(attachment)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }

      setRecording(null)
      setRecordingDuration(0)
    } catch (error) {
      console.error("Failed to stop recording:", error)
      Alert.alert("Fehler", "Aufnahme konnte nicht gespeichert werden.")
    }
  }

  const cancelRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync()
        setRecording(null)
        setIsRecording(false)
        setRecordingDuration(0)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      } catch (error) {
        console.error("Failed to cancel recording:", error)
      }
    }
    onClose()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const styles = createStyles(theme)

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={cancelRecording}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Sprachnotiz</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.recordingIndicator, isRecording && styles.recordingActive]}>
          <Ionicons name="mic" size={48} color={isRecording ? "#EF4444" : theme.textSecondary} />
        </View>

        <Text style={[styles.duration, { color: theme.text }]}>{formatTime(recordingDuration)}</Text>

        <Text style={[styles.instruction, { color: theme.textSecondary }]}>
          {isRecording ? "Aufnahme läuft..." : "Tippe zum Aufnehmen"}
        </Text>
      </View>

      <View style={styles.controls}>
        {!isRecording ? (
          <TouchableOpacity style={[styles.recordButton, { backgroundColor: theme.error }]} onPress={startRecording}>
            <Ionicons name="radio-button-on" size={32} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.stopButton, { backgroundColor: theme.textSecondary }]}
            onPress={stopRecording}
          >
            <Ionicons name="stop" size={32} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      borderRadius: 16,
      padding: 24,
      margin: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
    },
    content: {
      alignItems: "center",
      marginBottom: 32,
    },
    recordingIndicator: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    recordingActive: {
      backgroundColor: "#FEE2E2",
    },
    duration: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 8,
    },
    instruction: {
      fontSize: 14,
      textAlign: "center",
    },
    controls: {
      alignItems: "center",
    },
    recordButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    stopButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
    },
  })
