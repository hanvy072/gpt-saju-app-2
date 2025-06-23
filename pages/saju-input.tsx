import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSajuQuota } from '../utils/useSajuQuota'
import { fetchSajuResult } from '../utils/gptPrompt'
import { useRouter } from 'next/router'


export default function SajuInputPage() {
  const [name, setName] = useState('')
  const [birth, setBirth] = useState('')
  const [time, setTime] = useState('')
  const [place, setPlace] = useState('')
  const [gender, setGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { canUse, recordUsage } = useSajuQuota(3)
  const router = useRouter()

  const [usageCount, setUsageCount] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('saju-usage-count')
      setUsageCount(parseInt(stored || '0'))
    }
  }, [])

  const handleSubmit = async () => {
    if (!name || !birth || !time || !place || !gender) {
      alert('모든 정보를 빠짐없이 입력해 주세요.')
      return
    }

    if (!canUse) {
      alert('❗ 하루 3회까지만 이용할 수 있어요. 내일 다시 시도해 주세요.')
      return
    }

    // if (submitted) {
    //   return
    // }


    setSubmitted(true)

    setLoading(true)
    recordUsage()

    try {
      const gptResult = await fetchSajuResult({ name, birth, time, place })
      router.push({
        pathname: '/saju-result',
        query: {
          result: encodeURIComponent(gptResult),
          name: encodeURIComponent(name),
        },
      })
    } finally {
      setLoading(false)
      setSubmitted(false)
    }
  }

  return (
    <div className="bg-black min-h-screen text-white px-4 py-10 max-w-sm mx-auto">
      <Link href="/" className="text-sm text-gray-400 hover:underline block text-center mb-4">
        ← 홈으로 돌아가기
      </Link>
      <h2 className="text-2xl font-bold mb-4 text-center text-white pb-6"> 내 사주 정보 입력하기</h2>

      <div className="flex flex-col gap-6 max-w-[280px] mx-auto pb-6">
        <input
          type="text"
          placeholder="이름을 알려주세요."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 rounded-m border border-white text-white bg-black appearance-none placeholder-white"
        />
        <input
          type="date"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
          placeholder="생년월일 (예: 1991-12-05)"
          className="w-full p-4 rounded-m border border-white text-white bg-black appearance-none placeholder-white [&::-webkit-calendar-picker-indicator]:invert"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="출생시간 (예: 07:30)"
          className="w-full p-4 rounded-m border border-white text-white bg-black appearance-none placeholder-white [&::-webkit-calendar-picker-indicator]:invert"
        />
        <input
          type="text"
          placeholder="어디서 태어났나요? (예: 서울)"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          className="w-full p-4 rounded-m border border-white text-white bg-black appearance-none placeholder-white"
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full p-4 rounded-m border border-white text-white bg-black appearance-none"
        >
          <option value="" disabled>성별을 선택해 주세요</option>
          <option value="남성">남성</option>
          <option value="여성">여성</option>
        </select>
      </div>
      <div className="my-6 mx-auto" style={{ width: '280px', height: '1px', backgroundColor: 'white' }} />
      <div className="max-w-[280px] mx-auto">
        {/* <p className="text-center text-sm text-gray-400 mb-2">
         오늘 남은 횟수: {3 - (canUse ? 0 : 3)}
        </p> */}
      </div>
      <div className="mt-10 max-w-[280px] mx-auto">
        <button
          onClick={handleSubmit}
          className="w-full text-white font-bold text-center p-4 rounded-m bg-[#B26BFF] hover:bg-[#9c50ff] hover:scale-105 transition-all cursor-pointer"
        >
          {loading ? '데이터 분석 중...' : '이번 생은 어떤가요?'}
        </button>
        <p className="text-center text-sm text-gray-400 mt-6">
          {canUse ? `오늘 남은 횟수: ${3 - usageCount}` : '❗ 오늘 사용 횟수를 모두 소진했어요'}
        </p>
      </div>
    </div>
  )
}