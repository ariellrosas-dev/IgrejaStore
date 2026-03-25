import Dexie from 'dexie'

export const db = new Dexie('ChurchShirtManager')

db.version(1).stores({
  leaders: '++id, &name',
  shirt_models: '++id, name, color',
  orders: 'id, date, buyerName, paymentStatus, registeredBy',
  cash_flow: 'id, date, type, category, method',
  settings: 'id',
  clients: '++id, &email, name, phone, cpf'
})

// Inicializar configurações padrão se não existir
export const initSettings = async () => {
  const settings = await db.settings.get(1)
  if (!settings) {
    await db.settings.add({
      id: 1,
      churchName: 'Igreja Batista',
      churchAddress: '',
      churchPhone: '',
      defaultPaymentMethod: 'PIX',
      lowStockAlert: 5
    })
  }
}

// ─── LÍDERES ───────────────────────────────────────────────────────────────

export const getLeaders = async () => {
  return await db.leaders.toArray()
}

export const addLeader = async (name) => {
  return await db.leaders.add({ name, created_at: new Date() })
}

export const deleteLeader = async (id) => {
  return await db.leaders.delete(id)
}

// ─── MODELOS DE CAMISAS ────────────────────────────────────────────────────

export const getShirtModels = async () => {
  return await db.shirt_models.toArray()
}

export const addShirtModel = async (model) => {
  const stockObj = {}
  model.sizes.forEach(s => { stockObj[s] = 0 })
  return await db.shirt_models.add({
    name: model.name,
    price: model.price,
    cost: model.cost || 0,
    color: model.color,
    sizes: model.sizes,
    stock: stockObj,
    description: model.description || '',
    created_at: new Date()
  })
}

export const deleteShirtModel = async (id) => {
  return await db.shirt_models.delete(id)
}

export const updateModelStock = async (id, stock) => {
  return await db.shirt_models.update(id, { stock })
}

export const updateShirtModel = async (id, data) => {
  return await db.shirt_models.update(id, data)
}

// ─── PEDIDOS ───────────────────────────────────────────────────────────────

export const getOrders = async () => {
  return await db.orders.toArray()
}

export const addOrder = async (order) => {
  const orderData = {
    id: order.id,
    date: order.date,
    buyerName: order.buyerName,
    cpf: order.cpf || '',
    phone: order.phone,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: order.total,
    amountPaid: order.amountPaid,
    amountDue: order.amountDue,
    notes: order.notes || '',
    registeredBy: order.registeredBy,
    items: order.items,
    created_at: new Date()
  }
  return await db.orders.add(orderData)
}

export const updateOrderStatus = async (id, status, amountPaid, amountDue) => {
  return await db.orders.update(id, {
    paymentStatus: status,
    amountPaid,
    amountDue
  })
}

export const deleteOrder = async (id) => {
  return await db.orders.delete(id)
}

// ─── FLUXO DE CAIXA ────────────────────────────────────────────────────────

export const getCashFlow = async () => {
  return await db.cash_flow.toArray()
}

export const addCashFlow = async (entry) => {
  return await db.cash_flow.add({
    id: entry.id,
    date: entry.date,
    description: entry.description,
    type: entry.type,
    category: entry.category,
    method: entry.method,
    amount: entry.amount,
    orderId: entry.orderId || '',
    registeredBy: entry.registeredBy || '',
    created_at: new Date()
  })
}

// ─── CONFIGURAÇÕES ─────────────────────────────────────────────────────────

export const getSettings = async () => {
  const settings = await db.settings.get(1)
  if (!settings) {
    return {
      churchName: 'Igreja Batista',
      churchAddress: '',
      churchPhone: '',
      defaultPaymentMethod: 'PIX',
      lowStockAlert: 5
    }
  }
  return settings
}

export const saveSettings = async (settings) => {
  return await db.settings.put({ ...settings, id: 1 })
}

// ─── CLIENTES ───────────────────────────────────────────────────────────────

export const getClients = async () => {
  return await db.clients.toArray()
}

export const addClient = async (client) => {
  return await db.clients.add({
    name: client.name,
    email: client.email,
    phone: client.phone,
    cpf: client.cpf || '',
    address: client.address || '',
    created_at: new Date()
  })
}

export const updateClient = async (id, data) => {
  return await db.clients.update(id, data)
}

export const deleteClient = async (id) => {
  return await db.clients.delete(id)
}

export default db
