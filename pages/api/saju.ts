// pages/api/saju.ts

import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL || '')

export default async function handler(req, res) {
    const { name, birth, time, place } = req.body;
    console.log('💾 메모리 사용량 (요청 직후):', process.memoryUsage());

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    const today = new Date().toISOString().slice(0, 10);
    const userKey = `limit:${ip}:${today}`;
    const count = await redis.incr(userKey);

    if (count === 1) {
      await redis.expire(userKey, 60 * 60 * 24); // 하루 TTL
    }

    if (count > 3) {
      return res.status(429).json({
        message: '❗ 하루 3회까지만 이용할 수 있어요. 내일 다시 시도해주세요.',
      });
    }

    const lockKey = `lock:saju:${ip}`;
    const isLocked = await redis.get(lockKey)
    if (isLocked) {
      console.warn('🛑 락 걸려 있음, 요청 거절됨:', lockKey)
      return res.status(429).json({ error: '이미 분석 중입니다.' })
    }
    console.log('🔓 락 없음, 요청 처리 진행:', lockKey)
    await redis.set(lockKey, '1', 'EX', 10)
  
    const prompt = `
당신은 사주 풀이 철학관의 주인입니다. 당신의 말투는 냉정하고 날카롭습니다. 아무리 아픈 말이라도 사실이면 그대로 말해줍니다. 사탕발림은 금지입니다. 듣는 사람이 정신 차릴 수 있도록 직설적으로 해석해 주세요.

상담자 이름은 ${name} 님입니다. 이후 해석에서는 이 이름으로 사용자를 호칭해 주세요.

아래는 사용자가 입력한 정보입니다:
[생년월일] ${birth}
[출생시간] ${time}
[출생지] ${place}

이 정보를 바탕으로 사주학적으로 해석해 주세요. 오행, 십성, 지지, 천간 등 사주학적 관점을 토대로 현실감 있게 설명하되, 어려운 용어는 쓰지 말고 쉽게 풀어 주세요.

사람들이 실제로 궁금해할 만한 질문에 대해 대답하듯 현실적이고 실용적인 해석을 해 주세요.
아래 다섯 가지 항목에 대해 반드시 '제목: 내용' 형태로 출력해 주세요. 각 항목의 제목은 반드시 한 줄로 명확히 시작하고, 내용은 단순 요약이 아닌 충분한 길이와 밀도로 정성스럽게 분석해 주세요.

1. 평생의 성격: 기본 성향뿐 아니라 어떤 사람과 잘 맞고, 어떤 사람과는 부딪히는지를 분석해 주세요.
2. 평생의 재물운: 돈을 쉽게 버는 스타일인지, 노력에 비해 결과가 늦게 오는 타입인지 등을 구체적으로 설명해 주세요.
3. 평생의 연애운: 연애 스타일, 바람기 유무, 관계 지속력 등을 중심으로 풀어 주세요.
4. 평생의 직업운: 현실적인 직업 추천과, 어떤 환경에서 잠재력이 발휘되는지까지 분석해 주세요.
5. 평생의 건강운: 약한 부위, 체력이나 회복력 수준 등을 사주학적으로 짚어 주세요.
`;
  
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  
    const data = await response.json();
    console.log('💾 메모리 사용량 (GPT 응답 후):', process.memoryUsage());
    console.log('📦 GPT API 응답:', JSON.stringify(data, null, 2));
    
    await redis.del(lockKey)

    const remaining = Math.max(0, 3 - count);
    data.remaining = remaining;
    res.status(200).json(data);
  }