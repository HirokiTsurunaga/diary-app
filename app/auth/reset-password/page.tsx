import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">パスワードのリセット</h2>
        
        <form>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="your@email.com"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            リセットリンクを送信
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
            ログインページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
} 