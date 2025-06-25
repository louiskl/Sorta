"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import * as Linking from "expo-linking"

import { useDatabase } from "../context/DatabaseContext"
import { useNotification } from "../context/NotificationContext"
import { useTheme } from "../context/ThemeContext"
import CategorySelector from "../components/CategorySelector"
import NoteCard from "../components/NoteCard"
import SearchBar from "../components/SearchBar"
import MediaInputBar from "../components/MediaInputBar"
import MediaAttachmentView from "../components/MediaAttachmentView"
import { saveWidgetData } from "../lib/widgetData"
import { DEEP_LINKS } from "../lib/deepLinking"
import { deleteMediaFile } from "../lib/mediaUtils"
import type { Note, Category, MediaAttachment } from "../types"

const defaultCategories: Category[] = [
  { id: "notiz", name: "Notiz", emoji: "📝", color: "#6B7280" },
  { id: "arbeit", name: "Arbeit", emoji: "🏢", color: "#3B82F6" },
  { id: "idee", name: "Idee", emoji: "💡", color: "#F59E0B" },
  { id: "einkaufen", name: "Einkaufen", emoji: "🛍️", color: "#EC4899" },
  { id: "gesundheit", name: "Gesundheit", emoji: "🏥", color: "#EF4444" },
  { id: "essen", name: "Essen & Kochen", emoji: "🍽️", color: "#F97316" },
  { id: "reise", name: "Reise", emoji: "✈️", color: "#0EA5E9" },
  { id: "sport", name: "Sport & Fitness", emoji: "💪", color: "#10B981" },
  { id: "haushalt", name: "Haushalt", emoji: "🏠", color: "#F59E0B" },
  { id: "lernen", name: "Lernen & Bildung", emoji: "📚", color: "#6366F1" },
  { id: "ziele", name: "Ziele & Projekte", emoji: "🎯", color: "#8B5CF6" },
  { id: "unterhaltung", name: "Unterhaltung", emoji: "🎬", color: "#F43F5E" },
  { id: "kontakte", name: "Kontakte & Meetings", emoji: "👥", color: "#14B8A6" },
  { id: "geschenke", name: "Geschenke", emoji: "🎁", color: "#059669" },
  { id: "energie", name: "Energie & Motivation", emoji: "⚡", color: "#EAB308" },
  { id: "nachhaltigkeit", name: "Nachhaltigkeit", emoji: "🌱", color: "#84CC16" },
  { id: "finanzen", name: "Finanzen", emoji: "💰", color: "#22C55E" },
  { id: "tech", name: "Tech & Tools", emoji: "🔧", color: "#64748B" },
]

