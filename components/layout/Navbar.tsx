'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>(''); // デバッグ情報用
  const supabase = createClientComponentClient();

  useEffect(() => {
    // ユーザーのログイン状態をチェック
    const checkUser = async () => {
      console.log('Navbar: ユーザー状態チェック開始');
      setDebugInfo('状態チェック中...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Navbar: セッション取得エラー', error);
          setDebugInfo(prev => prev + '\nセッション取得エラー: ' + error.message);
        } else {
          console.log('Navbar: セッション状態', session ? 'ログイン中' : '未ログイン');
          setDebugInfo(prev => prev + '\nセッション: ' + (session ? 'あり' : 'なし'));
          
          if (session?.user) {
            console.log('Navbar: ユーザーID', session.user.id);
            setDebugInfo(prev => prev + '\nユーザーID: ' + session.user.id);
          }
        }
        
        setUser(session?.user ?? null);
        setLoading(false);

        // 認証状態の変更を監視
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Navbar: 認証状態変更イベント', event);
            setDebugInfo(prev => prev + '\n認証イベント: ' + event);
            
            setUser(session?.user ?? null);
            
            if (session?.user) {
              console.log('Navbar: ユーザーログイン', session.user.id);
              setDebugInfo(prev => prev + '\nログイン: ' + session.user.id);
            } else {
              console.log('Navbar: ユーザーログアウト');
              setDebugInfo(prev => prev + '\nログアウト');
              
              // ログアウト時にホームページにリダイレクト
              if (event === 'SIGNED_OUT') {
                console.log('Navbar: ログアウトによりホームにリダイレクト');
                router.push('/');
              }
            }
          }
        );

        return () => {
          console.log('Navbar: 購読解除');
          subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error('Navbar: 予期せぬエラー', err);
        setDebugInfo(prev => prev + '\nエラー: ' + (err.message || '不明'));
        setLoading(false);
      }
    };

    checkUser();
  }, [supabase.auth, router]);

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // ログアウト後にホームページにリダイレクト
    router.push('/');
  };

  // デバッグ情報を表示する関数（開発環境のみ）
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="fixed bottom-0 right-0 m-4 p-2 bg-black text-white text-xs font-mono rounded opacity-70 max-w-xs z-50 whitespace-pre-wrap">
        <strong>Navbar デバッグ:</strong><br />
        ロード状態: {loading ? 'ロード中' : '完了'}<br />
        ユーザー: {user ? 'ログイン中' : '未ログイン'}<br />
        {user && `ID: ${user.id.substring(0, 8)}...`}<br />
        {debugInfo}
      </div>
    );
  };

  // メニューを閉じる関数
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center space-x-2 group">
                  {/* 日記アイコン（SVG） */}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-indigo-600 drop-shadow-md transition-transform group-hover:scale-110" 
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
                  <div className="flex flex-col">
                    <div className="font-bold text-xl drop-shadow-sm">
                      <span className="text-indigo-600">Diary</span>
                      <span className="text-gray-800">Note</span>
                    </div>
                    <span className="text-xs text-gray-500 -mt-1">私の日記</span>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* デスクトップナビゲーション */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                ホーム
              </Link>
              
              {/* ユーザーがログインしている場合 */}
              {user ? (
                <>
                  <Link href="/diary/new" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    新規日記
                  </Link>
                  <Link href="/profile" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    プロフィール
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                // ユーザーがログインしていない場合
                <>
                  <Link href="/auth/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    ログイン
                  </Link>
                  <Link href="/auth/register" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    新規登録
                  </Link>
                </>
              )}
            </div>
            
            {/* モバイルメニューボタン */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">メニューを開く</span>
                {/* アイコン */}
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="sm:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                ホーム
              </Link>
              
              {/* ユーザーがログインしている場合（モバイル） */}
              {user ? (
                <>
                  <Link href="/diary/new" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    新規日記
                  </Link>
                  <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    プロフィール
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-red-500 hover:bg-red-600"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                // ユーザーがログインしていない場合（モバイル）
                <>
                  <Link href="/auth/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    ログイン
                  </Link>
                  <Link href="/auth/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    新規登録
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* デバッグ情報表示 */}
      {renderDebugInfo()}
    </>
  );
} 