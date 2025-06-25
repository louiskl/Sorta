"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import * as SecureStore from "expo-secure-store"
import { notionService, NotionService } from "../lib/notion"
import { useAuth } from "./AuthContext"

interface NotionContextType {
  isConnected: boolean
  isLoading: boolean
  connectToNotion: (apiKey: string, databaseId: string) => Promise<boolean>
  disconnectNotion: () => Promise<void>
  syncNote: (note: any) => Promise<string | null>
  testConnection: () => Promise<boolean>
}

const NotionContext = createContext<NotionContextType | undefined>(undefined)

export function NotionProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    checkExistingConnection()
  }, [user])

  const checkExistingConnection = async () => {
    if (!user) return

    try {
      const apiKey = await SecureStore.getItemAsync(`notion_api_key_${user.id}`)
      const databaseId = await SecureStore.getItemAsync(`notion_database_id_${user.id}`)

      if (apiKey && databaseId) {
        notionService.initialize({ apiKey, databaseId })
        const connectionValid = await notionService.testConnection()
        setIsConnected(connectionValid)
      }
    } catch (error) {
      console.error("Error checking existing connection:", error)
      setIsConnected(false)
    }
  }

  const connectToNotion = async (apiKey: string, databaseId: string): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    try {
      // Test the connection first
      const testService = new NotionService({ apiKey, databaseId })
      const isValid = await testService.testConnection()

      if (isValid) {
        // Save credentials securely
        await SecureStore.setItemAsync(`notion_api_key_${user.id}`, apiKey)
        await SecureStore.setItemAsync(`notion_database_id_${user.id}`, databaseId)

        // Initialize the main service
        notionService.initialize({ apiKey, databaseId })
        setIsConnected(true)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error("Error connecting to Notion:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectNotion = async () => {
    if (!user) return

    try {
      await SecureStore.deleteItemAsync(`notion_api_key_${user.id}`)
      await SecureStore.deleteItemAsync(`notion_database_id_${user.id}`)
      setIsConnected(false)
    } catch (error) {
      console.error("Error disconnecting from Notion:", error)
    }
  }

  const syncNote = async (note: any): Promise<string | null> => {
    if (!isConnected) return null

    try {
      const notionPageId = await notionService.syncNoteToNotion(note)
      return notionPageId
    } catch (error) {
      console.error("Error syncing note:", error)
      return null
    }
  }

  const testConnection = async (): Promise<boolean> => {
    if (!isConnected) return false

    try {
      return await notionService.testConnection()
    } catch (error) {
      console.error("Error testing connection:", error)
      return false
    }
  }

  return (
    <NotionContext.Provider
      value={{
        isConnected,
        isLoading,
        connectToNotion,
        disconnectNotion,
        syncNote,
        testConnection,
      }}
    >
      {children}
    </NotionContext.Provider>
  )
}

export function useNotion() {
  const context = useContext(NotionContext)
  if (context === undefined) {
    console.error("useNotion error: NotionProvider is missing in the component tree.")
    throw new Error("useNotion must be used within a NotionProvider")
  }
  return context
}
