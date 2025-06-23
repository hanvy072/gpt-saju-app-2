import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL || '')

export default async function handler(req, res) {
    const { prompt } = req.body;
  
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown'
    const lockKey = `lock:gpt:${ip}`
    const isLocked = await redis.get(lockKey)
    if (isLocked) {
      console.warn('🛑 락 걸려 있음, 요청 거절됨:', lockKey)
      return res.status(429).json({ error: '이미 분석 중입니다.' })
    }
    console.log('🔓 락 없음, 요청 처리 진행:', lockKey)
    await redis.set(lockKey, '1', 'EX', 10)

    try {
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
      console.log('📦 GPT 응답:', JSON.stringify(data, null, 2));
    
      res.status(200).json(data);
    } finally {
      await redis.del(lockKey)
    }
  }