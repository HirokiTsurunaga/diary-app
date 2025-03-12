export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* アプリ情報 */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-indigo-600" 
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
              <span className="font-bold text-lg">
                <span className="text-indigo-600">Diary</span>
                <span className="text-gray-800">Note</span>
              </span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              DiaryNoteは、あなたの日常を記録し、思い出を大切に保存するための日記アプリです。
              いつでもどこでも、あなたの思いを残しておけます。
            </p>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} DiaryNote. All rights reserved.
            </p>
          </div>
          
          {/* リンク */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">サービス</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  ヘルプセンター
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  機能リクエスト
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  バグ報告
                </a>
              </li>
            </ul>
          </div>
          
          {/* リンク */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">法的情報</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  利用規約
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  お問い合わせ
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* 下部情報 */}
        <div className="pt-8 mt-8 border-t border-gray-200 text-center md:text-left">
          <p className="text-xs text-gray-500">
            このアプリはデモ用に作成されたものです。実際のサービスではありません。
          </p>
        </div>
      </div>
    </footer>
  );
} 