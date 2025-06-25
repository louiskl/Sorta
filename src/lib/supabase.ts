import "react-native-url-polyfill/auto"
import { createClient } from "@supabase/supabase-js"
import * as SecureStore from "expo-secure-store"

const supabaseUrl = "https://ozqxcbxjrwvumbcdpfzb.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cXhjYnhqcnd2dW1iY2RwZnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTI3MTYsImV4cCI6MjA2NjQyODcxNn0.u5EvY8Wtn_b5OMZ1XhtqcWix9WQdfQyJ8_KP4jeaZFs"

// Custom storage implementation for React Native
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
