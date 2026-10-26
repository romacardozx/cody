// Anonymous id of this browser, so the server can group its history without a login.
const KEY = 'cody-learner'
let memoryId = null

export function learnerId() {
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    // Storage blocked (private mode): keep a per-tab id so at least this visit has a history
    memoryId ??= crypto.randomUUID()
    return memoryId
  }
}
