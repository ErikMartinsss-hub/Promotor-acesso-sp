import admin from './_firebase.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email é obrigatório' })

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://acesso-promotor.vercel.app'

    const link = await admin.auth().generatePasswordResetLink(email, {
      url: baseUrl,
      handleCodeInApp: false,
      languageCode: 'pt-BR',
    })
    res.json({ link })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
