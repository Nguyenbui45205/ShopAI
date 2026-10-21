import { formatCurrency } from '../src/utils/formatCurrency';

describe('ShopAI Quality Gate Tests (Chương 11)', () => {
  test('formatCurrency formats VND accurately', () => {
    expect(formatCurrency(890000)).toContain('890');
    expect(formatCurrency(0)).toBe('0 đ');
    expect(formatCurrency(-500)).toBe('0 đ');
  });
});