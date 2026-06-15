const BASE_URL = 'https://api.z-api.io/instances'

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Client-Token': process.env.ZAPI_TOKEN!,
  }
}

function endpoint(path: string) {
  return `${BASE_URL}/${process.env.ZAPI_INSTANCE_ID}${path}`
}

export async function sendTextMessage(phone: string, message: string): Promise<void> {
  const res = await fetch(endpoint('/token/send-text'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ phone, message }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Z-API sendTextMessage failed: ${res.status} ${body}`)
  }
}

export async function sendTextToGroup(groupId: string, message: string): Promise<void> {
  const res = await fetch(endpoint('/token/send-text'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ phone: groupId, message }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Z-API sendTextToGroup failed: ${res.status} ${body}`)
  }
}
