import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [remaining, setRemaining] = useState(3)

  useEffect(() => {
    const count = parseInt(localStorage.getItem('saju-usage-count') || '0')
    setRemaining(Math.max(0, 3 - count))
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-10 font-mono max-w-sm mx-auto">
      <h1 className="text-5xl font-extrabold text-[#ffffff] mb-4 text-center leading-tight">
        🔮<br />
        GPT철학관
      </h1>
      <p className="mb-10 text-center text-gray-400">
        믿음은 없지만, 데이터는 많습니다.
      </p>

      <div className="w-full">
        <Link href="/saju-input">
          <div className="mb-6 max-w-[280px] mx-auto text-white font-bold text-center p-4 rounded-m border border-white hover:bg-[#B26BFF] hover:border-transparent hover:text-white hover:ring-2 hover:ring-[#B26BFF] transition-all cursor-pointer">
            이번 생은 어떨까?
          </div>
        </Link>

        <Link href="/compatibility-input">
          <div className="max-w-[280px] mx-auto text-white font-bold text-center p-4 rounded-m border border-white hover:bg-[#B26BFF] hover:border-transparent hover:text-white hover:ring-2 hover:ring-[#B26BFF] transition-all cursor-pointer">
            우리 잘 맞을까?
          </div>
        </Link>

        <p className="mt-6 mb-6 text-center text-sm text-gray-400">
          오늘 남은 횟수: {remaining}회
        </p>
      </div>

      <p className="mt-6 mb-6 text-center text-gray-500 text-sm">
        하루 3번까지 무료로 볼 수 있어요. <br />
        자정마다 기회가 새로 생깁니다!
      </p>
      <div className="mt-auto pt-10">
        <p className="text-center text-gray-500 text-sm">
          입력한 데이터는 저장되지 않아요.
        </p>
      </div>
    </div>
  )
}