import { LocationBadge } from '../components/LocationBadge';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Vibration,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@contexts/ThemeContext';
import { useCountdown } from '@hooks/useCountdown';
import { CategoryId, Product, fetchProductsApi } from '@services/api';
import { useCartStore } from '@services/useCartStore';
import { useReduxDemo } from '../store/redux/counterSlice';
import { formatCurrency } from '@utils/formatCurrency';
import { RootStackParamList } from '@navigation/RootNavigator';

const CATEGORIES: { id: CategoryId; name: string }[] = [
  { id: 'all', name: 'Tất cả' },
  { id: 'electronics', name: 'Điện tử' },
  { id: 'fashion', name: 'Thời trang' },
  { id: 'home', name: 'Gia dụng' },
];

export default function HomeScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state: rtkState, dispatch: rtkDispatch } = useReduxDemo();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

  const timeLeft = useCountdown(3600);
  
  // Đã xóa distanceKm ở đây vì không còn dùng đến nữa
  const {
    user,
    addToCart,
    scannedBarcode,
    setScannedBarcode,
    setAppLocked,
    logout,
  } = useCartStore();

  useEffect(() => {
    if (scannedBarcode) {
      setSearch(scannedBarcode);
      setScannedBarcode('');
    }
  }, [scannedBarcode, setScannedBarcode]);

  const loadData = useCallback(async (errMode: 'none' | 'network' | 'zod' = 'none') => {
    setStatus('loading');
    try {
      const data = await fetchProductsApi(errMode);
      setProducts(data);
      setStatus('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi không xác định');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadData('none');
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchProductsApi('none');
      setProducts(data);
      setStatus('success');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(item => {
      const q = search.trim().toLowerCase();
      const matchQuery =
        item.name.toLowerCase().includes(q) || item.barcode.toLowerCase().includes(q);
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      return matchQuery && matchCat;
    });
  }, [products, search, selectedCategory]);

  const handleQuickAdd = (product: Product) => {
    Vibration.vibrate(40);
    addToCart(product, 1);
  };

  if (status === 'loading') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.stateText, { color: colors.text }]}>
            Đang tải dữ liệu ShopAI…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerBox}>
          <Text style={[styles.errorTitle, { color: colors.error }]}>
            {errorMessage.includes('ZOD') ? '⚠️ Lỗi Schema Dữ Liệu (Zod)' : '🌐 Lỗi Kết Nối Mạng'}
          </Text>
          <Text style={[styles.errorSub, { color: colors.textLight }]}>
            {errorMessage}
          </Text>
          <Pressable
            style={[styles.retryBtn, { backgroundColor: colors.error }]}
            onPress={() => loadData('none')}
          >
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredProducts}
        keyExtractor={item => `shopai-${item.id}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            <View
              style={[
                styles.header,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.logo, { color: colors.primary }]}>ShopAI</Text>
                <Text style={[styles.slogan, { color: colors.textLight }]}>
                  Xin chào, {user?.name || 'Khách'}
                </Text>
                
                {/* Đã xóa đoạn text GPS cũ ở đây */}
                
                <View style={styles.flashRow}>
                  <Text style={[styles.flashLabel, { color: colors.secondary }]}>
                    ⚡ Flash Sale
                  </Text>
                  <Text style={[styles.timer, { color: colors.text }]}>{timeLeft}</Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Pressable
                    style={[styles.actionBtn, { borderColor: colors.primary }]}
                    onPress={toggleTheme}
                  >
                    <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 11 }}>
                      {isDark ? '☀️ Sáng' : '🌙 Tối'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, { borderColor: colors.primary }]}
                    onPress={() => setAppLocked(true)}
                  >
                    <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 11 }}>
                      🔒 Khóa App
                    </Text>
                  </Pressable>
                </View>

                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                  <Pressable
                    style={[styles.actionBtn, { borderColor: colors.error }]}
                    onPress={() => loadData('network')}
                  >
                    <Text style={{ color: colors.error, fontWeight: '600', fontSize: 10 }}>
                      Lỗi Mạng
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, { borderColor: colors.error }]}
                    onPress={() => loadData('zod')}
                  >
                    <Text style={{ color: colors.error, fontWeight: '600', fontSize: 10 }}>
                      Lỗi Zod
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, { borderColor: colors.textLight }]}
                    onPress={logout}
                  >
                    <Text style={{ color: colors.textLight, fontWeight: '600', fontSize: 10 }}>
                      Thoát
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <LocationBadge />
            
            <View style={styles.searchRow}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Tìm tên hoặc mã vạch (8930001)..."
                placeholderTextColor={colors.textLight}
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
              />
              <Pressable
                style={[styles.scanBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Scanner')}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Quét mã</Text></Pressable>
              <Pressable
                style={[styles.scanBtn, { backgroundColor: '#7C3AED' }]}
                onPress={() => navigation.navigate('AIChat')}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Chat</Text></Pressable>
            </View>

            <View style={styles.bannerBox}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=80' }}
                style={styles.bannerImg}
              />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>ShopAI</Text>
                <Text style={styles.bannerSub}>Mua sắm thông minh · Ưu đãi mỗi ngày</Text>
              </View>
            </View>

            <View style={styles.chipRow}>
              {CATEGORIES.map(cat => {
                const active = selectedCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.primary : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? '#FFF' : colors.text,
                        fontWeight: active ? 'bold' : 'normal',
                        fontSize: 12,
                      }}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View
              style={[
                styles.rtkBar,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={{ fontSize: 11, color: colors.textLight }}>
                RTK Demo (src/store/redux): Điểm thưởng = {rtkState.value}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable onPress={() => rtkDispatch({ type: 'increment' })}>
                  <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 }}>
                    + Cộng
                  </Text>
                </Pressable>
                <Pressable onPress={() => rtkDispatch({ type: 'reset' })}>
                  <Text style={{ color: colors.textLight, fontSize: 12 }}>Reset</Text>
                </Pressable>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Danh sách sản phẩm ({filteredProducts.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => navigation.navigate('Detail', { product: item })}
          >
            <Image source={{ uri: item.image }} style={styles.cardImg} />
            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.cardPrice, { color: colors.primary }]}>
                {formatCurrency(item.price)}
              </Text>
              <Text style={[styles.cardMeta, { color: colors.textLight }]}>
                {item.categoryName} · Mã: {item.barcode}
              </Text>
            </View>
            <Pressable
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={() => handleQuickAdd(item)}
            >
              <Text style={styles.addBtnText}>+ Giỏ</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  stateText: { marginTop: 12, fontSize: 14, fontWeight: '600' },
  errorTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  errorSub: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryBtnText: { color: '#FFF', fontWeight: 'bold' },
  header: {
    paddingHorizontal: 14,
    paddingTop: 26,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  logo: { fontSize: 22, fontWeight: 'bold' },
  slogan: { fontSize: 12, marginTop: 2 },
  locationBadge: { marginTop: 4 }, // Giữ nguyên class này phòng trường hợp bạn cần sau này
  flashRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  flashLabel: { fontWeight: 'bold', fontSize: 12 },
  timer: { marginLeft: 6, fontWeight: 'bold', fontSize: 12 },
  headerActions: { alignItems: 'flex-end' },
  actionBtn: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 },
  searchRow: { flexDirection: 'row', marginHorizontal: 12, marginTop: 10, gap: 6 },
  searchInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  scanBtn: {
    paddingHorizontal: 11,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  bannerBox: {
    marginHorizontal: 12,
    marginTop: 10,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImg: { width: '100%', height: '100%' },
  bannerOverlay: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bannerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  bannerSub: { color: '#FFF', fontSize: 11, marginTop: 2 },
  chipRow: { flexDirection: 'row', marginHorizontal: 12, marginTop: 10, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  rtkBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  sectionTitle: {
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardImg: { width: 62, height: 62, borderRadius: 8 },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardName: { fontSize: 14, fontWeight: 'bold' },
  cardPrice: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  cardMeta: { fontSize: 11, marginTop: 3 },
  addBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
});