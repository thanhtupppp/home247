import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const ServicesList: React.FC = () => {
  const navigation = useNavigation<any>();
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    'Khác': true,
    'nơ trang long': false,
  });

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconContainer}>
            <MaterialIcons name="dashboard" size={20} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Dịch vụ</Text>
            <Text style={styles.headerSubtitle}>Quản lý các loại dịch vụ</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Accordion Group 1: Khác */}
        <View style={[styles.accordionCard, expandedGroups['Khác'] && styles.accordionCardExpanded]}>
          <Pressable onPress={() => toggleGroup('Khác')} style={styles.accordionHeader}>
            <View style={styles.accordionHeaderLeft}>
              <View style={styles.buildingIconContainer}>
                <MaterialIcons name="apartment" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={groupNameStyle(expandedGroups['Khác'])}>Khác</Text>
                <Text style={styles.groupSubtitle}>2 dịch vụ</Text>
              </View>
            </View>
            <MaterialIcons 
              name={expandedGroups['Khác'] ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color={expandedGroups['Khác'] ? theme.colors.primary : "#a1a1aa"} 
              style={styles.chevron}
            />
          </Pressable>

          {expandedGroups['Khác'] && (
            <View style={styles.accordionContent}>
              {/* Category 1: Cố định */}
              <View style={styles.categoryHeader}>
                <View style={styles.categoryHeaderLeft}>
                  <MaterialIcons name="lock" size={16} color="#10b981" />
                  <Text style={[styles.categoryTitle, { color: '#10b981' }]}>Cố định</Text>
                </View>
                <Text style={styles.categoryCount}>1</Text>
              </View>

              <Pressable style={styles.serviceItemCard}>
                <View style={styles.serviceItemLeft}>
                  <Text style={styles.serviceName}>Internet</Text>
                  <Text style={styles.servicePrice}>90 đ</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
              </Pressable>

              {/* Category 2: Theo người */}
              <View style={[styles.categoryHeader, { marginTop: 16 }]}>
                <View style={styles.categoryHeaderLeft}>
                  <MaterialIcons name="group" size={16} color="#f59e0b" />
                  <Text style={[styles.categoryTitle, { color: '#f59e0b' }]}>Theo người</Text>
                </View>
                <Text style={styles.categoryCount}>1</Text>
              </View>

              <Pressable style={styles.serviceItemCard}>
                <View style={styles.serviceItemLeft}>
                  <Text style={styles.serviceName}>Gửi xe</Text>
                  <Text style={styles.servicePrice}>0 đ/unit</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
              </Pressable>
            </View>
          )}
        </View>

        {/* Accordion Group 2: nơ trang long */}
        <View style={[styles.accordionCard, expandedGroups['nơ trang long'] && styles.accordionCardExpanded]}>
          <Pressable onPress={() => toggleGroup('nơ trang long')} style={styles.accordionHeader}>
            <View style={styles.accordionHeaderLeft}>
              <View style={styles.buildingIconContainer}>
                <MaterialIcons name="apartment" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={groupNameStyle(expandedGroups['nơ trang long'])}>nơ trang long</Text>
                <Text style={styles.groupSubtitle}>1 dịch vụ</Text>
              </View>
            </View>
            <MaterialIcons 
              name={expandedGroups['nơ trang long'] ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color={expandedGroups['nơ trang long'] ? theme.colors.primary : "#a1a1aa"} 
              style={styles.chevron}
            />
          </Pressable>

          {expandedGroups['nơ trang long'] && (
            <View style={styles.accordionContent}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryHeaderLeft}>
                  <MaterialIcons name="lock" size={16} color="#10b981" />
                  <Text style={[styles.categoryTitle, { color: '#10b981' }]}>Cố định</Text>
                </View>
                <Text style={styles.categoryCount}>1</Text>
              </View>

              <Pressable style={styles.serviceItemCard}>
                <View style={styles.serviceItemLeft}>
                  <Text style={styles.serviceName}>Rác & Vệ sinh</Text>
                  <Text style={styles.servicePrice}>50.000 đ</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action style button on the bottom right */}
      <View style={styles.bottomContainer}>
        <Pressable 
          style={styles.addServiceButton}
          onPress={() => navigation.navigate('cau-hinh-gia/them')}
        >
          <MaterialIcons name="add" size={22} color={theme.colors.onPrimary} />
          <Text style={styles.addServiceButtonText}>Thêm dịch vụ</Text>
        </Pressable>
      </View>
    </View>
  );
};

const groupNameStyle = (isExpanded: boolean) => {
  return [
    styles.groupName,
    isExpanded && { color: theme.colors.primary }
  ];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.lg + 16,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: 16,
    paddingBottom: 100,
  },
  accordionCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  accordionCardExpanded: {
    borderColor: '#bce0fd',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buildingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  groupSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  chevron: {
    padding: 4,
  },
  accordionContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  categoryCount: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  serviceItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    marginBottom: 10,
  },
  serviceItemLeft: {
    gap: 4,
  },
  serviceName: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  servicePrice: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#93c5fd', // Light blue background in screenshot
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    boxShadow: [{
      offsetX: 0,
      offsetY: 4,
      blurRadius: 10,
      color: 'rgba(0, 0, 0, 0.15)'
    }],
  },
  addServiceButtonText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default ServicesList;
