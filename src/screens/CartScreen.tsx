import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
  Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useTheme } from '@contexts/ThemeContext';
import { useCartStore } from '@services/useCartStore';
import { formatCurrency } from '@utils/formatCurrency';
import ShopButton from '@components/ShopButton';

const WAREHOUSE_COORDS = { lat: 10.8221, lon: 106.6868 };

const calcDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function CartScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items, distanceKm, setDistanceKm, updateQty, getTotalPrice } = useCartStore();

  const handleLocateGPS = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Từ chối quyền', 'Cần cấp quyền GPS để cập nhật khoảng cách.');
          return;
        }
      }
      Vibration.vibrate(40);
      const userCoords = { lat: 10.7769, lon: 106.7009 };
      const dist = calcDistanceKm(
        WAREHOUSE_COORDS.lat,
        WAREHOUSE_COORDS.lon,
        userCoords.lat,
        userCoords.lon
      );
      setDistanceKm(Number(dist.toFixed(1)));
    } catch {
      Alert.alert('Lỗi định vị', 'Không thể lấy tọa độ GPS.');
    }
  };

  const shippingFee = Math.round(distanceKm * 5000);
  const subTotal = getTotalPrice();
  const finalTotal = subTotal + shippingFee;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Giỏ hàng ({items.length} sản phẩm)
      </Text>

      <FlatList
        data={items}
        keyExtractor={item => String(item.product.id)}
        renderItem={({ item }) => (
          <View
            style={[
              styles.itemRow,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {item.product.name}
              </Text>
              <Text style={{ color: colors.primary, fontWeight: 'bold', marginTop: 4 }}>
                {formatCurrency(item.product.price * item.quantity)}
              </Text>
            </View>
            <View style={styles.qtyControl}>
              <Pressable
                style={[styles.qtySmallBtn, { borderColor: colors.border }]}
                onPress={() => updateQty(item.product.id, -1)}
              >
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>−</Text>
              </Pressable>
              <Text style={[styles.qtyNum, { color: colors.text }]}>{item.quantity}</Text>
              <Pressable
                style={[styles.qtySmallBtn, { borderColor: colors.border }]}
                onPress={() => updateQty(item.product.id, 1)}
              >
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>+</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textLight }]}>
            Giỏ hàng trống. Hãy thêm sản phẩm từ Trang chủ!
          </Text>
        }
      />

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Pressable
          style={[styles.gpsBtn, { borderColor: colors.primary }]}
          onPress={handleLocateGPS}
        >
          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 13 }}>
            📍 Khoảng cách GPS: {distanceKm} km (Bấm để cập nhật lại)
          </Text>
        </Pressable>

        <View style={styles.summaryRow}>
          <Text style={{ color: colors.textLight }}>Tạm tính:</Text>
          <Text style={{ color: colors.text, fontWeight: '600' }}>
            {formatCurrency(subTotal)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{ color: colors.textLight }}>Phí giao hàng (5.000đ/km):</Text>
          <Text style={{ color: colors.text, fontWeight: '600' }}>
            {formatCurrency(shippingFee)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Tổng cộng:</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            {formatCurrency(finalTotal)}
          </Text>
        </View>

        <ShopButton
          title="Tiến hành Checkout (Tạo đơn PENDING)"
          disabled={items.length === 0}
          onPress={() => navigation.navigate('Checkout')}
          style={{ marginTop: 12 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', margin: 16, marginTop: 28 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemName: { fontSize: 14, fontWeight: 'bold' },
  qtyControl: { flexDirection: 'row', alignItems: 'center' },
  qtySmallBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyNum: { marginHorizontal: 12, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 13, paddingHorizontal: 24 },
  footer: { padding: 16, borderTopWidth: 1 },
  gpsBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold' },
});