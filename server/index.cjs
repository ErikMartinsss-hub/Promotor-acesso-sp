const express = require('express')
const admin = require('firebase-admin')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const https = require('https')

const serviceAccountPath = path.join(__dirname, 'service-account.json')
if (!fs.existsSync(serviceAccountPath)) {
  console.error('ERRO: Baixe a chave de serviço do Firebase Console.')
  console.error('1. Vá em https://console.firebase.google.com/project/acesso-promotor/settings/serviceaccounts/adminsdk')
  console.error('2. Clique em "Gerar nova chave privada"')
  console.error('3. Salve como server/service-account.json')
  process.exit(1)
}

const serviceAccount = require(serviceAccountPath)
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()

const app = express()
app.use(cors())
app.use(express.json())

// Gerar link de redefinição (usado pelo admin)
app.post('/api/generate-reset-link', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email é obrigatório' })
    const link = await admin.auth().generatePasswordResetLink(email, {
      url: 'https://acesso-promotor.firebaseapp.com',
      handleCodeInApp: false,
      languageCode: 'pt-BR',
    })
    res.json({ link })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Enviar link de redefinição por SMS (usado pelo promotor na tela de login)
app.post('/api/send-reset-sms', async (req, res) => {
  try {
    const { cpf } = req.body
    if (!cpf) return res.status(400).json({ error: 'CPF é obrigatório' })

    // Buscar promoter por CPF no Firestore
    const snapshot = await db.collection('promoters').where('cpf', '==', cpf).get()
    if (snapshot.empty) {
      return res.status(404).json({ error: 'CPF não encontrado.' })
    }
    const promoter = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }

    // Gerar link de redefinição
    const link = await admin.auth().generatePasswordResetLink(promoter.email, {
      url: 'https://acesso-promotor.firebaseapp.com',
      handleCodeInApp: false,
      languageCode: 'pt-BR',
    })

    // Tenta enviar SMS, mas retorna o link de qualquer jeito
    let smsError = null
    try {
      const smsBody = JSON.stringify({
        messages: [{
          channel: 'sms',
          originator: 'ACESSO',
          recipients: ['55' + (promoter.phone || '').replace(/\D/g, '')],
          content: `ACESSO PROMOTOR - Link para redefinir sua senha: ${link}`,
          msg_type: 'text',
          data_coding: 'text',
        }]
      })

      const raw = await new Promise((resolve, reject) => {
        const r = https.request({
          hostname: 'd7sms.p.rapidapi.com',
          path: '/messages/v1/send',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-key': '0b9daf8831msh56ca70071e98142p1ea90djsn3ac918c39927',
            'x-rapidapi-host': 'd7sms.p.rapidapi.com',
          },
        }, (smsRes) => {
          let data = ''
          smsRes.on('data', c => data += c)
          smsRes.on('end', () => resolve(data))
        })
        r.on('error', reject)
        r.write(smsBody)
        r.end()
      })
      const parsed = JSON.parse(raw)
      if (parsed.detail) smsError = parsed.detail.message || JSON.stringify(parsed.detail)
    } catch (e) {
      smsError = e.message
    }

    res.json({ link, smsError })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
