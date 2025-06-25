"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import * as SQLite from "expo-sqlite"
import type { Note, Category } from "../types"
import { useNotion } from "./NotionContext"

interface DatabaseContextType {
  notes: Note[]
  categories: Category[]
  addNote: (note: Omit<Note, "id">) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  updateNote: (id: string, note: Partial<Note>) => Promise<void>
  setCategories: (categories: Category[]) => void
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined)

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null)
  const { syncNote, isConnected } = useNotion()

  useEffect(() => {
    initDatabase()
  }, [])

  const initDatabase = async () => {
    try {
      const database = await SQLite.openDatabaseAsync("sorta.db")
      setDb(database)

      // Create tables
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          categories TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          priority TEXT DEFAULT 'medium',
          attachments TEXT
        );
      `)

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          emoji TEXT NOT NULL,
          color TEXT NOT NULL
        );
      `)

      // Load existing data
      await loadNotes(database)
      await loadCategories(database)
    } catch (error) {
      console.error("Database initialization error:", error)
    }
  }

  const loadNotes = async (database: SQLite.SQLiteDatabase) => {
    try {
      const result = await database.getAllAsync("SELECT * FROM notes ORDER BY timestamp DESC")
      const loadedNotes = result.map((row: any) => ({
        id: row.id,
        content: row.content,
        categories: JSON.parse(row.categories),
        timestamp: new Date(row.timestamp),
        priority: row.priority,
        attachments: row.attachments ? JSON.parse(row.attachments) : undefined,
      }))
      setNotes(loadedNotes)
    } catch (error) {
      console.error("Error loading notes:", error)
    }
  }

  const loadCategories = async (database: SQLite.SQLiteDatabase) => {
    try {
      const result = await database.getAllAsync("SELECT * FROM categories")
      const loadedCategories = result.map((row: any) => ({
        id: row.id,
        name: row.name,
        emoji: row.emoji,
        color: row.color,
      }))
      setCategories(loadedCategories)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const addNote = async (noteData: Omit<Note, "id">) => {
    if (!db) return

    const id = Date.now().toString()
    const note: Note = { ...noteData, id }

    try {
      await db.runAsync(
        "INSERT INTO notes (id, content, categories, timestamp, priority, attachments) VALUES (?, ?, ?, ?, ?, ?)",
        [
          id,
          note.content,
          JSON.stringify(note.categories),
          note.timestamp.toISOString(),
          note.priority,
          note.attachments ? JSON.stringify(note.attachments) : null,
        ],
      )
      setNotes((prev) => [note, ...prev])

      // Sync to Notion if connected
      if (isConnected) {
        try {
          const notionPageId = await syncNote(note)
          if (notionPageId) {
            console.log("Note synced to Notion:", notionPageId)
          }
        } catch (error) {
          console.error("Failed to sync to Notion:", error)
        }
      }
    } catch (error) {
      console.error("Error adding note:", error)
    }
  }

  const deleteNote = async (id: string) => {
    if (!db) return

    try {
      await db.runAsync("DELETE FROM notes WHERE id = ?", [id])
      setNotes((prev) => prev.filter((note) => note.id !== id))
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!db) return

    try {
      const note = notes.find((n) => n.id === id)
      if (!note) return

      const updatedNote = { ...note, ...updates }

      await db.runAsync("UPDATE notes SET content = ?, categories = ?, priority = ?, attachments = ? WHERE id = ?", [
        updatedNote.content,
        JSON.stringify(updatedNote.categories),
        updatedNote.priority,
        updatedNote.attachments ? JSON.stringify(updatedNote.attachments) : null,
        id,
      ])

      setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)))
    } catch (error) {
      console.error("Error updating note:", error)
    }
  }

  const saveCategoriestoDb = async (newCategories: Category[]) => {
    if (!db) return

    try {
      // Clear existing categories
      await db.runAsync("DELETE FROM categories")

      // Insert new categories
      for (const category of newCategories) {
        await db.runAsync("INSERT INTO categories (id, name, emoji, color) VALUES (?, ?, ?, ?)", [
          category.id,
          category.name,
          category.emoji,
          category.color,
        ])
      }
    } catch (error) {
      console.error("Error saving categories:", error)
    }
  }

  const setCategoriesWithSave = (newCategories: Category[]) => {
    setCategories(newCategories)
    saveCategoriestoDb(newCategories)
  }

  return (
    <DatabaseContext.Provider
      value={{
        notes,
        categories,
        addNote,
        deleteNote,
        updateNote,
        setCategories: setCategoriesWithSave,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider")
  }
  return context
}
