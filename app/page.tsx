'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// 日記エントリーの型定義
type DiaryEntry = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
};

export default function HomePage() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>(''); // デバッグ情報用
  const supabase = createClientComponentClient();

  // ユーザー認証状態と日記データを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("ホームページのfetchData実行開始");
        setDebugInfo('データ取得中...');
        
        // ユーザー認証状態を取得
        const { data: { session } } = await supabase.auth.getSession();
        console.log("認証セッション取得結果:", session ? "ログイン中" : "未ログイン");
        setDebugInfo(prev => prev + `\n認証状態: ${session ? "ログイン中" : "未ログイン"}`);
        
        setUser(session?.user ?? null);

        // ユーザーがログインしている場合のみ日記を取得
        if (session?.user) {
          console.log("ユーザーID:", session.user.id);
          setDebugInfo(prev => prev + `\nユーザーID: ${session.user.id}`);
          
          const { data, error } = await supabase
            .from('diaries')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error("日記データ取得エラー:", error);
            setDebugInfo(prev => prev + `\n日記取得エラー: ${error.message}`);
            throw error;
          }
          
          console.log("取得した日記数:", data?.length || 0);
          setDebugInfo(prev => prev + `\n取得した日記数: ${data?.length || 0}`);
          setDiaries(data || []);
        }
      } catch (error: any) {
        console.error('データの取得中にエラーが発生しました:', error);
        setDebugInfo(prev => prev + `\nエラー: ${error.message || '不明なエラー'}`);
      } finally {
        setLoading(false);
        console.log("データ取得完了");
        setDebugInfo(prev => prev + '\nデータ取得処理完了');
      }
    };

    fetchData();

    // 認証状態変更時のイベントリスナー
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("認証状態変更イベント:", event);
      setDebugInfo(prev => prev + `\n認証イベント: ${event}`);
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log("認証状態変更: ログイン中, ユーザーID:", session.user.id);
        // ユーザーがログインしたら日記を取得
        const { data, error } = await supabase
          .from('diaries')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("認証状態変更後の日記取得エラー:", error);
        } else {
          console.log("認証状態変更後の日記取得数:", data?.length || 0);
        }
        
        setDiaries(data || []);
      } else {
        console.log("認証状態変更: ログアウト");
        // ログアウト時は日記リストをクリア
        setDiaries([]);
      }
    });

    return () => {
      subscription.unsubscribe();
      console.log("ホームページのクリーンアップ実行");
    };
  }, [supabase]);

  // 日記の内容を省略して表示する関数
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダーセクション */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">あなたの日記</h1>
          <p className="text-gray-600">思い出を記録して、いつでも振り返ることができます</p>
        </div>
        
        {user && (
          <Link 
            href="/diary/new" 
            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            新しい日記を書く
          </Link>
        )}
      </div>

      {/* デバッグ情報（開発時のみ表示） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-gray-100 text-gray-800 rounded-lg text-xs font-mono whitespace-pre-wrap border border-gray-200">
          <strong>デバッグ情報:</strong>
          <br />
          ユーザー状態: {user ? 'ログイン中' : '未ログイン'}
          <br />
          ローディング状態: {loading ? 'ロード中' : '完了'}
          <br />
          {debugInfo}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">日記を読み込んでいます...</p>
        </div>
      ) : !user ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
              <div className="bg-indigo-100 p-3 rounded-full mb-6">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-indigo-600" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">DiaryNoteへようこそ</h2>
              <p className="text-gray-600 mb-8">
                あなたの日常の出来事、思い出、感情を記録しましょう。日記を書いたり閲覧したりするには、ログインしてください。
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full">
                <Link 
                  href="/auth/login" 
                  className="flex-1 sm:flex-initial sm:min-w-[120px] px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  ログイン
                </Link>
                <Link 
                  href="/auth/register" 
                  className="flex-1 sm:flex-initial sm:min-w-[120px] px-5 py-2.5 bg-white text-indigo-600 font-medium text-sm rounded-lg border border-indigo-200 hover:bg-indigo-50 transition flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  新規登録
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : diaries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-indigo-100 p-3 rounded-full inline-flex mx-auto mb-6">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-indigo-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">最初の日記を書きましょう</h2>
            <p className="text-gray-600 mb-6">
              まだ日記がありません。今日の出来事や思いを記録してみませんか？
            </p>
            <Link 
              href="/diary/new" 
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition inline-block"
            >
              最初の日記を書く
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diaries.map((diary) => (
            <Link 
              href={`/diary/${diary.id}`} 
              key={diary.id} 
              className="block group"
            >
              <div className="h-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-indigo-200 transition-all">
                <p className="text-xs text-gray-500 mb-2 font-medium">{formatDate(diary.created_at)}</p>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{diary.title}</h2>
                <div className="mt-4 flex justify-end">
                  <span className="text-indigo-600 text-sm font-medium group-hover:underline flex items-center">
                    <span>開く</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
