'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { formatDate } from '@/utils/date';

// 日記エントリーの型定義
type DiaryEntry = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

// Next.js 15ではparamsはPromiseとして渡されるため、型を修正
type ParamsType = Promise<{ id: string }>;

export default function DiaryDetailPage({ params }: { params: ParamsType }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [diary, setDiary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [authSubscription, setAuthSubscription] = useState<any>(null);

  // 認証状態の変更を監視
  useEffect(() => {
    const setupAuthListener = async () => {
      // 認証状態の変更を監視
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('DiaryDetail: 認証状態変更イベント', event);
          
          // ログアウト時はホームページにリダイレクト
          if (event === 'SIGNED_OUT' || !session) {
            console.log('DiaryDetail: 認証状態変更によりホームにリダイレクト');
            router.push('/');
          }
        }
      );
      
      setAuthSubscription(subscription);
    };
    
    setupAuthListener();
    
    // クリーンアップ関数
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [router, supabase.auth]);

  // 日記データを取得
  useEffect(() => {
    const fetchDiary = async () => {
      try {
        // Next.js 15ではparamsはPromiseなので、awaitで解決する
        const { id } = await params;
        
        // ユーザー情報を取得
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        // 日記データを取得
        const { data, error } = await supabase
          .from('diaries')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          setError('日記が見つかりませんでした');
          return;
        }
        
        setDiary(data);
      } catch (error: any) {
        console.error('データの取得中にエラーが発生しました:', error.message);
        setError('日記の読み込み中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiary();
  }, [supabase, params]);

  // 日記を削除
  const handleDelete = async () => {
    if (!window.confirm('本当にこの日記を削除しますか？')) {
      return;
    }
    
    setDeleting(true);
    
    try {
      const { error } = await supabase
        .from('diaries')
        .delete()
        .eq('id', diary.id);
      
      if (error) throw error;
      
      router.push('/');
    } catch (error: any) {
      console.error('日記の削除中にエラーが発生しました:', error.message);
      alert('削除中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setDeleting(false);
    }
  };

  // ローディング中
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // エラー表示
  if (error) {
    return (
      <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
        <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
          {error}
        </div>
        <Link href="/" className="text-indigo-600 hover:text-indigo-800">
          ← ホームに戻る
        </Link>
      </div>
    );
  }

  // 日記の表示
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* ヘッダー部分 */}
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{diary.title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(diary.created_at)}</span>
            </div>
            {diary.created_at !== diary.updated_at && (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>更新: {formatDate(diary.updated_at)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* コンテンツ部分 */}
        <div className="p-6 sm:p-8 prose max-w-none text-gray-700 whitespace-pre-wrap">
          {diary.content}
        </div>
        
        {/* フッター部分 */}
        {user && user.id === diary.user_id && (
          <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Link
              href={`/diary/edit/${diary.id}`}
              className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              編集する
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition font-medium text-sm disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {deleting ? '削除中...' : '削除する'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 