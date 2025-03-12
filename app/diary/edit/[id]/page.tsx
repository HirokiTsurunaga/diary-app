'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

// Next.js 15ではparamsはPromiseとして渡されるため、型を修正
type ParamsType = Promise<{ id: string }>;

export default function EditDiaryPage({ params }: { params: ParamsType }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diaryId, setDiaryId] = useState<string | null>(null);
  const [authSubscription, setAuthSubscription] = useState<any>(null);

  // 認証状態の変更を監視
  useEffect(() => {
    const setupAuthListener = async () => {
      // 認証状態の変更を監視
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('EditDiary: 認証状態変更イベント', event);
          
          // ログアウト時はホームページにリダイレクト
          if (event === 'SIGNED_OUT' || !session) {
            console.log('EditDiary: 認証状態変更によりホームにリダイレクト');
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
        setDiaryId(id);

        // ユーザー情報を取得
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/login');
          return;
        }
        
        // 日記データを取得
        const { data, error } = await supabase
          .from('diaries')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        // 日記が存在しない場合
        if (!data) {
          setError('日記が見つかりませんでした');
          return;
        }
        
        // ユーザーIDが一致するか確認（自分の日記のみ編集可能）
        if (data.user_id !== session.user.id) {
          router.push('/');
          return;
        }
        
        // フォームにデータをセット
        setTitle(data.title);
        setContent(data.content);
      } catch (error: any) {
        console.error('データの取得中にエラーが発生しました:', error.message);
        setError('日記の読み込み中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiary();
  }, [router, supabase, params]);

  // 日記の更新処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryId) return;

    setSaving(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('diaries')
        .update({ 
          title, 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', diaryId);
      
      if (error) throw error;
      
      router.push(`/diary/${diaryId}`);
    } catch (error: any) {
      console.error('日記の更新中にエラーが発生しました:', error.message);
      setError('日記の保存中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setSaving(false);
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

  // エラー発生時
  if (error && !title && !content) {
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

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">日記を編集</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 mb-2">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="日記のタイトル"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="content" className="block text-gray-700 mb-2">
            内容
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md h-64"
            placeholder="ここに日記の内容を書いてください..."
            required
          />
        </div>
        
        <div className="flex justify-end">
          <Link
            href={diaryId ? `/diary/${diaryId}` : '/'}
            className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </form>
    </div>
  );
} 