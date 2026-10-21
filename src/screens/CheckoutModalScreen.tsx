import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, StyleSheet, Vibration } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useTheme } from '@contexts/ThemeContext';
import { useCartStore } from '@services/useCartStore';
import { formatCurrency } from '@utils/formatCurrency';
import ShopButton from '@components/ShopButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutModalScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { items, distanceKm, getTotalPrice, createOrderPending } = useCartStore();
  const [address, setAddress] = useState('12 Nguyễn Văn Bảo, P.4, Quận Gò Vấp, TP.HCM');
  const [loading, setLoading] = useState(false);

  const subTotal = getTotalPrice();
  const shippingFee = Math.round(distanceKm * 5000);
  const total = subTotal + shippingFee;

  const handleConfirmOrder = () => {
    if (items.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      Vibration.vibrate(60);
      const newOrder = createOrderPending(address, shippingFee);
      setLoading(false);
      navigation.replace('OrderDetail', { orderId: newOrder.id });
    }, 500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Xác nhận Đặt hàng (POST /api/orders)
        </Text>
        <Text style={[styles.label, { color: colors.textLight }]}>Địa chỉ nhận hàng:</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        />

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
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>{formatCurrency(shippingFee)}</Text>
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
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  note: { fontSize: 12, marginTop: 8, fontStyle: 'italic' },
});