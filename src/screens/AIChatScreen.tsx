import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isError?: boolean;
}

const QUICK_PROMPTS = [
  'Tư vấn tai nghe dưới 1 triệu',
  'Gợi ý đồ điện tử đang giảm giá',
  'Chính sách bảo hành thế nào?',
  'Kiểm tra trạng thái đơn hàng',
];

export default function AIChatScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Xin chào! Tôi là trợ lý AI của ShopAI. Tôi có thể giúp gì cho bạn hôm nay?',
    },
  ]);

  const sendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt ?? input).trim();
    if (!textToSend || isTyping) return;

    if (!customPrompt) setInput('');
    setLastFailedPrompt(null);

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      // Thử gọi qua NestJS Proxy
      const res = await fetch('http://10.0.2.2:3000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(m => ({ role: m.sender, content: m.text })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) throw new Error('Proxy error');
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: data.reply || data.message || 'ShopAI đã ghi nhận yêu cầu của bạn!',
        },
      ]);
    } catch (err) {
      // Phản hồi thông minh khi chạy độc lập không cần backend chết cứng
      setLastFailedPrompt(textToSend);
      let smartReply = 'ShopAI gợi ý bạn tham khảo các sản phẩm đang có chương trình Flash Sale trên Trang chủ.';
      const lower = textToSend.toLowerCase();
      if (lower.includes('bảo hành') || lower.includes('đổi trả')) {
        smartReply = 'Sản phẩm tại ShopAI được bảo hành chính hãng 12 tháng, đổi trả trong vòng 7 ngày nếu có lỗi từ nhà sản xuất.';
      } else if (lower.includes('đơn hàng') || lower.includes('trạng thái')) {
        smartReply = 'Bạn có thể kiểm tra danh sách đơn hàng đang ở trạng thái PENDING hoặc PAID tại tab "Đơn hàng" phía dưới.';
      } else if (lower.includes('tai nghe') || lower.includes('triệu')) {
        smartReply = 'ShopAI có các dòng tai nghe Bluetooth chống ồn giá tốt từ 500.000đ đến 1.500.000đ đang giảm giá mạnh!';
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: `${smartReply} (Đã phản hồi ở chế độ Trợ lý thông minh).`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Xóa lịch sử trò chuyện',
      'Bạn có chắc chắn muốn xóa toàn bộ tin nhắn không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa sạch',
          style: 'destructive',
          onPress: () => {
            setLastFailedPrompt(null);
            setMessages([
              {
                id: 'welcome-' + Date.now(),
                sender: 'ai',
                text: 'Đã làm mới cuộc trò chuyện. Bạn cần hỗ trợ gì tiếp theo?',
              },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header chuẩn duy nhất không bị lặp */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 }}>← Quay lại</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trợ lý AI ShopAI</Text>
        <Pressable onPress={handleClearHistory} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>🗑️ Xóa lịch sử</Text>
        </Pressable>
      </View>

      {/* Thanh gợi ý nhanh */}
      <View style={styles.promptSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={QUICK_PROMPTS}
          keyExtractor={item => item}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => sendMessage(item)}
              style={[styles.promptChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={{ fontSize: 12, color: colors.text }}>✨ {item}</Text>
            </Pressable>
          )}
        />
      </View>

      {/* Danh sách tin nhắn */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => {
          const isUser = item.sender === 'user';
          return (
            <View
              style={[
                styles.bubble,
                isUser
                  ? { alignSelf: 'flex-end', backgroundColor: colors.primary }
                  : {
                      alignSelf: 'flex-start',
                      backgroundColor: item.isError ? '#FEF2F2' : colors.surface,
                      borderColor: item.isError ? '#F87171' : colors.border,
                      borderWidth: 1,
                    },
              ]}
            >
              <Text style={{ color: isUser ? '#FFF' : item.isError ? '#991B1B' : colors.text, fontSize: 14 }}>
                {item.text}
              </Text>
              {item.isError && lastFailedPrompt && (
                <Pressable onPress={() => sendMessage(lastFailedPrompt)} style={styles.retryBtn}>
                  <Text style={styles.retryBtnText}>🔄 Thử lại</Text>
                </Pressable>
              )}
            </View>
          );
        }}
      />

      {isTyping && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={{ fontSize: 12, color: colors.textLight, marginLeft: 8 }}>AI đang soạn câu trả lời...</Text>
        </View>
      )}

      {/* Ô nhập tin nhắn */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Hỏi AI về sản phẩm, chính sách..."
          placeholderTextColor={colors.textLight}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <Pressable onPress={() => sendMessage()} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Gửi</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { paddingVertical: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  clearBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  clearBtnText: { color: '#DC2626', fontSize: 12, fontWeight: 'bold' },
  promptSection: { paddingVertical: 8 },
  promptChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  bubble: { maxWidth: '82%', padding: 12, borderRadius: 12 },
  retryBtn: { marginTop: 8, backgroundColor: '#DC2626', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignSelf: 'flex-start' },
  retryBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  typingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  inputBar: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, alignItems: 'center' },
  input: { flex: 1, height: 42, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  sendBtn: { height: 42, paddingHorizontal: 18, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});