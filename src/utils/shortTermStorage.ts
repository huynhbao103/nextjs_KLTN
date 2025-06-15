// ShortTerm Storage Utility

const SHORT_TERM_KEY = 'shortTermData';
const EXPIRE_DAYS = 7;

export interface ShortTermData {
  [key: string]: any;
  createdAt: number; // timestamp
}

// Lưu dữ liệu ngắn hạn vào localStorage
export function saveShortTermData(data: Omit<ShortTermData, 'createdAt'>) {
  const payload: ShortTermData = {
    ...data,
    createdAt: Date.now(),
  };
  localStorage.setItem(SHORT_TERM_KEY, JSON.stringify(payload));
}

// Lấy dữ liệu ngắn hạn, tự động xóa nếu quá hạn
export function getShortTermData(): ShortTermData | null {
  const raw = localStorage.getItem(SHORT_TERM_KEY);
  if (!raw) return null;
  try {
    const data: ShortTermData = JSON.parse(raw);
    const now = Date.now();
    const expire = data.createdAt + EXPIRE_DAYS * 24 * 60 * 60 * 1000;
    if (now > expire) {
      localStorage.removeItem(SHORT_TERM_KEY);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(SHORT_TERM_KEY);
    return null;
  }
}

// Xóa dữ liệu ngắn hạn
export function clearShortTermData() {
  localStorage.removeItem(SHORT_TERM_KEY);
} 