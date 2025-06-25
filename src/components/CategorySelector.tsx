import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native"
import type { Category } from "../types"

interface CategorySelectorProps {
  categories: Category[]
  selectedCategories: string[]
  onToggleCategory: (categoryId: string) => void
}

export default function CategorySelector({ categories, selectedCategories, onToggleCategory }: CategorySelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kategorien</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id)
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                isSelected && { backgroundColor: category.color + "20", borderColor: category.color },
              ]}
              onPress={() => onToggleCategory(category.id)}
            >
              <Text style={styles.emoji}>{category.emoji}</Text>
              <Text style={[styles.categoryText, isSelected && { color: category.color, fontWeight: "600" }]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginRight: 8,
  },
  emoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: "#6B7280",
  },
})
