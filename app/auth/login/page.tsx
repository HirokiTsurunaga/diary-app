'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const supabase = createClientComponentClient();

  // コンポーネントロード時のデバッグ
  useEffect(() => {
    const addLog = (message: string) => {
      console.log('LoginPage:', message);
      setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    addLog('コンポーネントマウント');
    
    // 現在のセッション状態を確認
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          addLog(`セッション取得エラー: ${error.message}`);
        } else {
          addLog(`セッション状態: ${session ? 'ログイン済み' : '未ログイン'}`);
          if (session?.user) {
            addLog(`ユーザーID: ${session.user.id}`);
          }
        }
      } catch (err: any) {
        addLog(`予期せぬエラー: ${err.message || '不明'}`);
      }
    };
    
    checkSession();
    
    return () => {
      addLog('コンポーネントアンマウント');
    };
  }, [supabase.auth]);

  // 認証状態の変更を監視
  useEffect(() => {
    const addLog = (message: string) => {
      console.log('LoginPage Auth:', message);
      setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };
    
    addLog('認証状態監視開始');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`認証イベント: ${event}`);
      
      if (event === 'SIGNED_IN') {
        addLog(`サインイン成功: ${session?.user.id}`);
        
        // サインイン成功時にホームページにリダイレクト
        addLog('ホームにリダイレクト');
        router.push('/');
        router.refresh();
      }
    });

    return () => {
      addLog('認証状態監視終了');
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  // デバッグパネル
  const renderDebugPanel = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="mt-8 p-4 bg-gray-100 rounded-md text-xs font-mono whitespace-pre-wrap">
        <h3 className="font-bold mb-2">デバッグログ:</h3>
        <div className="max-h-40 overflow-y-auto">
          {debugLogs.map((log, i) => (
            <div key={i} className="mb-1">{log}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">ログイン / 新規登録</h1>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="light"
        showLinks={true}
        providers={[]}
        redirectTo={`${window.location.origin}/auth/callback`}
        localization={{
          variables: {
            sign_in: {
              email_label: 'メールアドレス',
              password_label: 'パスワード',
              button_label: 'ログイン',
              loading_button_label: '処理中...',
              link_text: 'アカウントをお持ちの方はこちら',
              email_input_placeholder: 'your@email.com',
              password_input_placeholder: 'パスワード',
            },
            sign_up: {
              email_label: 'メールアドレス',
              password_label: 'パスワード',
              button_label: '新規登録',
              loading_button_label: '処理中...',
              link_text: '新しくアカウントを作成',
              email_input_placeholder: 'your@email.com',
              password_input_placeholder: 'パスワード',
            },
          }
        }}
      />
      
      {renderDebugPanel()}
    </div>
  );
} 