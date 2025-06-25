import * as FileSystem from "expo-file-system"
import type { Category } from "../types"

const WIDGET_DATA_PATH = FileSystem.documentDirectory + "widget-data.json"

export interface WidgetData {
  categories: Category[]
  lastUpdated: string
}

export const saveWidgetData = async (categories: Category[]) => {
  try {
    const widgetData: WidgetData = {
      categories,
      lastUpdated: new Date().toISOString(),
    }

    await FileSystem.writeAsStringAsync(WIDGET_DATA_PATH, JSON.stringify(widgetData))
    console.log("Widget data saved successfully")
  } catch (error) {
    console.error("Error saving widget data:", error)
  }
}

export const loadWidgetData = async (): Promise<WidgetData | null> => {
  try {
    const fileExists = await FileSystem.getInfoAsync(WIDGET_DATA_PATH)
    if (!fileExists.exists) {
      return null
    }

    const data = await FileSystem.readAsStringAsync(WIDGET_DATA_PATH)
    return JSON.parse(data)
  } catch (error) {
    console.error("Error loading widget data:", error)
    return null
  }
}
