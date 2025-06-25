import { Client } from "@notionhq/client"

export interface NotionConfig {
  apiKey: string
  databaseId: string
}

export class NotionService {
  private notion: Client | null = null
  private databaseId = ""

  constructor(config?: NotionConfig) {
    if (config) {
      this.initialize(config)
    }
  }

  initialize(config: NotionConfig) {
    this.notion = new Client({
      auth: config.apiKey,
    })
    this.databaseId = config.databaseId
  }

  async testConnection(): Promise<boolean> {
    if (!this.notion || !this.databaseId) {
      throw new Error("Notion client not initialized")
    }

    try {
      await this.notion.databases.retrieve({
        database_id: this.databaseId,
      })
      return true
    } catch (error) {
      console.error("Notion connection test failed:", error)
      return false
    }
  }

  async syncNoteToNotion(note: {
    content: string
    categories: string[]
    timestamp: Date
    priority: string
  }): Promise<string> {
    if (!this.notion || !this.databaseId) {
      throw new Error("Notion client not initialized")
    }

    try {
      const response = await this.notion.pages.create({
        parent: {
          database_id: this.databaseId,
        },
        properties: {
          Titel: {
            title: [
              {
                text: {
                  content: note.content.substring(0, 100) + (note.content.length > 100 ? "..." : ""),
                },
              },
            ],
          },
          Inhalt: {
            rich_text: [
              {
                text: {
                  content: note.content,
                },
              },
            ],
          },
          Kategorien: {
            multi_select: note.categories.map((cat) => ({ name: cat })),
          },
          Priorität: {
            select: {
              name: note.priority,
            },
          },
          Erstellt: {
            date: {
              start: note.timestamp.toISOString(),
            },
          },
          Status: {
            select: {
              name: "Neu",
            },
          },
        },
      })

      return response.id
    } catch (error) {
      console.error("Error syncing note to Notion:", error)
      throw error
    }
  }

  async getDatabaseProperties(): Promise<any> {
    if (!this.notion || !this.databaseId) {
      throw new Error("Notion client not initialized")
    }

    try {
      const response = await this.notion.databases.retrieve({
        database_id: this.databaseId,
      })
      return response.properties
    } catch (error) {
      console.error("Error getting database properties:", error)
      throw error
    }
  }
}

export const notionService = new NotionService()
