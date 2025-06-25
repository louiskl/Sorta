"use client"

import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import MediaAttachmentView from "./MediaAttachmentView"
import type { Note, Category } from "../types"

interface NoteCardProps {
  note: Note
  categories: Category[]
  onDelete: () => void
  formatDate: (date: Date) => string
}

export default function NoteCard({ note, categories, onDelete, formatDate }: NoteCardProps) {
  const { theme } = useTheme()

  const styles = createStyles(theme)

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <View style={styles.categoriesContainer}>
          {note.categories.map((categoryId) => {
            const category = categories.find((c) => c.id === categoryId)
            if (!category) return null
            return (
              <View key={categoryId} style={[styles.categoryBadge, { backgroundColor: category.color + "20" }]}>
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[styles.categoryName, { color: category.color }]}>{category.name}</Text>
              </View>
            )
          })}
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Ionicons name="close" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {note.content && <Text style={[styles.content, { color: theme.text }]}>{note.content}</Text>}

      {/* Media Attachments */}
      {note.attachments && note.attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          {note.attachments.map((attachment) => (
            <MediaAttachmentView key={attachment.id} attachment={attachment} />
          ))}
        </View>
      )}

      <Text style={[styles.timestamp, { color: theme.textSecondary }]}>{formatDate(note.timestamp)}</Text>
    </View>
  )
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    categoriesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      flex: 1,
      marginRight: 8,
    },
    categoryBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 6,
      marginBottom: 4,
    },
    categoryEmoji: {
      fontSize: 12,
      marginRight: 4,
    },
    categoryName: {
      fontSize: 12,
      fontWeight: "600",
    },
    deleteButton: {
      padding: 4,
    },
    content: {
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 12,
    },
    attachmentsContainer: {
      marginBottom: 12,
    },
    timestamp: {
      fontSize: 12,
    },
  })
