import React from 'react';
import { SafeAreaView, View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useTheme } from '@contexts/ThemeContext';
import { useCartStore } from '@services/useCartStore';
import { formatCurrency } from '@utils/formatCurrency';

export default function OrdersScreen() {
  const { colors } = useTheme();
  const orders = useCartStore(state => state.orders);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        Lịch sử Đơn hàng ({orders.length})
      </Text>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          const isPaid = item.status === 'PAID';
          return (
            <Pressable
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.rowBetween}>
                <Text style={[styles.orderId, { color: colors.text }]}>{item.id}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: isPaid ? colors.success : colors.secondary },
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <Text style={{ color: colors.textLight, fontSize: 12, marginTop: 4 }}>
                Ngày đặt: {item.createdAt} · {item.items.length} mặt hàng
              </Text>
              <Text style={{ color: colors.textLight, fontSize: 12, marginTop: 2 }}>
                Giao đến: {item.address}
              </Text>

              <View style={[styles.rowBetween, { marginTop: 10 }]}>
                <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 15 }}>
                  {formatCurrency(item.totalAmount)}
                </Text>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                  Xem hóa đơn & Thanh toán →
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textLight }}>
            Chưa có đơn hàng nào. Hãy đặt hàng từ Giỏ hàng!
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', margin: 16, marginTop: 28 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontWeight: 'bold', fontSize: 15 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
});