/** Error returned by the API as an RFC 9457 problem; `message` is already meant for the user. */
export class ApiError extends Error {
  constructor(status, problem) {
    super(problem?.detail || 'Ocurrió un error inesperado.')
    this.name = 'ApiError'
    this.status = status
    this.title = problem?.title
    this.fieldErrors = problem?.errors || {}
  }
}

/** fetch wrapper: JSON in and out, problem details turned into ApiError. */
export async function request(path, { method = 'GET', body, signal } = {}) {
  let response
  try {
    response = await fetch(path, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(0, { detail: 'No se pudo conectar con el servidor. ¿Está corriendo el backend?' })
  }

  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, data)
  return data
}
