import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { useGpsStore } from '../store/useGpsStore';

export const LocationBadge = () => {
  const { colors } = useTheme();
  const { coordsText, distanceKm, shipFee, loading, fetchRealDeviceGps } = useGpsStore();

  useEffect(() => { fetchRealDeviceGps(); }, [fetchRealDeviceGps]);

  return (
    <Pressable onPress={fetchRealDeviceGps} style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.left}>
        <Text style={{ fontSize: 13 }}>📍</Text>
        <Text style={[styles.text, { color: colors.text }]} numberOfLines={1}>
          <Text style={{ fontWeight: 'bold' }}>{coordsText}</Text> ({distanceKm} km)
        </Text>
      </View>
      {loading ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={[styles.fee, { color: colors.primary }]}>Ship: {shipFee.toLocaleString('vi-VN')}đ</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 },
  text: { fontSize: 12, flex: 1 },
  fee: { fontSize: 12, fontWeight: 'bold' },
});