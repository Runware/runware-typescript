/**
 * RFC 4122 v4 UUID. Uses `crypto.randomUUID` where the runtime has it and
 * falls back to `Math.random` for older ones, which is enough because these
 * ids only need to be unique per caller, never unguessable.
 */
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const randomHex = (Math.random() * 16) | 0
    const value = (char === 'x') ? randomHex : (randomHex & 0x3) | 0x8
    return value.toString(16)
  })
}
