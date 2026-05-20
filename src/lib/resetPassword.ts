export async function generateResetLink(email: string): Promise<string> {
  const res = await fetch(`/api/generate-reset-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Erro ao gerar link')
  }
  const data = await res.json()
  return data.link
}
