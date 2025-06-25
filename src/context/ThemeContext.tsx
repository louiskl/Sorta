"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import * as SystemUI from "expo-system-ui"
import AsyncStorage from "@react-native-async-storage/async-storage"

export type ThemeMode = "light" | "dark" | "system"

interface ThemeColors {
  background: string
  surface: string
  primary: string
  secondary: string
  text: string
  textSecondary: string
  border: string
  card: string
  success: string
  warning: string
  error: string
  accent: string
}

const lightTheme: ThemeColors = {
  background: "#F9FAFB",
  surface: "#FFFFFF",
  primary: "#3B82F6",
  secondary: "#6B7280",
  text: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  card: "#FFFFFF",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  accent: "#8B5CF6",
}

const darkTheme: ThemeColors = {
  background: "#0F172A",
  surface: "#1E293B",
  primary: "#60A5FA",
  secondary: "#94A3B8",
  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  border: "#334155",
  card: "#1E293B",
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  accent: "#A78BFA",
}

interface ThemeContextType {
  theme: ThemeColors
  themeMode: ThemeMode
  isDark: boolean
  setThemeMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system")

  const isDark = themeMode === "dark" || (themeMode === "system" && systemColorScheme === "dark")
  const theme = isDark ? darkTheme : lightTheme

  useEffect(() => {
    loadThemeMode()
  }, [])

  useEffect(() => {
    // Update system UI
    SystemUI.setBackgroundColorAsync(theme.background)
  }, [theme])

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem("theme-mode")
      if (savedMode && ["light", "dark", "system"].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode)
      }
    } catch (error) {
      console.error("Error loading theme mode:", error)
    }
  }

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode)
      await AsyncStorage.setItem("theme-mode", mode)
    } catch (error) {
      console.error("Error saving theme mode:", error)
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        isDark,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
