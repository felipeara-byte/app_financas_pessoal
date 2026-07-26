import type { Category, TransactionType } from "@/lib/constants/categories";

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  transaction_date: string;
  type: TransactionType;
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface CategoryRecord {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  color: string;
  created_at: string;
}
