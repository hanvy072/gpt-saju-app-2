import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'


export default function CompatibilityResultPage() {
  const router = useRouter()
  const [decodedResult, setDecodedResult] = useState('')
  const [relationType, setRelationType] = useState('')

  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.result) {
      const decoded = decodeURIComponent(router.query.result as string)
      setDecodedResult(decoded)
    }
    if (router.query.relation) {
      const decodedRelation = decodeURIComponent(router.query.relation as string)
      setRelationType(decodedRelation)
    }
  }, [router.isReady, router.query.result, router.query.relation])

  return (
    <div className="bg-black min-h-screen text-white px-4 py-10 max-w-sm mx-auto">
      <Link href="/" className="text-sm text-gray-400 hover:underline block text-center mb-4">
        ← 홈으로 돌아가기
      </Link>

      <h2 className="text-2xl font-bold mb-10 text-center text-white">
        {decodedResult
          ? relationType
            ? `${relationType} 궁합 결과`
            : '궁합 결과'
          : '결과를 불러오는 중입니다...'}
      </h2>

      {decodedResult ? (
        <div className="space-y-10">
          {decodedResult
            .split(/\n{2,}/)
            .filter(line => line.trim() !== '')
            .map((paragraph, index) => {
              const [title, ...rest] = paragraph.split(/[:：]/)
              const content = rest.join(':').trim()
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