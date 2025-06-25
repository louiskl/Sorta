"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Audio } from "expo-av"
import { useTheme } from "../context/ThemeContext"
import type { MediaAttachment } from "../types"
import { formatFileSize, formatDuration } from "../lib/mediaUtils"

interface MediaAttachmentViewProps {
  attachment: MediaAttachment
  onRemove?: () => void
  showRemoveButton?: boolean
}

export default function MediaAttachmentView({
  attachment,
  onRemove,
  showRemoveButton = false,
}: MediaAttachmentViewProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const { theme } = useTheme()

  const playAudio = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync()
          setIsPlaying(false)
        } else {
          await sound.playAsync()
          setIsPlaying(true)
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: attachment.uri })
        setSound(newSound)

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false)
          }
        })

        await newSound.playAsync()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Error playing audio:", error)
      Alert.alert("Fehler", "Audio konnte nicht abgespielt werden.")
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      Alert.alert("Anhang entfernen", "Möchtest du diesen Anhang wirklich entfernen?", [
        { text: "Abbrechen", style: "cancel" },
        { text: "Entfernen", style: "destructive", onPress: onRemove },
      ])
    }
  }

  const styles = createStyles(theme)

  if (attachment.type === "audio") {
    return (
      <View style={[styles.container, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.audioContainer} onPress={playAudio}>
          <View style={[styles.audioIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="white" />
          </View>
          <View style={styles.audioInfo}>
            <Text style={[styles.audioTitle, { color: theme.text }]}>Sprachnotiz</Text>
            <Text style={[styles.audioDetails, { color: theme.textSecondary }]}>
              {attachment.duration ? formatDuration(attachment.duration) : "0:00"}
              {attachment.size && ` • ${formatFileSize(attachment.size)}`}
            </Text>
          </View>
        </TouchableOpacity>
        {showRemoveButton && (
          <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
            <Ionicons name="close-circle" size={24} color={theme.error} />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  if (attachment.type === "image") {
    return (
      <View style={[styles.container, { backgroundColor: theme.surface }]}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: attachment.uri }} style={styles.image} resizeMode="cover" />
          {showRemoveButton && (
            <TouchableOpacity style={styles.imageRemoveButton} onPress={handleRemove}>
              <Ionicons name="close-circle" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.imageInfo}>
          <Text style={[styles.imageTitle, { color: theme.text }]}>Bild</Text>
          <Text style={[styles.imageDetails, { color: theme.textSecondary }]}>
            {attachment.width && attachment.height && `${attachment.width}×${attachment.height}`}
            {attachment.size && ` • ${formatFileSize(attachment.size)}`}
          </Text>
        </View>
      </View>
    )
  }

  return null
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      borderRadius: 12,
      padding: 12,
      marginVertical: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    audioContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    audioIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    audioInfo: {
      flex: 1,
    },
    audioTitle: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 2,
    },
    audioDetails: {
      fontSize: 12,
    },
    imageContainer: {
      position: "relative",
      marginRight: 12,
    },
    image: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    imageRemoveButton: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 12,
    },
    imageInfo: {
      flex: 1,
    },
    imageTitle: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 2,
    },
    imageDetails: {
      fontSize: 12,
    },
    removeButton: {
      padding: 4,
    },
  })
