
export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  has_survival_pack: boolean;
  survival_pack_expiry: string | null;
  daily_chat_count: number;
  last_chat_reset: string | null;
}

export interface Agent {
  id: string;
  name: string;
  category: 'VISA' | 'HOUSING';
  specialty: string;
  location: string;
  trust_score: number;
  description: string;
  is_verified: boolean;
  phone?: string;
  line_id?: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

export interface DailyUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
  image_url: string;
  created_at: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  date: string;
  created_at: string;
}

export interface CurrencyRates {
  data: Array<{
    currency: string;
    buy: string;
    sell: string;
  }>;
  epoch: number;
  timestamp: string;
}
