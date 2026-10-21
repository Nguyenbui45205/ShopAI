import React, { useReducer } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  Vibration,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useTheme } from '@contexts/ThemeContext';
import { useCartStore } from '@services/useCartStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const qtyReducer = (state: number, action: 'ADD' | 'SUB') => {
  if (action === 'ADD') return state + 1;
  if (action === 'SUB') return state > 1 ? state - 1 : 1;
  return state;
};

export default function DetailScreen({ route, navigation }: Props) {
  const { product } = route.params;
  const { colors } = useTheme();
  const [qty, dispatch] = useReducer(qtyReducer, 1);
  const addToCart = useCartStore(state => state.addToCart);

  const handleConfirm = () => {
    Vibration.vibrate(50);
    addToCart(product, qty);
    Alert.alert('Đã thêm vào giỏ', `Đã thêm ${qty} × ${product.name} vào giỏ hàng!`, [
      { text: 'Tiếp tục mua sắm', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.badge, { color: colors.primary }]}>
          {product.categoryName} · Barcode: {product.barcode}
        </Text>
        <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          {product.price.toLocaleString('vi-VN')} đ
        </Text>
        <Text style={[styles.desc, { color: colors.textLight }]}>
          {product.description}
        </Text>

        <View style={styles.qtyRow}>
          <Pressable
            style={[styles.qtyBtn, { borderColor: colors.border }]}
            onPress={() => dispatch('SUB')}
          >
            <Text style={[styles.qtyBtnText, { color: colors.primary }]}>−</Text>
          </Pressable>
          <Text style={[styles.qtyValue, { color: colors.text }]}>{qty}</Text>
          <Pressable
            style={[styles.qtyBtn, { borderColor: colors.border }]}
            onPress={() => dispatch('ADD')}
          >
            <Text style={[styles.qtyBtnText, { color: colors.primary }]}>+</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.buyBtn, { backgroundColor: colors.primary }]}
          onPress={handleConfirm}
        >
          <Text style={styles.buyBtnText}>
            Thêm vào giỏ · {(product.price * qty).toLocaleString('vi-VN')} đ
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: '100%', height: 250 },
  card: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  badge: { fontSize: 12, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', marginTop: 6 },
  price: { fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  desc: { fontSize: 14, lineHeight: 20, marginTop: 12 },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 22, fontWeight: 'bold' },
  qtyValue: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 24 },
  buyBtn: { paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  buyBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
