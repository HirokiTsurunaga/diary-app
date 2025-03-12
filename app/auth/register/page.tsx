import { redirect } from 'next/navigation';

export default function RegisterPage() {
  // Supabase Auth UIでは一つのページで登録とログインを扱うため、
  // ログインページにリダイレクトします
  redirect('/auth/login');
} 