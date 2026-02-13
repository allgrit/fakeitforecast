const API_BASE_URL = '/api/v1'
const API_VERSION = '1'

const DEFAULT_ERROR_MESSAGE = 'Не удалось выполнить запрос. Попробуйте снова.'
const ERROR_MESSAGES = {
  400: 'Проверьте заполнение формы. Некоторые поля заполнены некорректно.',
  409: 'Операция не может быть выполнена из-за конфликта данных. Обновите анализ и повторите попытку.',
  422: 'Запрос отклонен бизнес-правилами. Измените параметры и повторите.'
}

async function parseApiError(response) {
  let payload = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  const detail = payload?.message || payload?.error || payload?.detail
  const statusMessage = ERROR_MESSAGES[response.status] || DEFAULT_ERROR_MESSAGE
  return detail ? `${statusMessage} (${detail})` : statusMessage
}

async function post(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Version': API_VERSION
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  return response
}

export const analysisClient = {
  runAnalysis(payload) {
    return post('/analysis/run', payload)
  },
  applyServiceLevels(payload) {
    return post('/analysis/service-level/apply', payload)
  },
  saveAnalysisSlice(payload) {
    return post('/analysis/save', payload)
  }
}
