export async function fetchSajuResult(userInput: {
    birth: string
    time: string
    place: string
  }): Promise<string> {
    const res = await fetch('/api/saju', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInput),
    });
  
    if (res.status === 429) {
      return '❗ 너무 빠르게 요청했어요. 잠시 후 다시 시도해 주세요.'
    }
  
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '❗ GPT 응답은 왔지만 이상한 형식입니다.';
  }