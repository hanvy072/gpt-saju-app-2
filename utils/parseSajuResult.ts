export function parseSajuResult(raw: string): {
    title: string;
    content: string;
    emoji: string;
  }[] {
    const sections = raw.split(/\d+\.\s+/).filter(Boolean);
  
    const titles = ['성격', '재물운', '연애운', '조심할 점', '행운 키워드'];
    const emojis = ['🧠', '💰', '💘', '⚠️', '🌟'];
  
    return titles.map((title, i) => ({
      title,
      content: sections[i]?.trim() || '결과 없음',
      emoji: emojis[i],
    }));
  }