import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, StyleSheet, Vibration, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useTheme } from '@contexts/ThemeContext';
import { useCartStore } from '@services/useCartStore';
import { useGpsStore } from '../store/useGpsStore'; 
import { formatCurrency } from '@utils/formatCurrency';
import ShopButton from '@components/ShopButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutModalScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { items, getTotalPrice, createOrderPending } = useCartStore();
  
  const { distanceKm, shipFee, location } = useGpsStore(); 

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);

  const subTotal = getTotalPrice();
  const total = subTotal + shipFee; 

  useEffect(() => {
    const fetchAddress = async () => {
      if (!location || !location.latitude) {
        setAddress('12 Nguyễn Văn Bảo, P.4, Quận Gò Vấp, TP.HCM');
        setIsFetchingLocation(false);
        return;
      }

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`);
        const data = await res.json();
        
        if (data && data.display_name) {
          setAddress(data.display_name); 
        } else {
          setAddress(`Tọa độ GPS: ${location.latitude}, ${location.longitude}`);
        }
      } catch (error) {
        setAddress(`Tọa độ GPS: ${location.latitude}, ${location.longitude}`);
      } finally {
        setIsFetchingLocation(false);
      }
    };

    fetchAddress();
  }, [location]);

  const handleConfirmOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      const response = await fetch('http://10.0.2.2:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Bùi Công Nguyên',
          studentId: '23672641',
          address: address, 
          items: items,
          shippingFee: shipFee,
          totalAmount: total,
          status: 'PENDING'
        }),
      });

      const data = await response.json();

      if (data.success) {
        Vibration.vibrate(60);
        const newOrder = createOrderPending(address, shipFee);
        navigation.replace('OrderDetail', { orderId: newOrder.id });
      } else {
        Alert.alert('Lỗi server', 'Không thể lưu đơn hàng vào hệ thống.');
      }
    } catch (error) {
      Alert.alert('Lỗi kết nối', 'Không tìm thấy backend server. Hãy chắc chắn bạn đã chạy lệnh adb reverse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Xác nhận Đặt hàng
        </Text>
        <Text style={[styles.label, { color: colors.textLight }]}>Địa chỉ nhận hàng (Tự động từ GPS):</Text>

        {isFetchingLocation ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: 16, alignSelf: 'flex-start' }} />
        ) : (
          <TextInput
            value={address}
            onChangeText={setAddress}
            multiline
            style={[styles.input, { borderColor: colors.border, color: colors.text, height: 60 }]}
          />
        )}

        <View style={styles.row}>
          <Text style={{ color: colors.textLight }}>Số mặt hàng:</Text>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>{items.length} món</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ color: colors.textLight }}>Tạm tính:</Text>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>{formatCurrency(subTotal)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ color: colors.textLight }}>Phí ship GPS ({distanceKm} km):</Text>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>{formatCurrency(shipFee)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>Tổng thanh toán:</Text>
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold' }}>
            {formatCurrency(total)}
          </Text>
        </View>

        <Text style={[styles.note, { color: colors.textLight }]}>
          * Đơn hàng mới tạo sẽ ở trạng thái PENDING và giỏ hàng sẽ được làm trống.
        </Text>

        <ShopButton
          title="Tạo đơn hàng (PENDING)"
          onPress={handleConfirmOrder}
          loading={loading}
          style={{ marginTop: 14 }}
        />
        <ShopButton
          title="Đóng"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 10 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  card: { padding: 20, borderRadius: 16, borderWidth: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  label: { fontSize: 13, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  note: { fontSize: 12, marginTop: 8, fontStyle: 'italic' },
});