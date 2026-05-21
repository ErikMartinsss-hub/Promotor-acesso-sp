export interface Network {
  id: string
  name: string
  slug: string
  active: boolean
  createdAt: number
}

export interface AppUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'manager' | 'operator'
  networkId: string
  active: boolean
  createdAt: number
}

export interface Brand {
  id: string
  name: string
  razaoSocial: string
  cnpj: string
  nomeFantasia?: string
  active: boolean
  createdAt: number
}

export type PromoterType = 'promoter' | 'supervisor'

export interface Promoter {
  id: string
  name: string
  cpf: string
  phone: string
  email: string
  uid?: string
  type: PromoterType
  brandId: string
  brandName: string
  networkId: string
  networkName: string
  supervisorPhone: string
  visitDays: string[]
  qrToken: string
  active: boolean
  createdBy: string
  createdAt: number
}

export interface Visit {
  id: string
  promoterId: string
  promoterName: string
  promoterCpf: string
  brandName: string
  networkId: string
  networkName: string
  date: string
  entryTime: number
  exitTime: number | null
  status: 'active' | 'completed'
  registeredBy: string
  closedBy: string | null
  createdAt: number
}

export const VISIT_DAYS = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
]
