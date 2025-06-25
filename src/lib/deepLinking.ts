import * as Linking from "expo-linking"

export const createDeepLink = (path: string, params?: Record<string, string>) => {
  const url = Linking.createURL(path, {
    queryParams: params,
  })
  return url
}

export const handleDeepLink = (url: string) => {
  const { path, queryParams } = Linking.parse(url)
  return { path, params: queryParams }
}

// Deep link URLs
export const DEEP_LINKS = {
  CREATE_NOTE: "create-note",
  CATEGORY: "category",
  HOME: "home",
}
