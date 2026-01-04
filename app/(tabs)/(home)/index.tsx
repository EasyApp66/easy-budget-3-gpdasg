
import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

export default function HomeScreen() {
  const categories = [
    { name: 'JHZFJH', amount: null, active: true },
    { name: 'KEJNEND', amount: null, active: false },
    { name: 'ESSEN', amount: 250, active: true },
    { name: 'MIETE', amount: 2005, active: false },
    { name: 'PARKPLATZ', amount: 150, active: false },
    { name: 'KLEIDER', amount: 120, active: false },
  ];

  const handleCategoryPress = (category: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('Category pressed:', category);
  };

  const handleDeletePress = (category: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('Delete category:', category);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.cashCard}>
            <Text style={styles.cashLabel}>CASH</Text>
            <Text style={styles.cashValue}>93&apos;838</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>TOTAL</Text>
              <Text style={styles.summaryValue}>2&apos;525</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>BLEIBT</Text>
              <Text style={[styles.summaryValue, styles.summaryValueGreen]}>
                91&apos;313
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.addButtonContainer}>
          <Pressable
            style={styles.addCategoryButton}
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              console.log('Add category');
            }}
          >
            <IconSymbol
              ios_icon_name="plus"
              android_material_icon_name="add"
              size={24}
              color={colors.black}
            />
          </Pressable>
        </View>

        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <Pressable
              key={index}
              style={[
                styles.categoryCard,
                category.active && styles.categoryCardActive,
              ]}
              onPress={() => handleCategoryPress(category.name)}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Pressable
                  onPress={() => handleDeletePress(category.name)}
                  hitSlop={8}
                >
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={20}
                    color={colors.red}
                  />
                </Pressable>
              </View>
              {category.amount !== null && (
                <Text style={styles.categoryAmount}>
                  {category.amount.toLocaleString('de-CH')}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  header: {
    gap: 16,
    marginBottom: 24,
  },
  cashCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
  },
  cashLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
    letterSpacing: 1,
  },
  cashValue: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  summaryCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  summaryValueGreen: {
    color: colors.neonGreen,
  },
  addButtonContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addCategoryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 16,
    width: '47%',
    minHeight: 120,
  },
  categoryCardActive: {
    borderWidth: 2,
    borderColor: colors.neonGreen,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
    flex: 1,
  },
  categoryAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
    marginTop: 'auto',
  },
});
