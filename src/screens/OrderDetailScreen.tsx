import React from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, Alert, Vibration } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useTheme } from '@contexts/ThemeContext';
import { useCartStore } from '@services/useCartStore';
import { formatCurrency } from '@utils/formatCurrency';
import ShopButton from '@components/ShopButton';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const { colors } = useTheme();
  const orders = useCartStore(state => state.orders);
  const payOrder = useCartStore(state => state.payOrder);

  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, margin: 20 }}>Không tìm thấy đơn hàng {orderId}</Text>
      </SafeAreaView>
    );
  }

  const isPaid = order.status === 'PAID';

  const handlePayNow = () => {
    Vibration.vibrate(80);
    payOrder(order.id);
    Alert.alert(
      'Thanh toán thành công (PAID) 🎉',
      `Hóa đơn ${order.id} đã chuyển từ PENDING sang PAID!`
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.title, { color: colors.text }]}>Hóa đơn: {order.id}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: isPaid ? colors.success : colors.secondary },
            ]}
          >
            <Text style={styles.badgeText}>{order.status}</Text>
          </View>
        </View>

        <Text style={{ color: colors.textLight, fontSize: 12, marginTop: 6 }}>
          Thời gian: {order.createdAt}
        </Text>
        <Text style={{ color: colors.textLight, fontSize: 12, marginTop: 2 }}>
          Địa chỉ: {order.address}
        </Text>

        <Text style={[styles.subHeader, { color: colors.text }]}>Chi tiết sản phẩm:</Text>
        <FlatList
          data={order.items}
          keyExtractor={i => String(i.product.id)}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={{ color: colors.text, flex: 1 }}>
                {item.quantity}x {item.product.name}
              </Text>
              <Text style={{ color: colors.text, fontWeight: '600' }}>
                {formatCurrency(item.product.price * item.quantity)}
              </Text>
            </View>
          )}
        />

        <View style={[styles.divider, { borderColor: colors.border }]} />
        <View style={styles.rowBetween}>
          <Text style={{ color: colors.textLight }}>Phí vận chuyển GPS:</Text>
          <Text style={{ color: colors.text }}>{formatCurrency(order.shippingFee)}</Text>
        </View>
        <View style={[styles.rowBetween, { marginTop: 6 }]}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>
            Tổng cộng:
          </Text>
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold' }}>
            {formatCurrency(order.totalAmount)}
          </Text>
        </View>

        {!isPaid ? (
          <ShopButton
            title="💳 Thanh toán ngay (Chuyển sang PAID)"
            onPress={handlePayNow}
            style={{ marginTop: 18 }}
          />
        ) : (
          <View style={[styles.paidBanner, { backgroundColor: '#DCFCE7' }]}>
            <Text style={{ color: colors.success, fontWeight: 'bold' }}>
              ✅ Hóa đơn này đã được thanh toán (PAID)
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 18, borderRadius: 16, borderWidth: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: 'bold' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  subHeader: { fontWeight: 'bold', marginTop: 16, marginBottom: 8, fontSize: 14 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  divider: { borderTopWidth: 1, marginVertical: 12 },
  paidBanner: { marginTop: 16, padding: 12, borderRadius: 10, alignItems: 'center' },
});