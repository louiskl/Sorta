"use client"

import { useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform, Image } from "react-native"

import HomeScreen from "./src/screens/HomeScreen"
import SettingsScreen from "./src/screens/SettingsScreen"
import AuthScreen from "./src/screens/AuthScreen"
import NotionSetupScreen from "./src/screens/NotionSetupScreen"

import { DatabaseProvider } from "./src/context/DatabaseContext"
import { NotificationProvider } from "./src/context/NotificationContext"
import { AuthProvider, useAuth } from "./src/context/AuthContext"
import { NotionProvider } from "./src/context/NotionContext"
import { ThemeProvider, useTheme } from "./src/context/ThemeContext"

const Stack = createStackNavigator()

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

function AppNavigator() {
  const { user, loading } = useAuth()
  const { theme, isDark } = useTheme()

  if (loading) {
    return null // You could add a loading screen here
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: theme.primary,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          border: theme.border,
          notification: theme.primary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.surface,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0 : 0.1,
            shadowRadius: 3,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: "Sorta",
                headerTitle: () => (
            <Image
              source={require("./assets/logo.png")}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          ),
                headerLeft: () => null,
              }}
            />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Einstellungen" }} />
            <Stack.Screen
              name="NotionSetup"
              component={NotionSetupScreen}
              options={{
                title: "Notion Setup",
                presentation: "modal",
                headerShown: false,
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync()
  }, [])

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotionProvider>
            <DatabaseProvider>
              <NotificationProvider>
                <AppNavigator />
                <StatusBar style="auto" />
            </NotificationProvider>
          </DatabaseProvider>
        </NotionProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

async function registerForPushNotificationsAsync() {
  let token

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== "granted") {
      alert("Benachrichtigungen sind für die beste Erfahrung empfohlen!")
      return
    }
    token = (await Notifications.getExpoPushTokenAsync()).data
  } else {
    alert("Benachrichtigungen funktionieren nur auf echten Geräten")
  }

  return token
}
