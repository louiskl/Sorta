"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, X, Settings } from "lucide-react"
import InstallPrompt from "./install-prompt"

interface Note {
  id: string
  content: string
  categories: string[]
  timestamp: Date
  priority: "low" | "medium" | "high"
}

interface Category {
  id: string
  name: string
  emoji: string
  color: string
}

const defaultCategories: Category[] = [
  { id: "notiz", name: "Notiz", emoji: "📝", color: "bg-gray-100 text-gray-800" },
  { id: "arbeit", name: "Arbeit", emoji: "🏢", color: "bg-blue-100 text-blue-800" },
  { id: "idee", name: "Idee", emoji: "💡", color: "bg-yellow-100 text-yellow-800" },
  { id: "einkaufen", name: "Einkaufen", emoji: "🛍️", color: "bg-pink-100 text-pink-800" },
  { id: "gesundheit", name: "Gesundheit", emoji: "🏥", color: "bg-red-100 text-red-800" },
  { id: "essen", name: "Essen & Kochen", emoji: "🍽️", color: "bg-orange-100 text-orange-800" },
  { id: "reise", name: "Reise", emoji: "✈️", color: "bg-sky-100 text-sky-800" },
  { id: "sport", name: "Sport & Fitness", emoji: "💪", color: "bg-green-100 text-green-800" },
  { id: "haushalt", name: "Haushalt", emoji: "🏠", color: "bg-amber-100 text-amber-800" },
  { id: "lernen", name: "Lernen & Bildung", emoji: "📚", color: "bg-indigo-100 text-indigo-800" },
  { id: "ziele", name: "Ziele & Projekte", emoji: "🎯", color: "bg-purple-100 text-purple-800" },
  { id: "unterhaltung", name: "Unterhaltung", emoji: "🎬", color: "bg-rose-100 text-rose-800" },
  { id: "kontakte", name: "Kontakte & Meetings", emoji: "👥", color: "bg-teal-100 text-teal-800" },
  { id: "geschenke", name: "Geschenke", emoji: "🎁", color: "bg-emerald-100 text-emerald-800" },
  { id: "energie", name: "Energie & Motivation", emoji: "⚡", color: "bg-yellow-100 text-yellow-800" },
  { id: "nachhaltigkeit", name: "Nachhaltigkeit", emoji: "🌱", color: "bg-lime-100 text-lime-800" },
  { id: "finanzen", name: "Finanzen", emoji: "💰", color: "bg-green-100 text-green-800" },
  { id: "tech", name: "Tech & Tools", emoji: "🔧", color: "bg-slate-100 text-slate-800" },
]

export default function SortaApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [newNote, setNewNote] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["notiz"])
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [showCategoryManager, setShowCategoryManager] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("sorta-notes")
    const savedCategories = localStorage.getItem("sorta-categories")

    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        timestamp: new Date(note.timestamp),
      }))
      setNotes(parsedNotes)
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    }
  }, [])

  // Save to localStorage whenever notes or categories change
  useEffect(() => {
    localStorage.setItem("sorta-notes", JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    localStorage.setItem("sorta-categories", JSON.stringify(categories))
  }, [categories])

  const addNote = () => {
    if (!newNote.trim()) return

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      categories: selectedCategories,
      timestamp: new Date(),
      priority: "medium",
    }

    setNotes((prev) => [note, ...prev])
    setNewNote("")
    setSelectedCategories(["notiz"])
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === "all" || note.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return `Heute, ${date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays === 2) {
      return `Gestern, ${date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return `${date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}, ${date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Sorta</h1>
          <Button variant="ghost" size="icon" onClick={() => setShowCategoryManager(!showCategoryManager)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Install Prompt */}
      <InstallPrompt />

      <div className="px-4 py-4 space-y-6">
        {/* Note Input */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <Textarea
              placeholder="Neue Notiz schreiben..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px] resize-none border-0 p-0 text-base focus-visible:ring-0"
            />

            {/* Category Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Kategorien</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedCategories.includes(category.id) ? category.color : "hover:bg-gray-100"
                    }`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <span className="mr-1">{category.emoji}</span>
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={addNote} className="w-full" disabled={!newNote.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Notiz hinzufügen
            </Button>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Notizen durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Alle Prioritäten" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Prioritäten</SelectItem>
              <SelectItem value="high">Hoch</SelectItem>
              <SelectItem value="medium">Mittel</SelectItem>
              <SelectItem value="low">Niedrig</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">
                  {searchTerm ? "Keine Notizen gefunden." : "Noch keine Notizen vorhanden."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotes.map((note) => (
              <Card key={note.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap gap-1">
                      {note.categories.map((categoryId) => {
                        const category = categories.find((c) => c.id === categoryId)
                        if (!category) return null
                        return (
                          <Badge key={categoryId} variant="secondary" className={category.color}>
                            <span className="mr-1">{category.emoji}</span>
                            {category.name}
                          </Badge>
                        )
                      })}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 -mt-1 -mr-1"
                      onClick={() => deleteNote(note.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-gray-900 mb-2">{note.content}</p>
                  <p className="text-xs text-gray-500">{formatDate(note.timestamp)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
