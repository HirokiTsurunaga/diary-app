import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// このミドルウェアは認証と未認証ユーザーの扱いを管理します
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Supabaseクライアントをミドルウェアで作成
  const supabase = createMiddlewareClient({ req, res });
  
  // セッション更新
  await supabase.auth.getSession();
  
  return res;
}

// このミドルウェアを適用するパスを指定
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 