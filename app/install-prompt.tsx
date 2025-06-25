"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOS)

    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches
    setIsStandalone(standalone)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      }
    }
  }

  const dismissPrompt = () => {
    setShowInstallPrompt(false)
  }

  // Don't show if already installed
  if (isStandalone) {
    return null
  }

  // Show iOS specific instructions
  if (isIOS && !isStandalone) {
    return (
      <Card className="mx-4 mb-4 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-2">App installieren</h3>
              <p className="text-sm text-blue-800">
                Um Sorta als App zu installieren, tippe auf das Teilen-Symbol{" "}
                <span className="inline-block mx-1">⎋</span> und dann auf <strong>"Zum Home-Bildschirm"</strong>{" "}
                <span className="inline-block mx-1">➕</span>.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={dismissPrompt}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show install prompt for other browsers
  if (showInstallPrompt && deferredPrompt) {
    return (
      <Card className="mx-4 mb-4 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-1">App installieren</h3>
              <p className="text-sm text-blue-800">Installiere Sorta für eine bessere Erfahrung</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={dismissPrompt}>
                <X className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleInstallClick}>
                <Download className="h-4 w-4 mr-2" />
                Installieren
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
