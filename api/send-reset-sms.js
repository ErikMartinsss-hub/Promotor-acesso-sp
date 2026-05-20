import admin from './_firebase.js'
import https from 'https'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { cpf } = req.body
    if (!cpf) return res.status(400).json({ error: 'CPF é obrigatório' })

    const snapshot = await admin.firestore().collection('promoters').where('cpf', '==', cpf).get()
    if (snapshot.empty) return res.status(404).json({ error: 'CPF não encontrado.' })

    const promoter = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://acesso-promotor.vercel.app'

    const link = await admin.auth().generatePasswordResetLink(promoter.email, {
      url: baseUrl,
      handleCodeInApp: false,
      languageCode: 'pt-BR',
    })

    // Tenta SMS, retorna link sempre
    let smsError = null
    try {
      const raw = await new Promise((resolve, reject) => {
        const r = https.request({
          hostname: 'd7sms.p.rapidapi.com',
          path: '/messages/v1/send',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-key': process.env.RAPIDAPI_KEY || '0b9daf8831msh56ca70071e98142p1ea90djsn3ac918c39927',
            'x-rapidapi-host': 'd7sms.p.rapidapi.com',
          },
        }, (smsRes) => {
          let data = ''
          smsRes.on('data', c => data += c)
          smsRes.on('end', () => resolve(data))
        })
        r.on('error', reject)
        r.write(JSON.stringify({
          messages: [{
            channel: 'sms',
            originator: 'ACESSO',
            recipients: ['55' + (promoter.phone || '').replace(/\D/g, '')],
            content: `ACESSO PROMOTOR - Link para redefinir sua senha: ${link}`,
            msg_type: 'text',
            data_coding: 'text',
          }]
        }))
        r.end()
      })
      const parsed = JSON.parse(raw)
      if (parsed.detail?.message) smsError = parsed.detail.message
    } catch (e) { smsError = e.message }

    res.json({ link, smsError })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
