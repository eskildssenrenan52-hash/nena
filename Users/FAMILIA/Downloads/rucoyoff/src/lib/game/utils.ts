let _idCounter = 0
export function uid(prefix: string): string {
  _idCounter = (_idCounter + 1) % 1e9
  return `${prefix}_${Date.now().toString(36)}_${_idCounter}`
}