export default function HomeScreen({ navigation }: any) {
  const { notes, addNote, deleteNote, categories, setCategories } = useDatabase()
  const { scheduleNotification } = useNotification()
  const { theme, isDark } = useTheme()

  const [newNote, setNewNote] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["notiz"])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [attachments, setAttachments] = useState<MediaAttachment[]>([])

  useEffect(() => {
    if (categories.length === 0) {
      setCategories(defaultCategories)
    } else {
      saveWidgetData(categories)
    }
  }, [categories])

  useEffect(() => {
    const filtered = notes.filter((note) => note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredNotes(filtered)
  }, [notes, searchTerm])

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      const { path } = Linking.parse(url)
      if (path === DEEP_LINKS.CREATE_NOTE) {
        setShowNoteInput(true)
      }
    }

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url)
    })

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url)
      }
    })

    return () => subscription?.remove()
  }, [])

  const handleAddNote = async () => {
    if (!newNote.trim() && attachments.length === 0) {
      Alert.alert("Fehler", "Bitte füge Text oder Medien hinzu.")
      return
    }

    const note: Omit<Note, "id"> = {
      content: newNote.trim(),
      categories: selectedCategories,
      timestamp: new Date(),
      priority: "medium",
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    await addNote(note)

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    setNewNote("")
    setSelectedCategories(["notiz"])
    setAttachments([])
    setShowNoteInput(false)
  }

  const handleDeleteNote = async (id: string) => {
    Alert.alert("Notiz löschen", "Möchtest du diese Notiz wirklich löschen?", [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Löschen",
        style: "destructive",
        onPress: async () => {
          // Find the note to get its attachments
          const noteToDelete = notes.find((n) => n.id === id)
          if (noteToDelete?.attachments) {
            // Delete media files
            for (const attachment of noteToDelete.attachments) {
              await deleteMediaFile(attachment.uri)
            }
          }
          await deleteNote(id)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        },
      },
    ])
  }

  const handleMediaAttached = (attachment: MediaAttachment) => {
    setAttachments((prev) => [...prev, attachment])
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleRemoveAttachment = async (attachmentId: string) => {
    const attachment = attachments.find((a) => a.id === attachmentId)
    if (attachment) {
      await deleteMediaFile(attachment.uri)
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return `Heute, ${date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays === 2) {
      return `Gestern, ${date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return `${date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}, ${date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`
    }
  }

  const styles = createStyles(theme, isDark)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        {/* Header with Settings */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="settings-outline" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Quick Add Button */}
          {!showNoteInput && (
            <TouchableOpacity
              style={[styles.quickAddButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowNoteInput(true)}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.quickAddText}>Neue Notiz erstellen</Text>
            </TouchableOpacity>
          )}

          {/* Note Input Card */}
          {showNoteInput && (
            <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder="Neue Notiz schreiben..."
                placeholderTextColor={theme.textSecondary}
                value={newNote}
                onChangeText={setNewNote}
                multiline
                textAlignVertical="top"
                autoFocus
              />

              {/* Media Attachments */}
              {attachments.length > 0 && (
                <View style={styles.attachmentsContainer}>
                  {attachments.map((attachment) => (
                    <MediaAttachmentView
                      key={attachment.id}
                      attachment={attachment}
                      showRemoveButton
                      onRemove={() => handleRemoveAttachment(attachment.id)}
                    />
                  ))}
                </View>
              )}

              <CategorySelector
                categories={categories}
                selectedCategories={selectedCategories}
                onToggleCategory={(categoryId) => {
                  const newSelected = selectedCategories.includes(categoryId)
                    ? selectedCategories.filter((id) => id !== categoryId)
                    : [...selectedCategories, categoryId]
                  setSelectedCategories(newSelected)
                  Haptics.selectionAsync()
                }}
              />

              {/* Media Input Bar */}
              <MediaInputBar onMediaAttached={handleMediaAttached} />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                  onPress={() => {
                    setShowNoteInput(false)
                    setNewNote("")
                    setAttachments([])
                    setSelectedCategories(["notiz"])
                  }}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Abbrechen</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.addButton,
                    { backgroundColor: theme.primary },
                    !newNote.trim() && attachments.length === 0 && styles.addButtonDisabled,
                  ]}
                  onPress={handleAddNote}
                  disabled={!newNote.trim() && attachments.length === 0}
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text style={styles.addButtonText}>Speichern</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Search Bar */}
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          {/* Notes List */}
          <View style={styles.notesContainer}>
            {filteredNotes.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
                <Ionicons name="document-text-outline" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  {searchTerm ? "Keine Notizen gefunden." : "Noch keine Notizen vorhanden."}
                </Text>
                {!searchTerm && !showNoteInput && (
                  <TouchableOpacity
                    style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
                    onPress={() => setShowNoteInput(true)}
                  >
                    <Text style={styles.emptyStateButtonText}>Erste Notiz erstellen</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  categories={categories}
                  onDelete={() => handleDeleteNote(note.id)}
                  formatDate={formatDate}
                />
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
    },
    settingsButton: {
      padding: 8,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 16,
    },
    quickAddButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginTop: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    quickAddText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    inputCard: {
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    textInput: {
      fontSize: 16,
      lineHeight: 24,
      minHeight: 100,
      textAlignVertical: "top",
      marginBottom: 16,
    },
    attachmentsContainer: {
      marginBottom: 16,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
    },
    cancelButton: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      marginRight: 8,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "500",
    },
    addButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginLeft: 8,
    },
    addButtonDisabled: {
      opacity: 0.5,
    },
    addButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    notesContainer: {
      paddingBottom: 32,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginTop: 16,
    },
    emptyStateText: {
      fontSize: 16,
      marginTop: 16,
      textAlign: "center",
    },
    emptyStateButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginTop: 16,
    },
    emptyStateButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
    },
  })
