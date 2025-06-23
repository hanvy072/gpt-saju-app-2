export function useSajuQuota(maxPerDay = 3) {
    const today = new Date().toISOString().slice(0, 10)
    const key = 'saju-usage'
  
    const getUsage = () => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        if (data.date !== today) return { date: today, count: 0 }
        return data
      } catch {
        return { date: today, count: 0 }
      }
    }
  
    const canUse = () => {
      const usage = getUsage()
      return usage.count < maxPerDay
    }
  
    const recordUsage = () => {
      const usage = getUsage()
      const newUsage = { date: today, count: usage.count + 1 }
      localStorage.setItem(key, JSON.stringify(newUsage))
    }
  
    return { canUse, recordUsage }
  }