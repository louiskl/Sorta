"use client"

import type React from "react"
import { createContext, useContext } from "react"
import * as Notifications from "expo-notifications"

interface NotificationContextType {
  scheduleNotification: (title: string, body: string, seconds?: number) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const scheduleNotification = async (title: string, body: string, seconds = 5) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: { seconds },
      })
    } catch (error) {
      console.error("Error scheduling notification:", error)
    }
  }

  return <NotificationContext.Provider value={{ scheduleNotification }}>{children}</NotificationContext.Provider>
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
