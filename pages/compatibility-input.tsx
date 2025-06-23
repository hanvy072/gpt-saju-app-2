import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchCompatibilityResult } from '../utils/gptCompatibility'
import { useRouter } from 'next/router'

export default function CompatibilityInputPage() {
    const [people, setPeople] = useState<{ name: string; birth: string; time: string; place: string; gender: string; relation: string }[]>([
        { name: '', birth: '', time: '', place: '', gender: '', relation: '' },
    ])

  const [relation, setRelation] = useState<string>('')  // changed from string[] to string
  const [submitted, setSubmitted] = useState(false)

  const [usageCount, setUsageCount] = useState(0)
  const [canUse, setCanUse] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const stored = localStorage.getItem(`compat-usage-count:${today}`)
    const count = stored ? parseInt(stored, 10) : 0
    setUsageCount(count)
    setCanUse(count < 3)
  }, [])

  const addPerson = () => {
    setPeople([...people, { name: '', birth: '', time: '', place: '', gender: '', relation: '' }])
  }

  const removePerson = (index: number) => {
    if (people.length === 1) return
    setPeople(people.filter((_, i) => i !== index))
  }

  const updateField = (index: number, field: string, value: string) => {
    const updated = [...people]
    (updated[index] as any)[field] = value
    setPeople(updated)
  }

  const toggleRelation = (value: string) => {
    setRelation(value);
  };

  const [result, setResult] = useState<{ title: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (submitted) {
      return
    }
    const hasIncomplete = people.some(
      (p) => !p.name || !p.birth || !p.time || !p.place || !p.gender
    )
    if (hasIncomplete || relation.length === 0) {
      alert('관계 유형을 선택하고 모든 사람의 정보를 빠짐없이 입력해 주세요.')
      return
    }


    setSubmitted(true)

    const today = new Date().toISOString().slice(0, 10)
    const key = `compat-usage-count:${today}`
    const count = parseInt(localStorage.getItem(key) || '0')
    if (count >= 3) {
      alert('❗ 오늘 사용 횟수를 모두 소진했어요.')
      setSubmitted(false)
      setLoading(false)
      return
    }
    localStorage.setItem(key, String(count + 1))
    setUsageCount(count + 1)
    setCanUse(count + 1 < 3)

    setLoading(true)
    try {
      const gptResult = await fetchCompatibilityResult(people)
      console.log('✅ GPT 궁합 응답:', gptResult)

      router.push({
        pathname: '/compatibility-result',
        query: {
          result: encodeURIComponent(gptResult),
          relation: relation, // changed from relation[0]
        },
      })
    } catch (err) {
      console.error('❌ GPT 호출 실패:', err)
      alert('GPT 요청 중 오류가 발생했어요. 콘솔에서 로그를 확인해주세요.')
    }
    setLoading(false)
    setSubmitted(false)
  }

  return (
    <div className="bg-black min-h-screen text-white px-4 py-10 max-w-sm mx-auto">
      <Link href="/" className="text-sm text-gray-400 hover:underline block text-center mb-4">
        ← 홈으로 돌아가기
      </Link>
      <h2 className="text-2xl font-bold mb-6 text-center text-white">사주 정보 입력하기</h2>

      <div className="mb-6 max-w-[280px] mx-auto border border-white p-4">
        <div className="text-white text-sm mb-2">관계 유형을 선택해 주세요.</div>
        <div className="flex flex-wrap gap-4 text-white text-sm">
          {['연인', '가족', '친구', '동료'].map(type => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="radio"
                name="relation"
                value={type}
                checked={relation === type}  // changed from relation[0] === type
                onChange={() => setRelation(type)}  // changed from setRelation([type])
                className="accent-[#B26BFF]"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {people.map((person, index) => (
        <div key={index} className="mb-10 pb-10 border-b border-white max-w-[280px] mx-auto">
          <div className="flex flex-col gap-6 max-w-[280px] mx-auto mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[#ff6bdf] font-semibold">사람 {index + 1}</h3>
              {people.length > 1 && (
                <button
                  onClick={() => removePerson(index)}
                  className="text-white text-sm hover:underline"
                >
                  삭제
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="이름을 알려주세요."
              value={person.name}
              onChange={(e) => updateField(index, 'name', e.target.value)}
              className="w-full p-4 rounded-m border border-white text-white bg-black appearance-none placeholder-white [&::-webkit-calendar-picker-indicator]:invert"
            />

            <input
              type="date"
              value={person.birth}
              onChange={(e) => updateField(index, 'birth', e.target.value)}
              className="w-full p-4 rounded-m border border-white text-white bg-black appearance-none placeholder-white [&::-webkit-calendar-picker-indicator]:invert"
            />

            <input
              type="time"
              value={person.time}
              onChange={(e) => updateField(index, 'time', e.target.value)}
              className="w-full p-4 rounded-m border border-white text-white bg-black appearance-none placeholder-white [&::-webkit-calendar-picker-indicator]:invert"
            />

            <input
              type="text"
              placeholder="어디서 태어났나요? (예: 서울)"
              value={person.place}
              onChange={(e) => updateField(index, 'place', e.target.value)}
              className="w-full p-4 rounded-m border border-white text-white bg-black appearance-none placeholder-white [&::-webkit-calendar-picker-indicator]:invert"
            />

            <select
              value={person.gender}
              onChange={(e) => updateField(index, 'gender', e.target.value)}
              className="w-full p-4 rounded-m border border-white text-white bg-black appearance-none"
            >
              <option value="" disabled>성별을 선택해 주세요.</option>
              <option value="남성">남성</option>
              <option value="여성">여성</option>
            </select>

          </div>
        </div>
      ))}

      <div className="max-w-[280px] mx-auto flex flex-col gap-6 mb-4">
        <button
          onClick={addPerson}
          className="w-full text-white font-bold text-center p-4 rounded-m bg-[#ff6bdf] hover:bg-[#f743d0] hover:scale-105 transition-all cursor-pointer"
        >
          + 사람 추가
        </button>

        <button
          onClick={handleSubmit}
          className="w-full text-white font-bold text-center p-4 rounded-m bg-[#B26BFF] hover:bg-[#9c50ff] hover:scale-105 transition-all cursor-pointer"
          disabled={loading}
        >
          {loading ? '데이터 분석중...' : '우리 잘 맞을까?'}
        </button>
        <p className="text-center text-sm text-gray-400 mt-1">
          {canUse
            ? `오늘 남은 횟수: ${3 - usageCount}`
            : '❗ 오늘 사용 횟수를 모두 소진했어요'}
        </p>
      </div>

      {Array.isArray(result) && result.length > 0 && (
        <div className="mt-8 space-y-4">
          {result.map((item, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded text-sm text-lime-300 whitespace-pre-line shadow-lg">
              <h3 className="text-pink-400 font-semibold mb-2">{item.title}</h3>
              <p>{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}