'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function NewDiaryPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // ユーザーの認証状態をチェックし、変更を監視
  useEffect(() => {
    const checkUser = async () => {
      try {
        // セッション情報を取得
        const { data: { session } } = await supabase.auth.getSession();
      
        // 未ログインの場合はログインページにリダイレクト
        if (!session) {
          router.push('/auth/login');
          return;
        }
      
        setUser(session.user);

        // 認証状態の変更を監視
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('NewDiary: 認証状態変更イベント', event);
            
            // ログアウト時はホームページにリダイレクト
            if (event === 'SIGNED_OUT' || !session) {
              console.log('NewDiary: 認証状態変更によりホームにリダイレクト');
              router.push('/');
              return;
            }
            
            setUser(session?.user ?? null);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } finally {
        setInitialLoading(false);
      }
    };
    
    checkUser();
  }, [router, supabase.auth]);

  // 日記の保存処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Supabaseにデータを保存
      const { error } = await supabase
        .from('diaries')
        .insert([
          { 
            user_id: user.id, 
            title, 
            content
          }
        ]);
      
      if (error) throw error;
      
      // 保存成功時はホームページに戻る
      router.push('/');
      router.refresh(); // ページキャッシュをリフレッシュ
    } catch (err: any) {
      console.error('日記の保存中にエラーが発生しました:', err.message);
      setError('日記の保存中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // 初期ローディング中
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // ユーザーが認証されていない場合（通常は上のuseEffectでリダイレクトされるが、念のため）
  if (!user) {
    router.push('/auth/login');
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 p-6 sm:p-8">
          <div className="mb-2">
            <Link 
              href="/" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              一覧に戻る
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">新しい日記を書く</h1>
        </div>
        
        {error && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="mb-5">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition"
              placeholder="今日の出来事"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
              内容
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition h-64 resize-none"
              placeholder="ここに日記の内容を書いてください..."
              required
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  保存中...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  保存する
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 