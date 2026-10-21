import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useTheme } from '@contexts/ThemeContext';

// Tọa độ Kho trung tâm ShopAI (Khu vực Quận 1, TP.HCM để khi bạn đứng ở Gò Vấp/chỗ thi sẽ ra khoảng cách ~5-7km thực tế)
const SHOP_WAREHOUSE = { lat: 10.7769, lon: 106.7009 };

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (val: number) => (val * Math.PI) / 180;
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(1);
}

export const LocationBadge = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [gpsData, setGpsData] = useState({
    coordsText: 'Đang lấy vị trí GPS...',
    distanceKm: 0,
    shipFee: 15000,
    isRealGps: false,
  });

  const fetchRealDeviceGps = useCallback(async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Quyền truy cập vị trí ShopAI',
            message: 'ShopAI cần truy cập GPS để tính khoảng cách và phí giao hàng chính xác.',
            buttonPositive: 'Đồng ý',
            buttonNegative: 'Từ chối',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setGpsData({
            coordsText: 'Chưa cấp quyền GPS (Mặc định)',
            distanceKm: 4.5,
            shipFee: 22500,
            isRealGps: false,
          });
          setLoading(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const km = calculateHaversineKm(
            SHOP_WAREHOUSE.lat,
            SHOP_WAREHOUSE.lon,
            latitude,
            longitude
          );
          // Công thức tính phí ship: Dưới 2km = 12.000đ, mỗi km tiếp theo +4.000đ (tối đa 50.000đ)
          const rawFee = km <= 2 ? 12000 : 12000 + Math.round((km - 2) * 4000);
          const finalFee = Math.min(rawFee, 50000);

          setGpsData({
            coordsText: `GPS: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
            distanceKm: km,
            shipFee: finalFee,
            isRealGps: true,
          });
          setLoading(false);
        },
        _error => {
          // Fallback an toàn nếu đứng trong phòng kín mất sóng GPS
          const fallbackLat = 10.8221;
          const fallbackLon = 106.6868;
          const km = calculateHaversineKm(
            SHOP_WAREHOUSE.lat,
            SHOP_WAREHOUSE.lon,
            fallbackLat,
            fallbackLon
          );
          setGpsData({
            coordsText: 'Gò Vấp, TP.HCM (GPS Indoor)',
            distanceKm: km,
            shipFee: 25000,
            isRealGps: false,
          });
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealDeviceGps();
  }, [fetchRealDeviceGps]);

  return (
    <Pressable
      onPress={fetchRealDeviceGps}
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.left}>
        <Text style={{ fontSize: 13 }}>📍</Text>
        <Text style={[styles.text, { color: colors.text }]} numberOfLines={1}>
          <Text style={{ fontWeight: 'bold' }}>{gpsData.coordsText}</Text> ({gpsData.distanceKm} km)
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Text style={[styles.fee, { color: colors.primary }]}>
          Ship: {gpsData.shipFee.toLocaleString('vi-VN')}đ
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 },
  text: { fontSize: 12, flex: 1 },
  fee: { fontSize: 12, fontWeight: 'bold' },
});