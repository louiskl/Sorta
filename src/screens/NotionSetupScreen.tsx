"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useNotion } from "../context/NotionContext"

interface SetupStep {
  id: number
  title: string
  description: string
  completed: boolean
}

export default function NotionSetupScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(1)
  const [apiKey, setApiKey] = useState("")
  const [databaseId, setDatabaseId] = useState("")
  const [loading, setLoading] = useState(false)
  const { connectToNotion } = useNotion()

  const steps: SetupStep[] = [
    {
      id: 1,
      title: "Notion Integration erstellen",
      description: "Erstelle eine neue Integration in deinem Notion-Workspace",
      completed: false,
    },
    {
      id: 2,
      title: "Datenbank erstellen",
      description: "Erstelle eine neue Datenbank für deine Sorta-Notizen",
      completed: false,
    },
    {
      id: 3,
      title: "Verbindung herstellen",
      description: "Verbinde Sorta mit deiner Notion-Datenbank",
      completed: false,
    },
  ]

  const openNotionIntegrations = () => {
    Linking.openURL("https://www.notion.so/my-integrations")
  }

  const handleTestConnection = async () => {
    if (!apiKey || !databaseId) {
      Alert.alert("Fehler", "Bitte fülle alle Felder aus.")
      return
    }

    setLoading(true)
    try {
      const success = await connectToNotion(apiKey, databaseId)
      if (success) {
        Alert.alert("Verbindung erfolgreich!", "Sorta ist jetzt mit deiner Notion-Datenbank verbunden.", [
          {
            text: "Fertig",
            onPress: () => navigation.goBack(),
          },
        ])
      } else {
        Alert.alert("Verbindung fehlgeschlagen", "Bitte überprüfe deine API-Key und Datenbank-ID.")
      }
    } catch (error) {
      Alert.alert("Fehler", "Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Schritt 1: Notion Integration erstellen</Text>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>📝 Anleitung:</Text>
        <Text style={styles.instructionText}>
          1. Gehe zu notion.so/my-integrations{"\n"}
          2. Klicke auf "Neue Integration"{"\n"}
          3. Gib einen Namen ein (z.B. "Sorta"){"\n"}
          4. Wähle deinen Workspace aus{"\n"}
          5. Kopiere den "Internal Integration Token"
        </Text>
      </View>

      <TouchableOpacity style={styles.linkButton} onPress={openNotionIntegrations}>
        <Ionicons name="open-outline" size={20} color="#3B82F6" />
        <Text style={styles.linkButtonText}>Notion Integrationen öffnen</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Notion API Key (secret_...)"
        placeholderTextColor="#9CA3AF"
        value={apiKey}
        onChangeText={setApiKey}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.nextButton, !apiKey && styles.nextButtonDisabled]}
        onPress={() => setCurrentStep(2)}
        disabled={!apiKey}
      >
        <Text style={styles.nextButtonText}>Weiter</Text>
        <Ionicons name="chevron-forward" size={20} color="white" />
      </TouchableOpacity>
    </View>
  )

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Schritt 2: Datenbank erstellen</Text>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>🗄️ Datenbank Setup:</Text>
        <Text style={styles.instructionText}>
          1. Erstelle eine neue Seite in Notion{"\n"}
          2. Füge eine Datenbank hinzu{"\n"}
          3. Erstelle folgende Spalten:{"\n"}• Titel (Titel){"\n"}• Inhalt (Text){"\n"}• Kategorien (Multi-Select){"\n"}
          • Priorität (Select){"\n"}• Erstellt (Datum){"\n"}• Status (Select)
        </Text>
      </View>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>🔗 Integration verbinden:</Text>
        <Text style={styles.instructionText}>
          1. Klicke auf "..." in deiner Datenbank{"\n"}
          2. Wähle "Verbindungen hinzufügen"{"\n"}
          3. Wähle deine "Sorta" Integration{"\n"}
          4. Kopiere die Datenbank-ID aus der URL
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Datenbank ID (32 Zeichen)"
        placeholderTextColor="#9CA3AF"
        value={databaseId}
        onChangeText={setDatabaseId}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(1)}>
          <Ionicons name="chevron-back" size={20} color="#6B7280" />
          <Text style={styles.backButtonText}>Zurück</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, !databaseId && styles.nextButtonDisabled]}
          onPress={() => setCurrentStep(3)}
          disabled={!databaseId}
        >
          <Text style={styles.nextButtonText}>Weiter</Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Schritt 3: Verbindung testen</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>🔍 Zusammenfassung:</Text>
        <Text style={styles.summaryText}>
          API Key: {apiKey.substring(0, 20)}...{"\n"}
          Datenbank ID: {databaseId.substring(0, 8)}...
        </Text>
      </View>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>✅ Bereit zum Testen!</Text>
        <Text style={styles.instructionText}>
          Klicke auf "Verbindung testen" um zu überprüfen, ob alles korrekt eingerichtet ist. Nach erfolgreicher
          Verbindung werden deine Notizen automatisch mit Notion synchronisiert.
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(2)}>
          <Ionicons name="chevron-back" size={20} color="#6B7280" />
          <Text style={styles.backButtonText}>Zurück</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, loading && styles.testButtonDisabled]}
          onPress={handleTestConnection}
          disabled={loading}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.testButtonText}>{loading ? "Teste..." : "Verbindung testen"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      default:
        return renderStep1()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notion Setup</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.progressStep}>
            <View style={[styles.progressCircle, currentStep >= step.id && styles.progressCircleActive]}>
              <Text style={[styles.progressNumber, currentStep >= step.id && styles.progressNumberActive]}>
                {step.id}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[styles.progressLine, currentStep > step.id && styles.progressLineActive]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "white",
  },
  progressStep: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircleActive: {
    backgroundColor: "#3B82F6",
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  progressNumberActive: {
    color: "white",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: "#3B82F6",
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
    textAlign: "center",
  },
  instructionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  summaryCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369A1",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#0369A1",
    fontFamily: "monospace",
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  linkButtonText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: "#6B7280",
    fontSize: 16,
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  nextButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  testButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  testButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})
