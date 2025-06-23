import { useRouter } from 'next/router'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function SajuResultPage() {
  const router = useRouter()
  const [decodedResult, setDecodedResult] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    if (router.query.result) {
      const decoded = decodeURIComponent(router.query.result as string)
      setDecodedResult(decoded)
    }
    if (router.query.name) {
      const decodedName = decodeURIComponent(router.query.name as string)
      setUserName(decodedName)
    }
  }, [router.query.result, router.query.name])

  return (
    <div className="bg-black min-h-screen text-white px-4 py-10 max-w-sm mx-auto">
      <Link href="/" className="text-sm text-gray-400 hover:underline block text-center mb-4">
        ← 홈으로 돌아가기
      </Link>

      <h2 className="text-2xl font-bold mb-10 text-center text-white">
        {userName ? `${userName} 님의 사주 결과` : '당신의 사주 결과'}
      </h2>

      {decodedResult ? (
        <div className="space-y-10">
          {decodedResult
            .split(/\n{2,}/)
            .filter(line => line.trim() !== '')
            .map((paragraph, index) => {
              console.log('🧾 Parsed line:', paragraph)
              const [title, ...rest] = paragraph.split(/[:：]/)
              let content = rest.join(':').trim()
              if (content.startsWith(title.trim())) {
                content = content.slice(title.trim().length).trimStart().replace(/^[:：]/, '').trimStart()
              }
              const hasTitle = rest.length > 0

              return (
                <div key={index} className="flex flex-col items-center space-y-3">
                  <div className="bg-black border border-m border-white p-4 text-sm text-white whitespace-pre-line max-w-[280px] mx-auto">
                    {hasTitle && (
                      <h3 className="text-sm font-bold mb-2">{title.trim()}</h3>
                    )}
                    <p>{hasTitle ? content : paragraph}</p>
                  </div>
                </div>
              )
            })}
        </div>
      ) : (
        <p className="text-center text-gray-400">결과를 불러오는 중입니다...</p>
      )}
    </div>
  )
}