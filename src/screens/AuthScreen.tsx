"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Image } from "react-native"
import { useAuth } from "../context/AuthContext"

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Fehler", "Bitte fülle alle Felder aus.")
      return
    }

    setLoading(true)
    try {
      const { error } = isLogin ? await signIn(email, password) : await signUp(email, password)

      if (error) {
        Alert.alert("Fehler", error.message)
      } else if (!isLogin) {
        Alert.alert("Registrierung erfolgreich!", "Bitte überprüfe deine E-Mail und bestätige dein Konto.")
      }
    } catch (error: any) {
      Alert.alert("Fehler", error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
  source={require("../../assets/logo.png")}
  style={{ width: 64, height: 64 }}
  resizeMode="contain"
/>
            <Text style={styles.title}>Sorta</Text>
            <Text style={styles.subtitle}>Dein Notion Companion</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>{isLogin ? "Anmelden" : "Registrieren"}</Text>

            <TextInput
              style={styles.input}
              placeholder="E-Mail"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Passwort"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.authButton, loading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.authButtonText}>{loading ? "Lädt..." : isLogin ? "Anmelden" : "Registrieren"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchButtonText}>
                {isLogin ? "Noch kein Konto? Registrieren" : "Bereits ein Konto? Anmelden"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
  },
  form: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  authButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  authButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  authButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    marginTop: 24,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#3B82F6",
    fontSize: 14,
  },
})
