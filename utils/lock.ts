export function isLocked(key: string) {
    const lockUntil = localStorage.getItem(`LOCK_UNTIL_${key}`)
    if (!lockUntil) return false
    return Date.now() < Number(lockUntil)
  }
  
  export function setLock(key: string, ms: number) {
    const unlockTime = Date.now() + ms
    localStorage.setItem(`LOCK_UNTIL_${key}`, String(unlockTime))
  }