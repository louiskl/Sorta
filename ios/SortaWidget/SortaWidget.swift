import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), categories: sampleCategories)
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), categories: sampleCategories)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let categories = loadCategories()
        let entry = SimpleEntry(date: Date(), categories: categories)
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let categories: [CategoryData]
}

struct CategoryData: Identifiable {
    let id: String
    let name: String
    let emoji: String
    let color: String
}

let sampleCategories = [
    CategoryData(id: "notiz", name: "Notiz", emoji: "📝", color: "#6B7280"),
    CategoryData(id: "arbeit", name: "Arbeit", emoji: "🏢", color: "#3B82F6"),
    CategoryData(id: "idee", name: "Idee", emoji: "💡", color: "#F59E0B"),
    CategoryData(id: "einkaufen", name: "Einkaufen", emoji: "🛍️", color: "#EC4899"),
]

// Small Widget - Quick Note Creation
struct SmallWidgetView: View {
    var body: some View {
        ZStack {
            Color("WidgetBackground")
            
            VStack(spacing: 8) {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 32))
                    .foregroundColor(Color("AccentColor"))
                
                Text("Neue Notiz")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(Color("PrimaryText"))
                
                Text("Tippen zum Erstellen")
                    .font(.system(size: 10))
                    .foregroundColor(Color("SecondaryText"))
                    .multilineTextAlignment(.center)
            }
            .padding()
        }
        .widgetURL(URL(string: "sorta://create-note"))
    }
}

// Medium Widget - Categories Overview
struct MediumWidgetView: View {
    let categories: [CategoryData]
    
    var body: some View {
        ZStack {
            Color("WidgetBackground")
            
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Kategorien")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(Color("PrimaryText"))
                    Spacer()
                    Image(systemName: "folder.fill")
                        .foregroundColor(Color("AccentColor"))
                }
                
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 8) {
                    ForEach(categories.prefix(6)) { category in
                        CategoryChip(category: category)
                    }
                }
                
                if categories.count > 6 {
                    Text("+\(categories.count - 6) weitere")
                        .font(.system(size: 10))
                        .foregroundColor(Color("SecondaryText"))
                        .frame(maxWidth: .infinity, alignment: .center)
                }
            }
            .padding()
        }
        .widgetURL(URL(string: "sorta://home"))
    }
}

struct CategoryChip: View {
    let category: CategoryData
    
    var body: some View {
        HStack(spacing: 4) {
            Text(category.emoji)
                .font(.system(size: 12))
            
            Text(category.name)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(Color("PrimaryText"))
                .lineLimit(1)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(hex: category.color).opacity(0.2))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color(hex: category.color).opacity(0.3), lineWidth: 1)
        )
    }
}

@main
struct SortaWidget: Widget {
    let kind: String = "SortaWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                SortaWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                SortaWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("Sorta")
        .description("Schneller Zugriff auf deine Notizen und Kategorien")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct SortaWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView()
        case .systemMedium:
            MediumWidgetView(categories: entry.categories)
        default:
            SmallWidgetView()
        }
    }
}

// Helper functions
func loadCategories() -> [CategoryData] {
    // Load categories from shared app group
    if let sharedContainer = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.yourname.sorta"),
       let data = try? Data(contentsOf: sharedContainer.appendingPathComponent("widget-data.json")),
       let widgetData = try? JSONDecoder().decode(WidgetDataModel.self, from: data) {
        return widgetData.categories.map { category in
            CategoryData(id: category.id, name: category.name, emoji: category.emoji, color: category.color)
        }
    }
    return sampleCategories
}

struct WidgetDataModel: Codable {
    let categories: [CategoryModel]
    let lastUpdated: String
}

struct CategoryModel: Codable {
    let id: String
    let name: String
    let emoji: String
    let color: String
}

// Color extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
