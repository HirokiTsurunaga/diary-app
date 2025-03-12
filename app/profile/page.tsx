'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };
    
    getUser();
  }, [router, supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">プロフィール</h1>
      
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h2 className="text-lg font-medium text-gray-700">アカウント情報</h2>
          <p className="mt-2 text-gray-600">メールアドレス: {user?.email}</p>
          <p className="mt-2 text-gray-600">ユーザーID: {user?.id}</p>
          <p className="mt-2 text-gray-600">最終更新: {new Date(user?.updated_at).toLocaleDateString('ja-JP')}</p>
        </div>
        
        <div className="border-b pb-4">
          <h2 className="text-lg font-medium text-gray-700">アカウント設定</h2>
          <p className="mt-2 text-gray-600">
            パスワードの変更やプロフィール情報の更新は、近日実装予定です。
          </p>
        </div>
        
        <div className="pt-4">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
} 