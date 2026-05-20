import admin from 'firebase-admin'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  }
  const paths = [
    join(__dirname, 'service-account.json'),
    join(__dirname, '..', 'server', 'service-account.json'),
  ]
  for (const p of paths) {
    if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf-8'))
  }
  throw new Error('Service account not found. Set FIREBASE_SERVICE_ACCOUNT env var or place service-account.json in api/')
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(getServiceAccount()) })
}

export default admin
