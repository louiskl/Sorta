"use client"

import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import * as Notifications from "expo-notifications"
import { useNotion } from "../context/NotionContext"
import { useTheme } from "../context/ThemeContext"
import { useNavigation } from "@react-navigation/native"

export default function SettingsScreen() {
  const navigation = useNavigation()
  const { isConnected, disconnectNotion, testConnection } = useNotion()
  const { theme, themeMode, setThemeMode, isDark } = useTheme()

  const handleNotificationTest = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Benachrichtigung",
          body: "Sorta Benachrichtigungen funktionieren!",
          sound: true,
        },
        trigger: { seconds: 2 },
      })
      Alert.alert("Erfolg", "Test-Benachrichtigung wurde geplant!")
    } catch (error) {
      Alert.alert("Fehler", "Benachrichtigung konnte nicht gesendet werden.")
    }
  }

  const handleThemeChange = () => {
    Alert.alert("Design wählen", "Welches Design möchtest du verwenden?", [
      { text: "Hell", onPress: () => setThemeMode("light") },
      { text: "Dunkel", onPress: () => setThemeMode("dark") },
      { text: "System", onPress: () => setThemeMode("system") },
      { text: "Abbrechen", style: "cancel" },
    ])
  }

  const getThemeDisplayName = () => {
    switch (themeMode) {
      case "light":
        return "Hell"
      case "dark":
        return "Dunkel"
      case "system":
        return "System"
      default:
        return "System"
    }
  }

  const handleExportData = () => {
    Alert.alert("Daten exportieren", "Diese Funktion wird in einer zukünftigen Version verfügbar sein.", [
      { text: "OK" },
    ])
  }

  const handleNotionSetup = () => {
    navigation.navigate("NotionSetup")
  }

  const handleNotionDisconnect = async () => {
    Alert.alert("Notion Verbindung trennen", "Möchtest du die Verbindung zu Notion wirklich trennen?", [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Trennen",
        style: "destructive",
        onPress: async () => {
          await disconnectNotion()
          Alert.alert("Erfolg", "Verbindung zu Notion wurde getrennt.")
        },
      },
    ])
  }

  const handleNotionTest = async () => {
    try {
      const isWorking = await testConnection()
      Alert.alert(
        isWorking ? "Verbindung OK" : "Verbindung fehlgeschlagen",
        isWorking
          ? "Die Verbindung zu Notion funktioniert einwandfrei."
          : "Die Verbindung zu Notion ist fehlgeschlagen. Bitte überprüfe deine Einstellungen.",
      )
    } catch (error) {
      Alert.alert("Fehler", "Verbindung konnte nicht getestet werden.")
    }
  }

  const handleNotionSync = () => {
    if (isConnected) {
      Alert.alert("Bereits verbunden", "Du bist bereits mit Notion verbunden!")
    } else {
      handleNotionSetup()
    }
  }

  const styles = createStyles(theme, isDark)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Darstellung</Text>
          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card }]} onPress={handleThemeChange}>
            <View style={styles.settingLeft}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Design</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: theme.textSecondary }]}>{getThemeDisplayName()}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Benachrichtigungen</Text>
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.card }]}
            onPress={handleNotificationTest}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Test-Benachrichtigung senden</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Daten</Text>
          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card }]} onPress={handleExportData}>
            <View style={styles.settingLeft}>
              <Ionicons name="download-outline" size={24} color={theme.success} />
              <Text style={[styles.settingText, { color: theme.text }]}>Daten exportieren</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Integration</Text>
          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card }]} onPress={handleNotionSync}>
            <View style={styles.settingLeft}>
              <Ionicons name="sync-outline" size={24} color={theme.accent} />
              <Text style={[styles.settingText, { color: theme.text }]}>Mit Notion synchronisieren</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notion Integration</Text>
          {isConnected ? (
            <>
              <TouchableOpacity
                style={[styles.settingItem, { backgroundColor: theme.card }]}
                onPress={handleNotionTest}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                  <Text style={[styles.settingText, { color: theme.text }]}>Verbindung testen</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.settingItem, { backgroundColor: theme.card }]}
                onPress={handleNotionDisconnect}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="unlink" size={24} color={theme.error} />
                  <Text style={[styles.settingText, { color: theme.text }]}>Verbindung trennen</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card }]} onPress={handleNotionSetup}>
              <View style={styles.settingLeft}>
                <Ionicons name="link" size={24} color={theme.accent} />
                <Text style={[styles.settingText, { color: theme.text }]}>Mit Notion verbinden</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Über</Text>
          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={24} color={theme.textSecondary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Version</Text>
            </View>
            <Text style={[styles.versionText, { color: theme.textSecondary }]}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      marginTop: 32,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 16,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 12,
      marginBottom: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0 : 0.1,
      shadowRadius: 4,
      elevation: isDark ? 0 : 2,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    settingRight: {
      flexDirection: "row",
      alignItems: "center",
    },
    settingText: {
      fontSize: 16,
      marginLeft: 12,
    },
    settingValue: {
      fontSize: 16,
      marginRight: 8,
    },
    versionText: {
      fontSize: 16,
    },
  })
