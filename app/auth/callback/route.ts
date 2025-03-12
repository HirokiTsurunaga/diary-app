import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// このルートは認証フローの一部として必要です
export async function GET(req: NextRequest) {
  try {
    console.log('認証コールバック: 処理開始');
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    console.log('認証コールバック: コード取得', code ? 'コードあり' : 'コードなし');

    if (code) {
      // OAuth/メールリンク認証などで送られてくるcodeを処理
      console.log('認証コールバック: コード交換処理開始');
      const sessionResult = await supabase.auth.exchangeCodeForSession(code);
      console.log('認証コールバック: セッション交換完了', 
        sessionResult.error ? `エラー: ${sessionResult.error.message}` : 'セッション取得成功');
    } else {
      console.log('認証コールバック: コードがないためセッション交換はスキップ');
    }

    // 認証後にホームページにリダイレクト
    console.log('認証コールバック: ホームページへリダイレクト');
    return NextResponse.redirect(new URL('/', req.url));
  } catch (error: any) {
    console.error('認証コールバック: 予期せぬエラー', error);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('認証処理中にエラーが発生しました')}`, req.url)
    );
  }
} 