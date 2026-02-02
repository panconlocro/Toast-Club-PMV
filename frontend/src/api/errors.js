export const mapApiError = (error, fallback = 'Ocurrió un error. Intenta nuevamente.') => {
  if (error?.response?.data?.detail) {
    return error.response.data.detail
  }

  if (error?.message) {
    return error.message
  }

  return fallback
}
