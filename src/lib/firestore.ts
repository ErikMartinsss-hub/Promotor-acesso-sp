import {
  collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, limit,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Network, AppUser, Brand, Promoter, Visit } from '../types'

const collections = {
  networks: 'networks',
  users: 'users',
  brands: 'brands',
  promoters: 'promoters',
  visits: 'visits',
} as const

// --- Networks ---
export const getNetworks = () =>
  getDocs(query(collection(db, collections.networks), orderBy('name'))).then(s =>
    s.docs.map(d => ({ id: d.id, ...d.data() } as Network))
  )

export const addNetwork = (data: Omit<Network, 'id' | 'createdAt'>) =>
  addDoc(collection(db, collections.networks), { ...data, createdAt: Date.now() })

export const updateNetwork = (id: string, data: Partial<Network>) =>
  updateDoc(doc(db, collections.networks, id), data)

export const deleteNetwork = (id: string) =>
  deleteDoc(doc(db, collections.networks, id))

// --- Brands ---
export const getBrands = () =>
  getDocs(query(collection(db, collections.brands), orderBy('name'))).then(s =>
    s.docs.map(d => ({ id: d.id, ...d.data() } as Brand))
  )

export const addBrand = (data: Omit<Brand, 'id' | 'createdAt'>) =>
  addDoc(collection(db, collections.brands), { ...data, createdAt: Date.now() })

export const updateBrand = (id: string, data: Partial<Brand>) =>
  updateDoc(doc(db, collections.brands, id), data)

export const deleteBrand = (id: string) =>
  deleteDoc(doc(db, collections.brands, id))

// --- Users (App Users) ---
export const getUsers = () =>
  getDocs(query(collection(db, collections.users), orderBy('name'))).then(s =>
    s.docs.map(d => ({ id: d.id, ...d.data() } as AppUser))
  )

export const getUsersByNetwork = (networkId: string) =>
  getDocs(query(collection(db, collections.users), where('networkId', '==', networkId))).then(s =>
    s.docs.map(d => ({ id: d.id, ...d.data() } as AppUser))
  )

export const addUser = (data: Omit<AppUser, 'id' | 'createdAt'>) =>
  addDoc(collection(db, collections.users), { ...data, createdAt: Date.now() })

export const updateUser = (id: string, data: Partial<AppUser>) =>
  updateDoc(doc(db, collections.users, id), data)

// --- Promoters ---
export const getPromoters = () =>
  getDocs(collection(db, collections.promoters)).then(s =>
    s.docs.map(d => ({ id: d.id, ...d.data() } as Promoter)).sort((a, b) => a.name.localeCompare(b.name))
  )

export const getPromotersByNetwork = (networkId: string) =>
  getDocs(query(collection(db, collections.promoters), where('networkId', '==', networkId))).then(s =>
    s.docs.map(d => ({ id: d.id, ...d.data() } as Promoter)).sort((a, b) => a.name.localeCompare(b.name))
  )

export const getPromoterByCpf = (cpf: string) =>
  getDocs(query(collection(db, collections.promoters), where('cpf', '==', cpf))).then(s => {
    if (s.empty) return null
    const d = s.docs[0]
    return { id: d.id, ...d.data() } as Promoter
  })

export const getPromoterByUid = (uid: string) =>
  getDocs(query(collection(db, collections.promoters), where('uid', '==', uid))).then(s => {
    if (s.empty) return null
    const d = s.docs[0]
    return { id: d.id, ...d.data() } as Promoter
  })

export const getPromoterById = (id: string) =>
  getDoc(doc(db, collections.promoters, id)).then(s => {
    if (!s.exists()) return null
    return { id: s.id, ...s.data() } as Promoter
  })

export const addPromoter = (data: Omit<Promoter, 'id' | 'createdAt'>) =>
  addDoc(collection(db, collections.promoters), { ...data, createdAt: Date.now() })

export const updatePromoter = (id: string, data: Partial<Promoter>) =>
  updateDoc(doc(db, collections.promoters, id), data)

// --- Visits ---
export const getVisits = (max = 50) =>
  getDocs(query(collection(db, collections.visits), orderBy('createdAt', 'desc'), limit(max))).then(s =>
    s.docs.map(d => ({ id: d.id, ...d.data() } as Visit))
  )

export const getVisitsByDate = (date: string) =>
  getDocs(query(collection(db, collections.visits), where('date', '==', date))).then(s =>
    s.docs.map(d => ({ id: d.id, ...d.data() } as Visit)).sort((a, b) => b.entryTime - a.entryTime)
  )

export const getVisitsByPromoter = (promoterId: string) =>
  getDocs(query(collection(db, collections.visits), where('promoterId', '==', promoterId))).then(s =>
    s.docs.map(d => ({ id: d.id, ...d.data() } as Visit)).sort((a, b) => b.createdAt - a.createdAt)
  )

export const getActiveVisit = (promoterId: string) =>
  getDocs(query(
    collection(db, collections.visits),
    where('promoterId', '==', promoterId),
    where('status', '==', 'active'),
  )).then(s => {
    if (s.empty) return null
    const d = s.docs[0]
    return { id: d.id, ...d.data() } as Visit
  })

export const registerEntry = (data: Omit<Visit, 'id' | 'createdAt'>) =>
  addDoc(collection(db, collections.visits), { ...data, createdAt: Date.now() })

export const registerExit = (visitId: string, exitTime: number, closedBy: string) =>
  updateDoc(doc(db, collections.visits, visitId), { exitTime, status: 'completed', closedBy })

export const getVisitsByNetwork = (networkId: string, max = 50) =>
  getDocs(query(collection(db, collections.visits), where('networkId', '==', networkId))).then(s =>
    s.docs.map(d => ({ id: d.id, ...d.data() } as Visit))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, max)
  )
