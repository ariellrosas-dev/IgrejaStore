import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, DollarSign,
  FileText, Plus, Trash2, Eye, Edit, Banknote, X, Download,
  Printer, ChevronLeft, ChevronRight, AlertTriangle, CreditCard,
  Smartphone, Check, Clock, PackageCheck, TrendingUp, Menu,
  ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight,
  Settings, Save, Store, Search, Cross, Users, HelpCircle, User
} from 'lucide-react';
import {
  getLeaders, addLeader as dbAddLeader, deleteLeader as dbDeleteLeader,
  getShirtModels, addShirtModel as dbAddShirtModel, deleteShirtModel as dbDeleteShirtModel, updateModelStock as dbUpdateModelStock, updateShirtModel as dbUpdateShirtModel,
  getOrders, addOrder as dbAddOrder, updateOrderStatus as dbUpdateOrderStatus, deleteOrder as dbDeleteOrder,
  getCashFlow, addCashFlow as dbAddCashFlow,
  getSettings, saveSettings as dbSaveSettings,
  getClients, addClient as dbAddClient, updateClient as dbUpdateClient, deleteClient as dbDeleteClient,
  initSettings
} from './lib/database';

/* ─── DADOS ─────────────────────────────────────────────────────────────── */

const SHIRT_MODELS = [
  { id: 1, name: 'Camisa Oficial da Igreja 2025', price: 65.00, cost: 38.00, sizes: ['P', 'M', 'G', 'GG', 'XGG'], stock: { P: 12, M: 20, G: 15, GG: 8, XGG: 4 }, color: 'Azul Marinho', description: 'Camisa oficial do aniversário da igreja' },
  { id: 2, name: 'Camisa Ministério de Louvor', price: 55.00, cost: 30.00, sizes: ['P', 'M', 'G', 'GG'], stock: { P: 5, M: 10, G: 8, GG: 3 }, color: 'Branca', description: 'Camisa do time de louvor' },
  { id: 3, name: 'Camisa Escola Bíblica', price: 45.00, cost: 25.00, sizes: ['P', 'M', 'G', 'GG', 'XGG'], stock: { P: 20, M: 25, G: 18, GG: 12, XGG: 6 }, color: 'Verde', description: 'Camisa da escola bíblica dominical' }
];

const LEADERS = ['Líder João Silva', 'Líder Ana Oliveira', 'Líder Carlos Mendes', 'Líder Paula Ferreira', 'Tesoureira Beatriz Lima'];
const ALL_SIZES = ['P', 'M', 'G', 'GG', 'XGG'];

const INITIAL_ORDERS = [
  { id: 'PED-001', date: '2025-01-10', buyerName: 'Maria Santos', cpf: '123.456.789-00', phone: '(81) 99999-1111', items: [{ modelId: 1, modelName: 'Camisa Oficial da Igreja 2025', size: 'M', quantity: 2, unitPrice: 65.00, subtotal: 130.00 }], total: 130.00, paymentMethod: 'PIX', paymentStatus: 'Pago', amountPaid: 130.00, amountDue: 0, notes: '', registeredBy: 'Líder João Silva', createdAt: '2025-01-10T10:30:00' },
  { id: 'PED-002', date: '2025-01-12', buyerName: 'José Oliveira', cpf: '234.567.890-11', phone: '(81) 98888-2222', items: [{ modelId: 2, modelName: 'Camisa Ministério de Louvor', size: 'G', quantity: 1, unitPrice: 55.00, subtotal: 55.00 }], total: 55.00, paymentMethod: 'Dinheiro', paymentStatus: 'Pago', amountPaid: 55.00, amountDue: 0, notes: '', registeredBy: 'Líder Ana Oliveira', createdAt: '2025-01-12T14:20:00' },
  { id: 'PED-003', date: '2025-01-15', buyerName: 'Ana Costa', cpf: '345.678.901-22', phone: '(81) 97777-3333', items: [{ modelId: 3, modelName: 'Camisa Escola Bíblica', size: 'P', quantity: 3, unitPrice: 45.00, subtotal: 135.00 }], total: 135.00, paymentMethod: 'Cartão', paymentStatus: 'Pendente', amountPaid: 0, amountDue: 135.00, notes: 'Pagará semana que vem', registeredBy: 'Líder Carlos Mendes', createdAt: '2025-01-15T09:15:00' },
  { id: 'PED-004', date: '2025-01-18', buyerName: 'Pedro Santos', cpf: '456.789.012-33', phone: '(81) 96666-4444', items: [{ modelId: 1, modelName: 'Camisa Oficial da Igreja 2025', size: 'GG', quantity: 1, unitPrice: 65.00, subtotal: 65.00 }, { modelId: 2, modelName: 'Camisa Ministério de Louvor', size: 'M', quantity: 1, unitPrice: 55.00, subtotal: 55.00 }], total: 120.00, paymentMethod: 'PIX', paymentStatus: 'Parcial', amountPaid: 50.00, amountDue: 70.00, notes: '', registeredBy: 'Líder Paula Ferreira', createdAt: '2025-01-18T16:45:00' },
  { id: 'PED-005', date: '2025-01-20', buyerName: 'Carla Lima', cpf: '567.890.123-44', phone: '(81) 95555-5555', items: [{ modelId: 1, modelName: 'Camisa Oficial da Igreja 2025', size: 'G', quantity: 2, unitPrice: 65.00, subtotal: 130.00 }], total: 130.00, paymentMethod: 'PIX', paymentStatus: 'Pago', amountPaid: 130.00, amountDue: 0, notes: '', registeredBy: 'Tesoureira Beatriz Lima', createdAt: '2025-01-20T11:30:00' },
  { id: 'PED-006', date: '2025-01-22', buyerName: 'Roberto Alves', cpf: '678.901.234-55', phone: '(81) 94444-6666', items: [{ modelId: 2, modelName: 'Camisa Ministério de Louvor', size: 'GG', quantity: 2, unitPrice: 55.00, subtotal: 110.00 }], total: 110.00, paymentMethod: 'Dinheiro', paymentStatus: 'Pago', amountPaid: 110.00, amountDue: 0, notes: '', registeredBy: 'Líder João Silva', createdAt: '2025-01-22T13:00:00' },
  { id: 'PED-007', date: '2025-01-25', buyerName: 'Fernanda Silva', cpf: '789.012.345-66', phone: '(81) 93333-7777', items: [{ modelId: 3, modelName: 'Camisa Escola Bíblica', size: 'M', quantity: 1, unitPrice: 45.00, subtotal: 45.00 }, { modelId: 1, modelName: 'Camisa Oficial da Igreja 2025', size: 'P', quantity: 1, unitPrice: 65.00, subtotal: 65.00 }], total: 110.00, paymentMethod: 'Cartão', paymentStatus: 'Pago', amountPaid: 110.00, amountDue: 0, notes: '', registeredBy: 'Líder Ana Oliveira', createdAt: '2025-01-25T15:20:00' },
  { id: 'PED-008', date: '2025-01-28', buyerName: 'Marcos Paulo', cpf: '890.123.456-77', phone: '(81) 92222-8888', items: [{ modelId: 1, modelName: 'Camisa Oficial da Igreja 2025', size: 'XGG', quantity: 1, unitPrice: 65.00, subtotal: 65.00 }], total: 65.00, paymentMethod: 'PIX', paymentStatus: 'Pendente', amountPaid: 0, amountDue: 65.00, notes: '', registeredBy: 'Líder Carlos Mendes', createdAt: '2025-01-28T10:00:00' },
  { id: 'PED-009', date: '2025-02-01', buyerName: 'Juliana Costa', cpf: '901.234.567-88', phone: '(81) 91111-9999', items: [{ modelId: 2, modelName: 'Camisa Ministério de Louvor', size: 'P', quantity: 2, unitPrice: 55.00, subtotal: 110.00 }], total: 110.00, paymentMethod: 'PIX', paymentStatus: 'Pago', amountPaid: 110.00, amountDue: 0, notes: '', registeredBy: 'Líder Paula Ferreira', createdAt: '2025-02-01T09:30:00' },
  { id: 'PED-010', date: '2025-02-03', buyerName: 'Ricardo Souza', cpf: '012.345.678-99', phone: '(81) 90000-0000', items: [{ modelId: 3, modelName: 'Camisa Escola Bíblica', size: 'G', quantity: 4, unitPrice: 45.00, subtotal: 180.00 }], total: 180.00, paymentMethod: 'Dinheiro', paymentStatus: 'Parcial', amountPaid: 80.00, amountDue: 100.00, notes: '', registeredBy: 'Tesoureira Beatriz Lima', createdAt: '2025-02-03T14:15:00' },
  { id: 'PED-011', date: '2025-02-05', buyerName: 'Patrícia Rodrigues', cpf: '111.222.333-44', phone: '(81) 99111-1111', items: [{ modelId: 1, modelName: 'Camisa Oficial da Igreja 2025', size: 'M', quantity: 1, unitPrice: 65.00, subtotal: 65.00 }], total: 65.00, paymentMethod: 'Cartão', paymentStatus: 'Pago', amountPaid: 65.00, amountDue: 0, notes: '', registeredBy: 'Líder João Silva', createdAt: '2025-02-05T11:45:00' },
  { id: 'PED-012', date: '2025-02-08', buyerName: 'Bruno Martins', cpf: '222.333.444-55', phone: '(81) 99222-2222', items: [{ modelId: 2, modelName: 'Camisa Ministério de Louvor', size: 'G', quantity: 1, unitPrice: 55.00, subtotal: 55.00 }, { modelId: 3, modelName: 'Camisa Escola Bíblica', size: 'GG', quantity: 1, unitPrice: 45.00, subtotal: 45.00 }], total: 100.00, paymentMethod: 'PIX', paymentStatus: 'Pago', amountPaid: 100.00, amountDue: 0, notes: '', registeredBy: 'Líder Ana Oliveira', createdAt: '2025-02-08T16:30:00' },
  { id: 'PED-013', date: '2025-02-10', buyerName: 'Luciana Ferreira', cpf: '333.444.555-66', phone: '(81) 99333-3333', items: [{ modelId: 1, modelName: 'Camisa Oficial da Igreja 2025', size: 'G', quantity: 2, unitPrice: 65.00, subtotal: 130.00 }], total: 130.00, paymentMethod: 'Dinheiro', paymentStatus: 'Pendente', amountPaid: 0, amountDue: 130.00, notes: 'Família passou por dificuldades', registeredBy: 'Líder Carlos Mendes', createdAt: '2025-02-10T10:20:00' },
  { id: 'PED-014', date: '2025-02-12', buyerName: 'Thiago Almeida', cpf: '444.555.666-77', phone: '(81) 99444-4444', items: [{ modelId: 3, modelName: 'Camisa Escola Bíblica', size: 'M', quantity: 3, unitPrice: 45.00, subtotal: 135.00 }], total: 135.00, paymentMethod: 'PIX', paymentStatus: 'Pago', amountPaid: 135.00, amountDue: 0, notes: '', registeredBy: 'Líder Paula Ferreira', createdAt: '2025-02-12T13:45:00' },
  { id: 'PED-015', date: '2025-02-15', buyerName: 'Vanessa Borges', cpf: '555.666.777-88', phone: '(81) 99555-5555', items: [{ modelId: 1, modelName: 'Camisa Oficial da Igreja 2025', size: 'P', quantity: 1, unitPrice: 65.00, subtotal: 65.00 }, { modelId: 2, modelName: 'Camisa Ministério de Louvor', size: 'M', quantity: 1, unitPrice: 55.00, subtotal: 55.00 }, { modelId: 3, modelName: 'Camisa Escola Bíblica', size: 'G', quantity: 1, unitPrice: 45.00, subtotal: 45.00 }], total: 165.00, paymentMethod: 'Cartão', paymentStatus: 'Parcial', amountPaid: 100.00, amountDue: 65.00, notes: '', registeredBy: 'Tesoureira Beatriz Lima', createdAt: '2025-02-15T15:00:00' },
  { id: 'PED-016', date: '2025-02-18', buyerName: 'André Silva', cpf: '666.777.888-99', phone: '(81) 99666-6666', items: [{ modelId: 1, modelName: 'Camisa Oficial da Igreja 2025', size: 'GG', quantity: 1, unitPrice: 65.00, subtotal: 65.00 }], total: 65.00, paymentMethod: 'PIX', paymentStatus: 'Pago', amountPaid: 65.00, amountDue: 0, notes: '', registeredBy: 'Líder João Silva', createdAt: '2025-02-18T11:10:00' }
];

const INITIAL_CASH_FLOW = [
  { id: 'CF-001', date: '2025-01-10', description: 'Venda — Maria Santos (PED-001)', type: 'entrada', category: 'Venda', method: 'PIX', amount: 130.00, orderId: 'PED-001', registeredBy: 'Líder João Silva' },
  { id: 'CF-002', date: '2025-01-12', description: 'Venda — José Oliveira (PED-002)', type: 'entrada', category: 'Venda', method: 'Dinheiro', amount: 55.00, orderId: 'PED-002', registeredBy: 'Líder Ana Oliveira' },
  { id: 'CF-003', date: '2025-01-20', description: 'Venda — Carla Lima (PED-005)', type: 'entrada', category: 'Venda', method: 'PIX', amount: 130.00, orderId: 'PED-005', registeredBy: 'Tesoureira Beatriz Lima' },
  { id: 'CF-004', date: '2025-01-22', description: 'Venda — Roberto Alves (PED-006)', type: 'entrada', category: 'Venda', method: 'Dinheiro', amount: 110.00, orderId: 'PED-006', registeredBy: 'Líder João Silva' },
  { id: 'CF-005', date: '2025-01-25', description: 'Venda — Fernanda Silva (PED-007)', type: 'entrada', category: 'Venda', method: 'Cartão', amount: 110.00, orderId: 'PED-007', registeredBy: 'Líder Ana Oliveira' },
  { id: 'CF-006', date: '2025-02-01', description: 'Venda — Juliana Costa (PED-009)', type: 'entrada', category: 'Venda', method: 'PIX', amount: 110.00, orderId: 'PED-009', registeredBy: 'Líder Paula Ferreira' },
  { id: 'CF-007', date: '2025-02-05', description: 'Venda — Patrícia Rodrigues (PED-011)', type: 'entrada', category: 'Venda', method: 'Cartão', amount: 65.00, orderId: 'PED-011', registeredBy: 'Líder João Silva' },
  { id: 'CF-008', date: '2025-02-08', description: 'Venda — Bruno Martins (PED-012)', type: 'entrada', category: 'Venda', method: 'PIX', amount: 100.00, orderId: 'PED-012', registeredBy: 'Líder Ana Oliveira' },
  { id: 'CF-009', date: '2025-02-12', description: 'Venda — Thiago Almeida (PED-014)', type: 'entrada', category: 'Venda', method: 'PIX', amount: 135.00, orderId: 'PED-014', registeredBy: 'Líder Paula Ferreira' },
  { id: 'CF-010', date: '2025-02-18', description: 'Venda — André Silva (PED-016)', type: 'entrada', category: 'Venda', method: 'PIX', amount: 65.00, orderId: 'PED-016', registeredBy: 'Líder João Silva' },
  { id: 'CF-011', date: '2025-01-15', description: 'Pagamento fornecedor de tecidos', type: 'saída', category: 'Produção', method: 'PIX', amount: 500.00, registeredBy: 'Tesoureira Beatriz Lima' },
  { id: 'CF-012', date: '2025-02-01', description: 'Transporte das camisas', type: 'saída', category: 'Transporte', method: 'Dinheiro', amount: 80.00, registeredBy: 'Líder João Silva' }
];

/* ─── UTILS ──────────────────────────────────────────────────────────────── */
const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
const maskCPF = (v) => v.replace(/\D/g, '').slice(0, 11)
  .replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
const maskPhone = (v) => v.replace(/\D/g, '').slice(0, 11)
  .replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{4})$/, '$1-$2');
const STATUS_MAP = {
  Pago:     { cls: 'badge-success', label: 'Pago' },
  Pendente: { cls: 'badge-danger',  label: 'Pendente' },
  Parcial:  { cls: 'badge-warning', label: 'Parcial' },
};

/* ─── ATOMS ──────────────────────────────────────────────────────────────── */
function Badge({ status }) {
  const s = STATUS_MAP[status] || { cls: 'badge-neutral', label: status };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

function MethodIcon({ method, size = 14 }) {
  if (method === 'PIX')      return <Smartphone size={size} />;
  if (method === 'Dinheiro') return <Banknote size={size} />;
  return <CreditCard size={size} />;
}

function StatCard({ label, value, sub, color = 'default', icon: Icon, info }) {
  const [showInfo, setShowInfo] = useState(false);
  
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        <div className="stat-card__icons">
          {info && (
            <button className="stat-card__info-btn" onClick={() => setShowInfo(!showInfo)} title="Mais informações">
              <HelpCircle size={14} />
            </button>
          )}
          {Icon && <span className={`stat-card__icon stat-icon--${color}`}><Icon size={18} /></span>}
        </div>
      </div>
      <p className="stat-card__value">{value}</p>
      {sub && <p className="stat-card__sub">{sub}</p>}
      {showInfo && info && (
        <div className="stat-card__tooltip">{info}</div>
      )}
    </div>
  );
}

function SectionCard({ title, action, children, noPad }) {
  return (
    <div className="section-card">
      {title && (
        <div className="section-card__header">
          <h3 className="section-card__title">{title}</h3>
          {action}
        </div>
      )}
      <div className={noPad ? '' : 'section-card__body'}>{children}</div>
    </div>
  );
}

function Modal({ title, onClose, children, footer, width = 600 }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className="modal-box__header">
          <span className="modal-box__title">{title}</span>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-box__body">{children}</div>
        {footer && <div className="modal-box__footer">{footer}</div>}
      </div>
    </div>
  );
}

function Toast({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}

/* ─── CHARTS ─────────────────────────────────────────────────────────────── */
function BarChart({ data }) {
  const W = 560, H = 160;
  const max = Math.max(...data.map(d => d.total), 1);
  const bw  = Math.floor(W / data.length * 0.45);
  const gap = W / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} style={{ width: '100%', display: 'block' }}>
      <line x1={0} y1={H} x2={W} y2={H} stroke="var(--border)" strokeWidth="1" />
      {data.map((d, i) => {
        const bh = Math.max((d.total / max) * H, d.total > 0 ? 4 : 0);
        const x  = i * gap + (gap - bw) / 2;
        const y  = H - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="5" className="bar-rect" />
            <text x={x + bw / 2} y={H + 18} textAnchor="middle" fontSize="11" className="chart-label">
              {d.date}
            </text>
            {d.total > 0 && (
              <text x={x + bw / 2} y={y - 6} textAnchor="middle" fontSize="10" fontWeight="700" className="bar-value">
                {d.total.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ data, size = 140 }) {
  const total  = data.reduce((a, d) => a + d.value, 0);
  const COLORS = ['#0d1117', '#c8922a', '#15803d', '#1e40af'];
  const cx = size / 2, cy = size / 2, r = size / 2 - 14, ir = r * 0.58;
  const slices = data.reduce((acc, d, i) => {
    const prevAngle = i === 0 ? -Math.PI / 2 : acc[i - 1].endAngle;
    const sweep = (d.value / total) * 2 * Math.PI;
    const startAngle = prevAngle;
    const endAngle = prevAngle + sweep;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const lf  = sweep > Math.PI ? 1 : 0;
    const ix1 = cx + ir * Math.cos(endAngle - sweep), iy1 = cy + ir * Math.sin(endAngle - sweep);
    const ix2 = cx + ir * Math.cos(endAngle), iy2 = cy + ir * Math.sin(endAngle);
    acc.push({ path: `M${x1},${y1} A${r},${r} 0 ${lf},1 ${x2},${y2} L${ix2},${iy2} A${ir},${ir} 0 ${lf},0 ${ix1},${iy1}Z`, color: COLORS[i % COLORS.length], endAngle, ...d });
    return acc;
  }, []);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
      <circle cx={cx} cy={cy} r={ir - 2} fill="var(--surface)" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="var(--text-3)">Total</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text)">
        {total.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </text>
    </svg>
  );
}

/* ─── APP ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [view, setView]           = useState('dashboard');
  const [orders, setOrders]       = useState([]);
  const [models, setModels]       = useState([]);
  const [cashFlow, setCashFlow]   = useState([]);
  const [toasts, setToasts]       = useState([]);
  const [sidebarOpen, setSidebar] = useState(false);

  // Carregar dados do banco ao inicializar
  useEffect(() => {
    const loadData = async () => {
      try {
        await initSettings();
        const [ordersData, modelsData, cashFlowData] = await Promise.all([
          getOrders(),
          getShirtModels(),
          getCashFlow()
        ]);
        setOrders(ordersData);
        setModels(modelsData);
        setCashFlow(cashFlowData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    loadData();
  }, []);

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const totalReceived    = orders.reduce((a, o) => a + o.amountPaid, 0);
    const totalPending     = orders.reduce((a, o) => a + o.amountDue, 0);
    const totalUnits       = orders.reduce((a, o) => a + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    const pendingCount     = orders.filter(o => o.paymentStatus !== 'Pago').length;
    const todayOrders      = orders.filter(o => o.date === today).length;
    const estimatedProfit  = orders.reduce((a, o) => a + o.items.reduce((s, i) => {
      const m = models.find(m => m.id === i.modelId);
      return s + (i.unitPrice - (m?.cost ?? 0)) * i.quantity;
    }, 0), 0);
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().slice(0, 10);
      return {
        date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        total: orders.filter(o => o.date === ds).reduce((s, o) => s + o.amountPaid, 0)
      };
    });
    return { totalReceived, totalPending, totalUnits, pendingCount, todayOrders, estimatedProfit, last7Days };
  }, [orders, models]);

  const lowStock = useMemo(() =>
    models.flatMap(m =>
      Object.entries(m.stock)
        .filter(([, q]) => q > 0 && q <= 3)
        .map(([size, qty]) => ({ name: m.name, size, qty }))
    ), [models]);

  const nav = [
    { id: 'dashboard', label: 'Dashboard',      icon: LayoutDashboard },
    { id: 'new-order', label: 'Novo Pedido',    icon: Plus },
    { id: 'orders',    label: 'Pedidos',         icon: ShoppingCart },
    { id: 'clients',   label: 'Clientes',        icon: Users },
    { id: 'cashflow',  label: 'Fluxo de Caixa', icon: DollarSign },
    { id: 'stock',     label: 'Estoque',         icon: Package },
    { id: 'reports',   label: 'Relatórios',      icon: FileText },
    { id: 'settings',  label: 'Configurações',   icon: Settings },
  ];
  const viewTitles = Object.fromEntries(nav.map(n => [n.id, n.label]));

  return (
    <div className="layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebar(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <div className="sidebar__cross"><span /><span /></div>
          <div>
            <p className="sidebar__church">Igreja Batista</p>
            <p className="sidebar__module">Gestão de Camisas</p>
          </div>
        </div>
        <nav className="sidebar__nav">
          <button
            className="nav-btn"
            onClick={() => window.location.href = '/loja.html'}
            style={{ background: '#c8922a', color: 'white', marginBottom: 8 }}
          >
            <Store size={17} />
            <span>Acessar Loja</span>
          </button>
          {nav.map(n => (
            <button
              key={n.id}
              className={`nav-btn ${view === n.id ? 'nav-btn--active' : ''}`}
              onClick={() => { setView(n.id); setSidebar(false); }}
            >
              <n.icon size={17} />
              <span>{n.label}</span>
              <span className="nav-btn__dot" />
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__version">v2.0 · 2025</div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar__left">
            <button className="icon-btn topbar__burger" onClick={() => setSidebar(!sidebarOpen)}>
              <Menu size={22} />
            </button>
            <div>
              <h1 className="topbar__title">{viewTitles[view]}</h1>
              <p className="topbar__date">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="topbar__right">
            {stats.pendingCount > 0 && (
              <button className="topbar__alert" onClick={() => setView('orders')}>
                <AlertTriangle size={14} />
                {stats.pendingCount} pendência{stats.pendingCount > 1 ? 's' : ''}
              </button>
            )}
            <button 
              onClick={() => window.location.href = '/'} 
              className="btn btn--ghost btn--sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <User size={16} />
              Sair
            </button>
          </div>
        </header>

        <div className="page">
          {view === 'dashboard' && <DashboardView stats={stats} orders={orders} lowStock={lowStock} setView={setView} />}
          {view === 'new-order' && <NewOrderView models={models} setModels={setModels} orders={orders} setOrders={setOrders} setCashFlow={setCashFlow} toast={toast} setView={setView} />}
          {view === 'orders'    && <OrdersView orders={orders} setOrders={setOrders} models={models} setModels={setModels} setCashFlow={setCashFlow} toast={toast} />}
          {view === 'clients'   && <ClientsView toast={toast} orders={orders} />}
          {view === 'cashflow'  && <CashFlowView cashFlow={cashFlow} setCashFlow={setCashFlow} toast={toast} />}
          {view === 'stock'     && <StockView models={models} setModels={setModels} orders={orders} toast={toast} />}
          {view === 'reports'   && <ReportsView orders={orders} models={models} cashFlow={cashFlow} />}
          {view === 'settings'  && <SettingsView toast={toast} />}
        </div>
      </main>

      <Toast toasts={toasts} />
    </div>
  );
}

/* ─── DASHBOARD ──────────────────────────────────────────────────────────── */
function DashboardView({ stats, orders, lowStock, setView }) {
  return (
    <div className="dashboard">
      <div className="stat-grid">
        <StatCard label="Total Arrecadado"  value={fmt(stats.totalReceived)}   sub="Pagamentos recebidos"        color="green"   icon={TrendingUp} />
        <StatCard label="A Receber"          value={fmt(stats.totalPending)}    sub={`${stats.pendingCount} pedido(s)`} color="amber" icon={Clock} />
        <StatCard label="Camisas Vendidas"   value={stats.totalUnits}           sub="Unidades no total"          color="blue"    icon={PackageCheck} />
        <StatCard label="Lucro Estimado"     value={fmt(stats.estimatedProfit)} sub="Margem líquida"             color="teal"    icon={ArrowUpRight} />
        <StatCard label="Pedidos Hoje"       value={stats.todayOrders}          sub="Registrados hoje"           color="default" icon={ShoppingCart} />
        <StatCard label="Pendências"         value={stats.pendingCount}         sub="Com saldo devedor"          color="red"     icon={AlertTriangle} />
      </div>

      <div className="dashboard__charts">
        <SectionCard title="Últimos pedidos" noPad>
          <table className="mini-table mini-table--centered">
            <thead>
              <tr><th>ID</th><th>Comprador</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map(o => (
                <tr key={o.id}>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>{o.id}</td>
                    <td style={{ fontWeight: 500 }}>{o.buyerName}</td>
                  <td className="mono" style={{ fontWeight: 600 }}>{fmt(o.total)}</td>
                  <td><Badge status={o.paymentStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Alertas">
          <div className="alerts">
            {lowStock.length === 0 && stats.pendingCount === 0 ? (
              <div className="alert alert--ok"><PackageCheck size={15} /> Tudo em ordem</div>
            ) : (
              <>
                {lowStock.map((a, i) => (
                  <div key={i} className="alert alert--warn">
                    <AlertTriangle size={14} />
                    <span>{a.name} — tam. <strong>{a.size}</strong>: {a.qty} un.</span>
                  </div>
                ))}
                {stats.pendingCount > 0 && (
                  <div className="alert alert--danger" style={{ cursor: 'pointer' }} onClick={() => setView('orders')}>
                    <Clock size={14} />
                    <span>{stats.pendingCount} pedido(s) com pagamento pendente</span>
                  </div>
                )}
              </>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ─── NOVO PEDIDO ────────────────────────────────────────────────────────── */
function NewOrderView({ models, setModels, orders, setOrders, setCashFlow, toast, setView }) {
  const emptyItem = () => ({ modelId: '', size: '', quantity: 1, unitPrice: 0, subtotal: 0 });
  const [leaders, setLeaders]     = useState([]);
  const [form, setForm]         = useState({ buyerName: '', cpf: '', phone: '', date: new Date().toISOString().slice(0, 10), leader: '', notes: '' });
  const [items, setItems]       = useState([emptyItem()]);
  const [discount, setDiscount] = useState(0);
  const [method, setMethod]     = useState('PIX');
  const [status, setStatus]     = useState('Pago');
  const [amtPaid, setAmtPaid]   = useState('');

  // Carregar líderes do banco
  useEffect(() => {
    const loadLeaders = async () => {
      const leadersData = await getLeaders();
      const leaderNames = leadersData.map(l => l.name);
      setLeaders(leaderNames);
      if (leaderNames.length > 0) {
        setForm(prev => ({ ...prev, leader: prev.leader || leaderNames[0] }));
      }
    };
    loadLeaders();
  }, []);

  const subtotal = items.reduce((a, i) => a + i.subtotal, 0);
  const total    = subtotal * (1 - discount / 100);

  const setItem = (idx, patch) => setItems(p => p.map((it, i) => {
    if (i !== idx) return it;
    const up = { ...it, ...patch };
    const qty   = up.quantity  === '' ? '' : (parseFloat(up.quantity)  || 0);
    const price = up.unitPrice === '' ? '' : (parseFloat(up.unitPrice) || 0);
    up.quantity = qty; up.unitPrice = price;
    up.subtotal = (typeof qty === 'number' ? qty : 0) * (typeof price === 'number' ? price : 0);
    return up;
  }));

  const onModel = (idx, modelId) => {
    const m = models.find(m => m.id === +modelId);
    setItem(idx, { modelId: +modelId, modelName: m?.name || '', size: '', unitPrice: m?.price || 0, subtotal: m?.price || 0 });
  };

  const save = async () => {
    if (!form.buyerName.trim() || !form.phone.trim()) { toast('Preencha nome e telefone', 'error'); return; }
    const valid = items.filter(i => i.modelId && i.size && i.quantity > 0);
    if (!valid.length) { toast('Adicione pelo menos um item válido', 'error'); return; }
    for (const it of valid) {
      const m = models.find(m => m.id === it.modelId);
      if ((m?.stock[it.size] ?? 0) < it.quantity) { toast(`Estoque insuficiente: ${m?.name} tam. ${it.size}`, 'error'); return; }
    }
    const id = `PED-${String(Math.max(...orders.map(o => +o.id.replace('PED-', '')), 0) + 1).padStart(3, '0')}`;
    const paid   = status === 'Pago' ? total : status === 'Parcial' ? (parseFloat(amtPaid) || 0) : 0;
    const due    = Math.max(0, total - paid);
    const pStatus = due <= 0 ? 'Pago' : paid > 0 ? 'Parcial' : 'Pendente';
    const newOrder = { id, date: form.date, buyerName: form.buyerName, cpf: form.cpf, phone: form.phone, items: valid, total, paymentMethod: method, paymentStatus: pStatus, amountPaid: paid, amountDue: due, notes: form.notes, registeredBy: form.leader, createdAt: new Date().toISOString() };
    
    // Atualizar estoque localmente e no banco
    const updatedModels = [];
    for (const m of models) {
      const rel = valid.filter(i => i.modelId === m.id);
      if (!rel.length) {
        updatedModels.push(m);
        continue;
      }
      const s = { ...m.stock };
      rel.forEach(i => { s[i.size] = (s[i.size] || 0) - i.quantity; });
      // Salvar no banco
      if (m.id) await dbUpdateModelStock(m.id, s);
      updatedModels.push({ ...m, stock: s });
    }
    setModels(updatedModels);
    
    // Salvar pedido no banco
    await dbAddOrder(newOrder);
    
    // Registrar entrada no fluxo de caixa
    if (paid > 0) {
      const cashEntry = { id: `CF-${Date.now()}`, date: form.date, description: `Venda — ${form.buyerName} (${id})`, type: 'entrada', category: 'Venda', method, amount: paid, orderId: id, registeredBy: form.leader };
      await dbAddCashFlow(cashEntry);
      setCashFlow(p => [cashEntry, ...p]);
    }
    
    setOrders(p => [newOrder, ...p]);
    toast(`Pedido ${id} salvo com sucesso!`, 'success');
    setForm({ buyerName: '', cpf: '', phone: '', date: new Date().toISOString().slice(0, 10), leader: LEADERS[0], notes: '' });
    setItems([emptyItem()]); setDiscount(0); setMethod('PIX'); setStatus('Pago'); setAmtPaid('');
    setView('orders');
  };

  return (
    <div className="form-page">
      <SectionCard title="Dados do comprador">
        <div className="field">
          <label>Nome completo <span className="req">*</span></label>
          <input value={form.buyerName} onChange={e => setForm({...form, buyerName: e.target.value})} placeholder="Ex: Maria da Silva" />
        </div>
        <div className="form-row" style={{ marginTop: 14 }}>
          <div className="field">
            <label>CPF</label>
            <input value={form.cpf} onChange={e => setForm({...form, cpf: maskCPF(e.target.value)})} placeholder="000.000.000-00" />
          </div>
          <div className="field">
            <label>Telefone <span className="req">*</span></label>
            <input value={form.phone} onChange={e => setForm({...form, phone: maskPhone(e.target.value)})} placeholder="(81) 99999-9999" />
          </div>
        </div>
        <div className="form-row" style={{ marginTop: 14 }}>
          <div className="field">
            <label>Data</label>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="field">
            <label>Registrado por</label>
            <select value={form.leader} onChange={e => setForm({...form, leader: e.target.value})}>
              {leaders.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label>Observações</label>
          <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Opcional" />
        </div>
      </SectionCard>

      <SectionCard title="Itens do pedido">
        <div className="items-list">
          {items.map((item, idx) => (
            <div key={idx} className="item-row">
              <div className="field field--grow2">
                <label>Modelo</label>
                <select value={item.modelId} onChange={e => onModel(idx, e.target.value)}>
                  <option value="">Selecione</option>
                  {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="field field--md">
                <label>Tam.</label>
                <select value={item.size} onChange={e => setItem(idx, { size: e.target.value })} disabled={!item.modelId}>
                  <option value="">—</option>
                  {models.find(m => m.id === item.modelId)?.sizes.map(s => (
                    <option key={s} value={s}>{s} {(models.find(m => m.id === item.modelId)?.stock[s] ?? 0) === 0 ? '(esg.)' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="field field--md">
                <label>Qtd {item.modelId && item.size ? `(máx: ${models.find(m => m.id === item.modelId)?.stock[item.size] ?? 0})` : ''}</label>
                <input type="text" inputMode="numeric" value={item.quantity}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '');
                    const maxStock = item.modelId && item.size ? (models.find(m => m.id === item.modelId)?.stock[item.size] ?? 0) : 999;
                    if (v === '') {
                      setItem(idx, { quantity: v });
                    } else {
                      const qty = parseInt(v);
                      if (qty <= maxStock) {
                        setItem(idx, { quantity: v });
                      }
                    }
                  }}
                  onBlur={e => { if (e.target.value === '') setItem(idx, { quantity: '1' }); }} />
              </div>
              <div className="field field--lg">
                <label>Preço</label>
                <input type="text" inputMode="decimal" value={item.unitPrice}
                  onChange={e => { const v = e.target.value.replace(/[^\d,]/g, '').replace(',', '.'); if (v === '' || !isNaN(parseFloat(v))) setItem(idx, { unitPrice: v }); }}
                  onBlur={e => { if (e.target.value === '') setItem(idx, { unitPrice: '0' }); }} />
              </div>
              <div className="field field--lg">
                <label>Subtotal</label>
                <div className="input-static">{fmt(item.subtotal)}</div>
              </div>
              <button className="icon-btn icon-btn--danger item-remove"
                onClick={() => setItems(p => p.filter((_, i) => i !== idx))}
                disabled={items.length === 1}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button className="btn btn--ghost btn--sm" onClick={() => setItems(p => [...p, emptyItem()])}>
          <Plus size={15} /> Adicionar item
        </button>

        <div className="order-summary">
          <div className="summary-left">
            <div className="payment-grid">
              <div className="payment-section">
                <span className="payment-label">Método de pagamento</span>
                <div className="payment-options">
                  {['PIX', 'Dinheiro', 'Cartão'].map(m => (
                    <button key={m} className={`payment-btn ${method === m ? 'payment-btn--active' : ''}`} onClick={() => setMethod(m)}>
                      <MethodIcon method={m} size={14} /><span>{m}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="payment-section">
                <span className="payment-label">Status</span>
                <div className="payment-options">
                  {[['Pago', 'Pago'], ['Pendente', 'Pendente'], ['Parcial', 'Parcial']].map(([val, lbl]) => (
                    <button key={val} className={`payment-btn ${status === val ? 'payment-btn--active' : ''}`}
                      onClick={() => { setStatus(val); if (val === 'Pago') setAmtPaid(total); }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              {status === 'Parcial' && (
                <div className="payment-section">
                  <span className="payment-label">Valor recebido</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input type="text" inputMode="decimal" className="payment-input" value={amtPaid}
                      onChange={e => { const v = e.target.value.replace(/[^\d,]/g, '').replace(',', '.'); if (v === '' || !isNaN(parseFloat(v))) setAmtPaid(v); }}
                      placeholder="0,00" />
                    <span className="payment-rest">Restante: <strong>{fmt(Math.max(0, total - (parseFloat(amtPaid) || 0)))}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="summary-right">
            <div className="summary-row"><span>Subtotal</span><span className="mono">{fmt(subtotal)}</span></div>
            <div className="summary-row">
              <span>Desconto %</span>
              <input type="text" inputMode="numeric" value={discount}
                onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v === '' || parseInt(v) <= 100) setDiscount(v); }}
                onBlur={e => { if (e.target.value === '') setDiscount(0); }}
                className="summary-input" />
            </div>
            <div className="summary-total"><span>Total</span><span>{fmt(total)}</span></div>
            <div className="summary-actions">
              <button className="btn btn--ghost" onClick={() => { setForm({ buyerName: '', cpf: '', phone: '', date: new Date().toISOString().slice(0, 10), leader: LEADERS[0], notes: '' }); setItems([emptyItem()]); }}>
                Limpar
              </button>
              <button className="btn btn--primary" onClick={save}>
                <Check size={16} /> Salvar
              </button>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function SortIcon({ sortField, sortDirection, field }) {
  if (sortField !== field) return null;
  return sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
}

/* ─── PEDIDOS ────────────────────────────────────────────────────────────── */
function OrdersView({ orders, setOrders, models, setModels, setCashFlow, toast }) {
  const [search, setSearch]     = useState('');
  const [stFilter, setStFilter] = useState('all');
  const [mthFilter, setMth]     = useState('all');
  const [dateFrom, setFrom]     = useState('');
  const [dateTo, setTo]         = useState('');
  const [sortF, setSortF]       = useState('date');
  const [sortD, setSortD]       = useState('desc');
  const [page, setPage]         = useState(1);
  const [pgSize, setPgSize]     = useState(10);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(null);
  const [payModal, setPayModal] = useState(null);

  const filtered = useMemo(() => {
    let r = orders;
    if (search) { const q = search.toLowerCase(); r = r.filter(o => o.buyerName.toLowerCase().includes(q) || (o.cpf||'').includes(q) || o.phone.includes(q) || o.id.includes(q)); }
    if (stFilter !== 'all') r = r.filter(o => o.paymentStatus === stFilter);
    if (mthFilter !== 'all') r = r.filter(o => o.paymentMethod === mthFilter);
    if (dateFrom) r = r.filter(o => o.date >= dateFrom);
    if (dateTo)   r = r.filter(o => o.date <= dateTo);
    return [...r].sort((a, b) => {
      const av = a[sortF], bv = b[sortF];
      return sortD === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [orders, search, stFilter, mthFilter, dateFrom, dateTo, sortF, sortD]);

  const pages = Math.ceil(filtered.length / pgSize) || 1;
  const paged = filtered.slice((page - 1) * pgSize, page * pgSize);

  const sortBy = (f) => { if (sortF === f) setSortD(d => d === 'asc' ? 'desc' : 'asc'); else { setSortF(f); setSortD('asc'); } };

  const exportCSV = () => {
    const h = ['ID','Data','Comprador','CPF','Telefone','Total','Pago','Restante','Método','Status','Líder'];
    const rows = filtered.map(o => [o.id, fmtDate(o.date), o.buyerName, o.cpf||'', o.phone, o.total.toFixed(2).replace('.',','), o.amountPaid.toFixed(2).replace('.',','), o.amountDue.toFixed(2).replace('.',','), o.paymentMethod, o.paymentStatus, o.registeredBy]);
    const csv = [h, ...rows].map(r => r.map(c => `"${c}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `pedidos_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    toast('CSV exportado!', 'success');
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancelar este pedido?')) return;
    const o = orders.find(o => o.id === id);
    
    // Restaurar estoque localmente e no banco
    const updatedModels = [];
    for (const m of models) {
      const rel = o.items.filter(i => i.modelId === m.id);
      if (!rel.length) {
        updatedModels.push(m);
        continue;
      }
      const s = { ...m.stock };
      rel.forEach(i => { s[i.size] = (s[i.size] || 0) + i.quantity; });
      // Salvar no banco
      if (m.id) await dbUpdateModelStock(m.id, s);
      updatedModels.push({ ...m, stock: s });
    }
    setModels(updatedModels);
    
    // Deletar do banco
    await dbDeleteOrder(id);
    setOrders(p => p.filter(o => o.id !== id));
    toast(`Pedido ${id} cancelado`, 'warning');
  };

  const registerPayment = async (orderId, amount, method, date) => {
    const o = orders.find(o => o.id === orderId);
    const paid2 = o.amountPaid + amount;
    const due2  = Math.max(0, o.total - paid2);
    const newStatus = due2 <= 0 ? 'Pago' : 'Parcial';
    
    // Atualizar no banco
    await dbUpdateOrderStatus(orderId, newStatus, paid2, due2);
    
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return { ...order, amountPaid: paid2, amountDue: due2, paymentStatus: newStatus, paymentMethod: method };
    }));
    
    const cashEntry = { id: `CF-${Date.now()}`, date, description: `Pagamento recebido — ${o?.buyerName} (${orderId})`, type: 'entrada', category: 'Venda', method, amount, orderId, registeredBy: 'Tesoureira' };
    await dbAddCashFlow(cashEntry);
    setCashFlow(p => [cashEntry, ...p]);
    
    toast(`Pagamento de ${fmt(amount)} registrado!`, 'success');
    setPayModal(null);
  };

  return (
    <>
      <div className="filters-bar">
        <div className="filter-field filter-field--wide" style={{ position: 'relative' }}>
          <input className="filter-input" style={{ paddingLeft: 38 }} placeholder="Buscar por nome, CPF, telefone ou ID…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }} />
        </div>
        <select className="filter-select" value={stFilter} onChange={e => { setStFilter(e.target.value); setPage(1); }}>
          <option value="all">Todos os status</option>
          <option value="Pago">Pago</option>
          <option value="Pendente">Pendente</option>
          <option value="Parcial">Parcial</option>
        </select>
        <select className="filter-select" value={mthFilter} onChange={e => { setMth(e.target.value); setPage(1); }}>
          <option value="all">Todos os métodos</option>
          <option value="PIX">PIX</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Cartão">Cartão</option>
        </select>
        <input type="date" className="filter-select" value={dateFrom} onChange={e => { setFrom(e.target.value); setPage(1); }} />
        <input type="date" className="filter-select" value={dateTo}   onChange={e => { setTo(e.target.value); setPage(1); }} />
        <button className="btn btn--ghost btn--sm" onClick={() => { setSearch(''); setStFilter('all'); setMth('all'); setFrom(''); setTo(''); setPage(1); }}>
          <X size={14} /> Limpar
        </button>
        <button className="btn btn--outline btn--sm" onClick={exportCSV}>
          <Download size={14} /> CSV
        </button>
      </div>

      <p className="results-count">{filtered.length} pedido(s) encontrado(s)</p>

      <SectionCard noPad>
        <div className="table-scroll">
          <table className="data-table data-table--centered">
            <thead>
              <tr>
                <th onClick={() => sortBy('id')}>ID <SortIcon sortField={sortF} sortDirection={sortD} field="id" /></th>
                <th onClick={() => sortBy('date')}>Data <SortIcon sortField={sortF} sortDirection={sortD} field="date" /></th>
                <th onClick={() => sortBy('buyerName')}>Comprador <SortIcon sortField={sortF} sortDirection={sortD} field="buyerName" /></th>
                <th>CPF</th><th>Telefone</th><th>Itens</th>
                <th onClick={() => sortBy('total')}>Total <SortIcon sortField={sortF} sortDirection={sortD} field="total" /></th>
                <th>Pago</th><th>Restante</th><th>Método</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(o => (
                <React.Fragment key={o.id}>
                  <tr className={expanded === o.id ? 'row--expanded' : ''}>
                    <td><span className="mono text-muted" style={{ fontSize: 12 }}>{o.id}</span></td>
                    <td>{fmtDate(o.date)}</td>
                    <td className="text-strong">{o.buyerName}</td>
                    <td className="text-muted">{o.cpf || '—'}</td>
                    <td className="text-muted">{o.phone}</td>
                    <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="mono">{fmt(o.total)}</td>
                    <td className="mono text-success">{fmt(o.amountPaid)}</td>
                    <td className={`mono ${o.amountDue > 0 ? 'text-danger' : 'text-muted'}`}>{fmt(o.amountDue)}</td>
                    <td>
                      <span className="method-chip">
                        <MethodIcon method={o.paymentMethod} size={13} /> {o.paymentMethod}
                      </span>
                    </td>
                    <td><Badge status={o.paymentStatus} /></td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" title="Detalhes" onClick={() => setModal(o)}><Eye size={15} /></button>
                        {o.amountDue > 0 && <button className="icon-btn icon-btn--success" title="Pagamento" onClick={() => setPayModal(o)}><Banknote size={15} /></button>}
                        <button className="icon-btn icon-btn--danger" title="Cancelar" onClick={() => cancel(o.id)}><Trash2 size={15} /></button>
                        <button className="icon-btn" title="Expandir" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                          {expanded === o.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr key={o.id + '-exp'} className="row--detail">
                      <td colSpan={12}>
                        <div className="row-detail-body">
                          <div className="row-detail-items">
                            {o.items.map((it, i) => (
                              <span key={i} className="item-chip">{it.quantity}× {it.modelName} — {it.size} — {fmt(it.subtotal)}</span>
                            ))}
                          </div>
                          {o.notes && <p className="row-detail-notes">Obs: {o.notes}</p>}
                          <p className="row-detail-leader">Registrado por: {o.registeredBy}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={12} className="empty-row">Nenhum pedido encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <div className="pagination__info">{filtered.length} registros</div>
          <div className="pagination__controls">
            <button onClick={() => setPage(1)} disabled={page === 1}><ChevronLeft size={14} /><ChevronLeft size={14} /></button>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, pages - 4)) + i;
              return p <= pages ? <button key={p} className={page === p ? 'pg-active' : ''} onClick={() => setPage(p)}>{p}</button> : null;
            })}
            <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}><ChevronRight size={14} /></button>
            <button onClick={() => setPage(pages)} disabled={page === pages}><ChevronRight size={14} /><ChevronRight size={14} /></button>
          </div>
          <select value={pgSize} onChange={e => { setPgSize(+e.target.value); setPage(1); }} className="pg-size">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </SectionCard>

      {modal && (
        <Modal title={`Pedido ${modal.id}`} onClose={() => setModal(null)}
          footer={
            <>
              {modal.amountDue > 0 && <button className="btn btn--success" onClick={() => { setModal(null); setPayModal(modal); }}><Banknote size={15} /> Registrar pagamento</button>}
              <button className="btn btn--ghost" onClick={() => setModal(null)}>Fechar</button>
            </>
          }>
          <div className="modal-detail">
            <div className="modal-detail__section">
              <h4 className="modal-detail__title">Dados do Comprador</h4>
              <div className="modal-detail__grid">
                {[['Nome', modal.buyerName], ['CPF', modal.cpf || '—'], ['Telefone', modal.phone], ['Data', fmtDate(modal.date)], ['Método', modal.paymentMethod], ['Registrado por', modal.registeredBy]].map(([label, value]) => (
                  <div key={label} className="modal-detail__row">
                    <span className="modal-detail__label">{label}</span>
                    <span className="modal-detail__value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-detail__section">
              <h4 className="modal-detail__title">Itens do Pedido</h4>
              <div className="modal-detail__items">
                {modal.items.map((it, i) => (
                  <div key={i} className="modal-detail__item">
                    <div className="modal-detail__item-info">
                      <span className="modal-detail__item-qty">{it.quantity}×</span>
                      <span className="modal-detail__item-name">{it.modelName}</span>
                      <span className="modal-detail__item-size">Tam. {it.size}</span>
                    </div>
                    <span className="modal-detail__item-price mono">{fmt(it.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-detail__section modal-detail__section--totals">
              {[['Total', modal.total, ''], ['Pago', modal.amountPaid, '--success'], ['Restante', modal.amountDue, '--danger']].map(([label, val, cls]) => (
                <div key={label} className={`modal-detail__total-row modal-detail__total-row${cls}`}>
                  <span>{label}</span>
                  <span className="mono">{fmt(val)}</span>
                </div>
              ))}
              <div className="modal-detail__total-row modal-detail__total-row--badge">
                <span>Status</span>
                <Badge status={modal.paymentStatus} />
              </div>
            </div>
            {modal.notes && (
              <div className="modal-detail__notes">
                <span className="modal-detail__notes-label">Observações</span>
                <span className="modal-detail__notes-text">{modal.notes}</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {payModal && (
        <Modal title="Registrar pagamento" onClose={() => setPayModal(null)} width={400}>
          <div className="pay-modal-info">
            {[['Total do pedido', payModal.total, ''], ['Já pago', payModal.amountPaid, '--success'], ['Restante', payModal.amountDue, '--danger']].map(([label, val, cls]) => (
              <div key={label} className={`pay-modal-info__row pay-modal-info__row${cls}`}>
                <span>{label}</span>
                <span className="mono">{fmt(val)}</span>
              </div>
            ))}
          </div>
          <PayForm order={payModal} onSubmit={(a, m, d) => registerPayment(payModal.id, a, m, d)} />
        </Modal>
      )}
    </>
  );
}

function PayForm({ order, onSubmit }) {
  const [amount, setAmount] = useState(order.amountDue);
  const [method, setMethod] = useState(order.paymentMethod);
  const [date, setDate]     = useState(new Date().toISOString().slice(0, 10));
  return (
    <div className="form-grid form-grid--1">
      <div className="field">
        <label>Valor</label>
        <input type="text" inputMode="decimal" value={amount}
          onChange={e => { const v = e.target.value.replace(/[^\d,]/g, '').replace(',', '.'); if (v === '' || !isNaN(parseFloat(v))) setAmount(v); }}
          onBlur={e => { if (e.target.value === '') setAmount('0'); }} />
      </div>
      <div className="field">
        <label>Método</label>
        <select value={method} onChange={e => setMethod(e.target.value)}>
          <option>PIX</option><option>Dinheiro</option><option>Cartão</option>
        </select>
      </div>
      <div className="field">
        <label>Data</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <button className="btn btn--success pay-modal-btn" onClick={() => onSubmit(amount, method, date)}>
        <Check size={15} /> Confirmar pagamento
      </button>
    </div>
  );
}

/* ─── FLUXO DE CAIXA ─────────────────────────────────────────────────────── */
function CashFlowView({ cashFlow, setCashFlow, toast }) {
  const [typeF, setTypeF] = useState('all');
  const [mthF, setMthF]   = useState('all');
  const [from, setFrom]   = useState('');
  const [to, setTo]       = useState('');
  const [modal, setModal] = useState(false);

  const filtered = useMemo(() => {
    let r = cashFlow;
    if (typeF !== 'all') r = r.filter(c => c.type === typeF);
    if (mthF  !== 'all') r = r.filter(c => c.method === mthF);
    if (from) r = r.filter(c => c.date >= from);
    if (to)   r = r.filter(c => c.date <= to);
    return [...r].sort((a, b) => b.date.localeCompare(a.date));
  }, [cashFlow, typeF, mthF, from, to]);

  const totals = useMemo(() => {
    const ent = filtered.filter(c => c.type === 'entrada').reduce((a, c) => a + c.amount, 0);
    const sai = filtered.filter(c => c.type === 'saída').reduce((a, c)  => a + c.amount, 0);
    return { ent, sai, saldo: ent - sai };
  }, [filtered]);

  const addExpense = ({ description, amount, date, category, method }) => {
    setCashFlow(p => [{ id: `CF-${Date.now()}`, date, description, type: 'saída', category, method, amount, registeredBy: 'Tesoureira' }, ...p]);
    toast('Saída registrada!', 'success');
    setModal(false);
  };

  const rows = filtered.reduce((acc, c) => {
    const prevRunning = acc.length > 0 ? acc[acc.length - 1].running : 0;
    const running = c.type === 'entrada' ? prevRunning + c.amount : prevRunning - c.amount;
    acc.push({ ...c, running });
    return acc;
  }, []);

  return (
    <>
      <div className="stat-grid stat-grid--3">
        <StatCard label="Entradas" value={fmt(totals.ent)}   color="green" icon={ArrowUpRight} />
        <StatCard label="Saídas"   value={fmt(totals.sai)}   color="red"   icon={ArrowDownRight} />
        <StatCard label="Saldo"    value={fmt(totals.saldo)} color={totals.saldo >= 0 ? 'teal' : 'red'} icon={DollarSign} />
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={typeF} onChange={e => setTypeF(e.target.value)}>
          <option value="all">Todos os tipos</option>
          <option value="entrada">Entradas</option>
          <option value="saída">Saídas</option>
        </select>
        <select className="filter-select" value={mthF} onChange={e => setMthF(e.target.value)}>
          <option value="all">Todos os métodos</option>
          <option value="PIX">PIX</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Cartão">Cartão</option>
        </select>
        <input type="date" className="filter-select" value={from} onChange={e => setFrom(e.target.value)} />
        <input type="date" className="filter-select" value={to}   onChange={e => setTo(e.target.value)} />
        <button className="btn btn--ghost btn--sm" onClick={() => { setTypeF('all'); setMthF('all'); setFrom(''); setTo(''); }}>
          <X size={14} /> Limpar
        </button>
        <button className="btn btn--primary btn--sm" style={{ marginLeft: 'auto' }} onClick={() => setModal(true)}>
          <Plus size={15} /> Registrar saída
        </button>
      </div>

      <SectionCard noPad>
        <div className="table-scroll">
          <table className="data-table data-table--centered">
            <thead>
              <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Método</th><th>Valor</th><th>Saldo acumulado</th></tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.id}>
                  <td>{fmtDate(c.date)}</td>
                  <td>{c.description}</td>
                  <td><span className="tag">{c.category}</span></td>
                  <td><span className="method-chip"><MethodIcon method={c.method} size={13} /> {c.method}</span></td>
                  <td className={`mono cf-val cf-${c.type}`}>
                    {c.type === 'entrada' ? '+' : '−'} {fmt(c.amount)}
                  </td>
                  <td className={`mono ${c.running >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(c.running)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="empty-row">Nenhum lançamento encontrado</td></tr>}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {modal && (
        <Modal title="Registrar saída" onClose={() => setModal(false)} width={440}>
          <ExpenseForm onSubmit={addExpense} />
        </Modal>
      )}
    </>
  );
}

function ExpenseForm({ onSubmit }) {
  const [desc, setDesc]     = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate]     = useState(new Date().toISOString().slice(0, 10));
  const [cat, setCat]       = useState('Outros');
  const [method, setMethod] = useState('Dinheiro');
  return (
    <div className="form-grid form-grid--1">
      <div className="field"><label>Descrição <span className="req">*</span></label><input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Pagamento fornecedor" /></div>
      <div className="form-grid form-grid--2">
        <div className="field"><label>Valor <span className="req">*</span></label><input type="text" inputMode="decimal" value={amount} onChange={e => { const v = e.target.value.replace(/[^\d,]/g, '').replace(',', '.'); if (v === '' || !isNaN(parseFloat(v))) setAmount(v); }} placeholder="0,00" /></div>
        <div className="field"><label>Data</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      </div>
      <div className="form-grid form-grid--2">
        <div className="field"><label>Categoria</label>
          <select value={cat} onChange={e => setCat(e.target.value)}>
            <option>Produção</option><option>Transporte</option><option>Marketing</option><option>Outros</option>
          </select>
        </div>
        <div className="field"><label>Método</label>
          <select value={method} onChange={e => setMethod(e.target.value)}>
            <option>PIX</option><option>Dinheiro</option><option>Cartão</option>
          </select>
        </div>
      </div>
      <button className="btn btn--primary" style={{ marginTop: 8 }} onClick={() => { if (desc && amount) onSubmit({ description: desc, amount: +amount, date, category: cat, method }); }}>
        Salvar saída
      </button>
    </div>
  );
}

/* ─── ESTOQUE ────────────────────────────────────────────────────────────── */
function StockView({ models, setModels, orders, toast }) {
  const [adjModal, setAdjModal] = useState(null);
  const [adj, setAdj]           = useState({});
  const [reason, setReason]     = useState('');
  const [newModel, setNewModel] = useState({ name: '', price: '', cost: '', color: '', sizes: ['P', 'M', 'G', 'GG'] });
  const [editingModel, setEditingModel] = useState(null);
  const [showModelForm, setShowModelForm] = useState(false);
  const MODEL_SIZES = ['P', 'M', 'G', 'GG', 'XGG', 'XGG2'];

  // Obter todos os tamanhos únicos de todos os modelos
  const allSizes = useMemo(() => {
    const sizesSet = new Set();
    models.forEach(m => {
      if (m.sizes) {
        m.sizes.forEach(sz => sizesSet.add(sz));
      } else {
        // Fallback para tamanhos padrão se o modelo não tiver sizes definido
        ['P','M','G','GG','XGG'].forEach(sz => sizesSet.add(sz));
      }
    });
    return Array.from(sizesSet).sort((a, b) => {
      const order = ['P','M','G','GG','XGG','XGG2'];
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [models]);

  // Totais do estoque atual (previsão)
  const stockTotals = useMemo(() => {
    const units = models.reduce((a, m) => a + Object.values(m.stock).reduce((s, q) => s + q, 0), 0);
    const costValue = models.reduce((a, m) => a + Object.entries(m.stock).reduce((s, [, q]) => s + q * m.cost, 0), 0);
    const saleValue = models.reduce((a, m) => a + Object.entries(m.stock).reduce((s, [, q]) => s + q * m.price, 0), 0);
    return { units, costValue, saleValue };
  }, [models]);

  // Totais de vendas realizadas
  const salesTotals = useMemo(() => {
    let totalCost = 0;
    let totalRevenue = 0;
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const model = models.find(m => m.id === item.modelId);
        if (model) {
          totalCost += model.cost * item.quantity;
          totalRevenue += item.unitPrice * item.quantity;
        }
      });
    });
    
    const totalProfit = totalRevenue - totalCost;
    return { totalCost, totalRevenue, totalProfit };
  }, [orders, models]);

  const saveAdj = async () => {
    if (!reason.trim()) { toast('Informe o motivo', 'error'); return; }
    
    let updatedStock = null;
    setModels(prev => prev.map(m => {
      if (m.id !== adjModal) return m;
      const s = { ...m.stock };
      Object.entries(adj).forEach(([sz, v]) => { if (v !== '') s[sz] = Math.max(0, +v); });
      updatedStock = s;
      return { ...m, stock: s };
    }));
    
    // Salvar no banco de dados
    if (updatedStock) {
      await dbUpdateModelStock(adjModal, updatedStock);
    }
    
    toast('Estoque atualizado!', 'success');
    setAdjModal(null); setAdj({}); setReason('');
  };

  const qClass = (q) => q === 0 ? 'stock-cell--out' : q <= 3 ? 'stock-cell--low' : 'stock-cell--ok';

  const toggleSize = (size) => {
    setNewModel(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const toggleEditSize = (size) => {
    setEditingModel(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const addShirtModel = async () => {
    if (!newModel.name.trim() || !newModel.price) return;
    const model = {
      name: newModel.name.trim(),
      price: parseFloat(newModel.price.replace(',', '.')),
      cost: parseFloat(newModel.cost.replace(',', '.')) || 0,
      color: newModel.color.trim(),
      sizes: newModel.sizes,
      description: ''
    };
    await dbAddShirtModel(model);
    const modelsData = await getShirtModels();
    setModels(modelsData);
    setNewModel({ name: '', price: '', cost: '', color: '', sizes: ['P', 'M', 'G', 'GG'] });
    toast('Modelo adicionado com sucesso!', 'success');
  };

  const updateShirtModel = async () => {
    if (!editingModel || !editingModel.name.trim() || !editingModel.price) return;
    await dbUpdateShirtModel(editingModel.id, {
      name: editingModel.name.trim(),
      price: parseFloat(String(editingModel.price).replace(',', '.')),
      cost: parseFloat(String(editingModel.cost).replace(',', '.')) || 0,
      color: editingModel.color.trim(),
      sizes: editingModel.sizes
    });
    const modelsData = await getShirtModels();
    setModels(modelsData);
    setEditingModel(null);
    toast('Modelo atualizado com sucesso!', 'success');
  };

  return (
    <>
      <div className="stat-grid stat-grid--5">
        <StatCard 
          label="Total de unidades" 
          value={stockTotals.units} 
          color="blue" 
          icon={Package}
          info="Quantidade total de camisas disponíveis em estoque, somando todos os modelos e tamanhos."
        />
        <StatCard 
          label="Custo (vendas)" 
          value={fmt(salesTotals.totalCost)} 
          color="amber" 
          icon={DollarSign}
          info="Valor total do custo das camisas que já foram vendidas. É o quanto foi investido nos produtos vendidos."
        />
        <StatCard 
          label="Venda prevista" 
          value={fmt(stockTotals.saleValue)} 
          color="green" 
          icon={TrendingUp}
          info="Valor total que será recebido se todo o estoque atual for vendido pelos preços cadastrados."
        />
        <StatCard 
          label="Receita (vendas)" 
          value={fmt(salesTotals.totalRevenue)} 
          color="teal" 
          icon={TrendingUp}
          info="Valor total já recebido com as vendas realizadas. Soma de todos os pagamentos de pedidos."
        />
        <StatCard 
          label="Lucro (vendas)" 
          value={fmt(salesTotals.totalProfit)} 
          color="green" 
          icon={Banknote}
          info="Lucro líquido obtido com as vendas realizadas. É a diferença entre receita e custo dos produtos vendidos."
        />
      </div>
      <SectionCard noPad>
        <div className="table-scroll">
          <table className="data-table data-table--centered">
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Cor</th>
                {allSizes.map(sz => (
                  <th key={sz}>{sz}</th>
                ))}
                <th>Total</th>
                <th>Custo</th>
                <th>Preço</th>
                <th>Valor Venda</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {models.map(m => {
                const total = Object.values(m.stock).reduce((s, q) => s + q, 0);
                const saleVal = Object.entries(m.stock).reduce((s, [, q]) => s + q * m.price, 0);
                const modelSizes = m.sizes || ['P','M','G','GG','XGG'];
                return (
                  <tr key={m.id}>
                    <td className="text-strong">{m.name}</td>
                    <td>{m.color}</td>
                    {allSizes.map(sz => (
                      <td key={sz}>
                        {modelSizes.includes(sz) ? (
                          <span className={`stock-cell ${qClass(m.stock[sz] ?? 0)}`}>{m.stock[sz] ?? 0}</span>
                        ) : (
                          <span style={{ color: 'var(--text-4)' }}>—</span>
                        )}
                      </td>
                    ))}
                    <td className="mono">{total}</td>
                    <td className="mono">{fmt(m.cost)}</td>
                    <td className="mono">{fmt(m.price)}</td>
                    <td className="mono text-success" style={{ fontWeight: 600 }}>{fmt(saleVal)}</td>
                    <td>
                      <button className="btn btn--ghost btn--sm" onClick={() => { setAdjModal(m.id); setAdj({...m.stock}); }}>
                        Ajustar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {adjModal && (
        <Modal title="Ajustar estoque" onClose={() => setAdjModal(null)} width={480}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12 }}>
            {(() => {
              const model = models.find(m => m.id === adjModal);
              const modelSizes = model?.sizes || ['P','M','G','GG','XGG'];
              return modelSizes.map(sz => (
                <div key={sz} className="field">
                  <label>Tam. {sz}</label>
                  <input type="text" inputMode="numeric" value={adj[sz] ?? ''}
                    onChange={e => { const v = e.target.value.replace(/\D/g, ''); setAdj({...adj, [sz]: v}); }} />
                </div>
              ));
            })()}
          </div>
          <div className="field" style={{ marginTop: 18 }}>
            <label>Motivo <span className="req">*</span></label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex: Reposição de estoque" />
          </div>
          <button className="btn btn--primary" style={{ marginTop: 16, width: '100%' }} onClick={saveAdj}>
            Salvar ajuste
          </button>
        </Modal>
      )}

      {/* Seção de Cadastro de Modelos */}
      <SectionCard 
        title="Modelos de Camisas" 
        action={
          <button className="btn btn--primary btn--sm" onClick={() => setShowModelForm(!showModelForm)}>
            {showModelForm ? <><X size={14} /> Fechar</> : <><Plus size={14} /> Novo Modelo</>}
          </button>
        }
      >
        {showModelForm && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20, padding: 16, background: 'var(--surface-2)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field"><label>Nome</label><input value={newModel.name} onChange={e => setNewModel({...newModel, name: e.target.value})} placeholder="Nome do modelo" /></div>
              <div className="field"><label>Cor</label><input value={newModel.color} onChange={e => setNewModel({...newModel, color: e.target.value})} placeholder="Cor" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field"><label>Preço Venda</label><input type="text" value={newModel.price} onChange={e => setNewModel({...newModel, price: e.target.value})} placeholder="0,00" /></div>
              <div className="field"><label>Preço Custo</label><input type="text" value={newModel.cost} onChange={e => setNewModel({...newModel, cost: e.target.value})} placeholder="0,00" /></div>
            </div>
            <div className="field">
              <label>Tamanhos</label>
              <div className="size-chips">
                {MODEL_SIZES.map(size => (
                  <button key={size} type="button" className={`size-chip ${newModel.sizes.includes(size) ? 'size-chip--active' : ''}`} onClick={() => toggleSize(size)}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn--primary" onClick={addShirtModel}>
              <Plus size={16} /> Cadastrar Modelo
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {models.map(model => (
            <div key={model.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 30, borderRadius: 4, backgroundColor: model.color?.toLowerCase().includes('azul') ? '#1e3a5f' : model.color?.toLowerCase().includes('verde') ? '#2d8a50' : model.color?.toLowerCase().includes('branc') ? '#e5e5e5' : model.color?.toLowerCase().includes('preto') ? '#333' : '#888' }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{model.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{model.color} • R$ {model.price?.toFixed(2)} • Custo: R$ {model.cost?.toFixed(2)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="icon-btn" onClick={() => setEditingModel({ ...model })} title="Editar"><Edit size={14} /></button>
                <button className="icon-btn icon-btn--danger" onClick={async () => {
                  if (window.confirm(`Excluir modelo "${model.name}"?`)) {
                    await dbDeleteShirtModel(model.id);
                    const modelsData = await getShirtModels();
                    setModels(modelsData);
                    toast('Modelo excluído!', 'warning');
                  }
                }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {models.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-4)', fontSize: 13 }}>
              Nenhum modelo cadastrado. Clique em "Novo Modelo" para adicionar.
            </div>
          )}
        </div>
      </SectionCard>

      {editingModel && (
        <Modal title="Editar Modelo" onClose={() => setEditingModel(null)} width={500}
          footer={
            <>
              <button className="btn btn--ghost" onClick={() => setEditingModel(null)}>Cancelar</button>
              <button className="btn btn--primary" onClick={updateShirtModel}>Salvar</button>
            </>
          }>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Nome do Modelo</label>
                <input value={editingModel.name} onChange={e => setEditingModel({ ...editingModel, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Cor</label>
                <input value={editingModel.color} onChange={e => setEditingModel({ ...editingModel, color: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Preço de Venda</label>
                <input type="text" value={editingModel.price} onChange={e => setEditingModel({ ...editingModel, price: e.target.value })} />
              </div>
              <div className="field">
                <label>Preço de Custo</label>
                <input type="text" value={editingModel.cost} onChange={e => setEditingModel({ ...editingModel, cost: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Tamanhos</label>
              <div className="size-chips">
                {MODEL_SIZES.map(size => (
                  <button key={size} type="button" className={`size-chip ${editingModel.sizes?.includes(size) ? 'size-chip--active' : ''}`} onClick={() => toggleEditSize(size)}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ─── CLIENTES ─────────────────────────────────────────────────────────────── */
function ClientsView({ toast, orders }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', cpf: '', address: '' });

  useEffect(() => {
    const loadClients = async () => {
      const clientsData = await getClients();
      setClients(clientsData);
    };
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    if (!search) return clients;
    const q = search.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.email && c.email.toLowerCase().includes(q)) || 
      c.phone.includes(q) ||
      (c.cpf && c.cpf.includes(q))
    );
  }, [clients, search]);

  const getClientOrders = (clientId) => {
    return orders.filter(o => o.buyerName === clients.find(c => c.id === clientId)?.name);
  };

  const save = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast('Preencha nome e telefone', 'error');
      return;
    }
    if (modal?.id) {
      await dbUpdateClient(modal.id, form);
      setClients(p => p.map(c => c.id === modal.id ? { ...c, ...form } : c));
      toast('Cliente atualizado!', 'success');
    } else {
      const id = await dbAddClient(form);
      setClients(p => [...p, { ...form, id }]);
      toast('Cliente cadastrado!', 'success');
    }
    setModal(null);
    setForm({ name: '', email: '', phone: '', cpf: '', address: '' });
  };

  const remove = async (id) => {
    if (!window.confirm('Excluir este cliente?')) return;
    await dbDeleteClient(id);
    setClients(p => p.filter(c => c.id !== id));
    toast('Cliente excluído', 'warning');
  };

  return (
    <>
      <div className="filters-bar">
        <div className="filter-field filter-field--wide" style={{ position: 'relative' }}>
          <input className="filter-input" style={{ paddingLeft: 38 }} placeholder="Buscar clientes..." value={search} onChange={e => setSearch(e.target.value)} />
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }} />
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => { setModal({}); setForm({ name: '', email: '', phone: '', cpf: '', address: '' }); }}>
          <Plus size={14} /> Novo Cliente
        </button>
      </div>

      <p className="results-count">{filteredClients.length} cliente(s) encontrado(s)</p>

      <SectionCard noPad>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>CPF</th>
                <th>Compras</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(c => (
                <tr key={c.id}>
                  <td className="text-strong">{c.name}</td>
                  <td className="text-muted">{c.email || '—'}</td>
                  <td>{c.phone}</td>
                  <td className="text-muted">{c.cpf || '—'}</td>
                  <td>{getClientOrders(c.id).length}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" title="Editar" onClick={() => { setModal(c); setForm({ name: c.name, email: c.email || '', phone: c.phone, cpf: c.cpf || '', address: c.address || '' }); }}><Edit size={15} /></button>
                      <button className="icon-btn icon-btn--danger" title="Excluir" onClick={() => remove(c.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr><td colSpan={6} className="empty-row">Nenhum cliente encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {modal !== null && (
        <Modal title={modal.id ? 'Editar Cliente' : 'Novo Cliente'} onClose={() => setModal(null)} footer={
          <>
            <button className="btn btn--ghost" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn--primary" onClick={save}><Save size={14} /> Salvar</button>
          </>
        }>
          <div className="field">
            <label>Nome completo <span className="req">*</span></label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: João Silva" />
          </div>
          <div className="form-row" style={{ marginTop: 14 }}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@exemplo.com" />
            </div>
            <div className="field">
              <label>Telefone <span className="req">*</span></label>
              <input value={form.phone} onChange={e => setForm({...form, phone: maskPhone(e.target.value)})} placeholder="(81) 99999-9999" />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: 14 }}>
            <div className="field">
              <label>CPF</label>
              <input value={form.cpf} onChange={e => setForm({...form, cpf: maskCPF(e.target.value)})} placeholder="000.000.000-00" />
            </div>
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Endereço</label>
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Rua, número, bairro" />
          </div>
        </Modal>
      )}
    </>
  );
}

/* ─── CONFIGURAÇÕES ──────────────────────────────────────────────────────────── */
function SettingsView({ toast }) {
  const [churchName, setChurchName]       = useState('');
  const [churchAddress, setChurchAddress] = useState('');
  const [churchPhone, setChurchPhone]     = useState('');
  const [defaultMethod, setDefaultMethod] = useState('PIX');
  const [defaultLeader, setDefaultLeader] = useState(LEADERS[0]);
  const [lowStockAlert, setLowStockAlert] = useState(5);
  const [leaders, setLeaders]             = useState([]);
  const [newLeader, setNewLeader]         = useState('');

  // Carregar dados do banco
  useEffect(() => {
    const loadData = async () => {
      const [leadersData, settingsData] = await Promise.all([
        getLeaders(),
        getSettings()
      ]);
      setLeaders(leadersData.map(l => l.name));
      if (settingsData) {
        setChurchName(settingsData.churchName || '');
        setChurchAddress(settingsData.churchAddress || '');
        setChurchPhone(settingsData.churchPhone || '');
        setDefaultMethod(settingsData.defaultPaymentMethod || 'PIX');
        setLowStockAlert(settingsData.lowStockAlert || 5);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    await dbSaveSettings({
      churchName, churchAddress, churchPhone,
      defaultPaymentMethod: defaultMethod, lowStockAlert
    });
    toast('Configurações salvas com sucesso!', 'success');
  };

  const addLeader = async () => {
    if (newLeader.trim() && !leaders.includes(newLeader.trim())) {
      await dbAddLeader(newLeader.trim());
      setLeaders([...leaders, newLeader.trim()]);
      setNewLeader('');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-cols">
        <div className="settings-section">
          <div className="settings-section__header">
            <div className="settings-section__icon settings-section__icon--church"><Store size={20} /></div>
            <div>
              <h3 className="settings-section__title">Informações da Igreja</h3>
              <p className="settings-section__subtitle">Dados institucionais</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field"><label>Nome da Igreja</label><input value={churchName} onChange={e => setChurchName(e.target.value)} placeholder="Ex: Igreja Batista" /></div>
            <div className="field"><label>Telefone</label><input value={churchPhone} onChange={e => setChurchPhone(maskPhone(e.target.value))} placeholder="(81) 99999-9999" /></div>
            <div className="field"><label>Endereço</label><input value={churchAddress} onChange={e => setChurchAddress(e.target.value)} placeholder="Ex: Rua Exemplo, 123 - Cidade" /></div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section__header">
            <div className="settings-section__icon settings-section__icon--order"><ShoppingCart size={20} /></div>
            <div>
              <h3 className="settings-section__title">Preferências</h3>
              <p className="settings-section__subtitle">Valores padrão de pedidos</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label>Método de pagamento padrão</label>
              <select value={defaultMethod} onChange={e => setDefaultMethod(e.target.value)}>
                <option value="PIX">PIX</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão">Cartão</option>
              </select>
            </div>
            <div className="field">
              <label>Líder padrão</label>
              <select value={defaultLeader} onChange={e => setDefaultLeader(e.target.value)}>
                {leaders.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Alerta de estoque baixo (unidades)</label>
              <input type="number" value={lowStockAlert} onChange={e => setLowStockAlert(e.target.value)} min="1" />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section__header">
            <div className="settings-section__icon settings-section__icon--users"><Settings size={20} /></div>
            <div>
              <h3 className="settings-section__title">Gerenciar Líderes</h3>
              <p className="settings-section__subtitle">Autorizados a registrar</p>
            </div>
          </div>
          <div className="leaders-manager">
            <div className="leaders-add">
              <div className="field" style={{ flex: 1 }}>
                <label>Novo líder</label>
                <input value={newLeader} onChange={e => setNewLeader(e.target.value)} placeholder="Nome do líder" onKeyDown={e => e.key === 'Enter' && addLeader()} />
              </div>
              <button className="btn btn--primary btn--sm" style={{ alignSelf: 'flex-end', height: 42 }} onClick={addLeader}><Plus size={16} /></button>
            </div>
            <div className="leaders-list">
              {leaders.map((leader, i) => (
                <div key={i} className="leader-item">
                  <span>{leader}</span>
                  <button className="icon-btn icon-btn--danger" onClick={async () => {
                    const leadersData = await getLeaders();
                    const leaderToDelete = leadersData.find(l => l.name === leader);
                    if (leaderToDelete) await dbDeleteLeader(leaderToDelete.id);
                    setLeaders(leaders.filter(l => l !== leader));
                  }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section__header">
            <div className="settings-section__icon" style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}><Settings size={20} /></div>
            <div>
              <h3 className="settings-section__title">Ações</h3>
              <p className="settings-section__subtitle">Salvar ou resetar dados</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn--ghost" onClick={() => {
              if (window.confirm('Isso irá apagar TODOS os dados. Deseja continuar?')) {
                localStorage.clear();
                indexedDB.deleteDatabase('ChurchShirtManager');
                window.location.reload();
              }
            }}>
              <Trash2 size={16} /> Resetar Dados
            </button>
            <button className="btn btn--primary" onClick={handleSave}>
              <Save size={16} /> Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── RELATÓRIOS ─────────────────────────────────────────────────────────── */
function ReportsView({ orders, models, cashFlow }) {
  const [tab, setTab] = useState('sales');

  // Totais de despesas/saídas
  const expenses = useMemo(() => {
    if (!cashFlow) return { total: 0, byCategory: [] };
    const total = cashFlow.filter(c => c.type === 'saída').reduce((a, c) => a + c.amount, 0);
    const catMap = {};
    cashFlow.filter(c => c.type === 'saída').forEach(c => {
      catMap[c.category] = (catMap[c.category] || 0) + c.amount;
    });
    const byCategory = Object.entries(catMap).map(([category, amount]) => ({ category, amount }));
    return { total, byCategory };
  }, [cashFlow]);

  // Totais gerais para o relatório
  const reportTotals = useMemo(() => {
    let totalCost = 0;
    let totalRevenue = 0;
    let totalUnits = 0;
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const model = models.find(m => m.id === item.modelId);
        totalCost += (model?.cost || 0) * item.quantity;
        totalRevenue += item.unitPrice * item.quantity;
        totalUnits += item.quantity;
      });
    });
    
    return {
      units: totalUnits,
      cost: totalCost,
      revenue: totalRevenue,
      profit: totalRevenue - totalCost - expenses.total,
      grossProfit: totalRevenue - totalCost,
      paid: orders.reduce((a, o) => a + (o.amountPaid || 0), 0),
      pending: orders.reduce((a, o) => a + (o.amountDue || 0), 0),
      expenses: expenses.total
    };
  }, [orders, models, expenses]);

  const salesByModel = useMemo(() => {
    const map = {};
    models.forEach(m => { map[m.name] = { units: 0, revenue: 0, cost: 0 }; });
    orders.forEach(o => o.items.forEach(i => {
      const model = models.find(m => m.id === i.modelId);
      if (!map[i.modelName]) map[i.modelName] = { units: 0, revenue: 0, cost: 0 };
      map[i.modelName].units   += i.quantity;
      map[i.modelName].revenue += i.subtotal;
      map[i.modelName].cost   += (model?.cost || 0) * i.quantity;
    }));
    return Object.entries(map).map(([label, d]) => ({ label, ...d, total: d.units, profit: d.revenue - d.cost }));
  }, [orders, models]);

  const paymentBreakdown = useMemo(() => {
    const map = {};
    orders.forEach(o => { map[o.paymentMethod] = (map[o.paymentMethod] || 0) + o.amountPaid; });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [orders]);

  const buyerRanking = useMemo(() =>
    Object.entries(orders.reduce((a, o) => ({ ...a, [o.buyerName]: (a[o.buyerName] || 0) + o.total }), {}))
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
  , [orders]);

  const pendingOrders = useMemo(() =>
    orders.filter(o => o.amountDue > 0).sort((a, b) => b.amountDue - a.amountDue)
  , [orders]);

  const leaderStats = useMemo(() => {
    const leaderData = {};
    orders.forEach(o => {
      const leader = o.registeredBy || 'Não informado';
      if (!leaderData[leader]) leaderData[leader] = { count: 0, value: 0 };
      leaderData[leader].count++;
      leaderData[leader].value += o.total;
    });
    return Object.entries(leaderData)
      .map(([leader, d]) => ({ leader, ...d }))
      .sort((a, b) => b.value - a.value);
  }, [orders]);

  return (
    <>
      {/* Seção de impressão - oculta na tela, visível na impressão */}
      <div className="print-only">
        <div className="print-header">
          <div>
            <h1>RELATÓRIO DE VENDAS</h1>
            <p>Gerado em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="print-brand">Igreja</div>
        </div>
        
        <div className="print-summary">
          <div className="print-card"><div className="print-card-label">Camisas Vendidas</div><div className="print-card-value">{reportTotals.units}</div></div>
          <div className="print-card"><div className="print-card-label">Custo das Vendas</div><div className="print-card-value">{fmt(reportTotals.cost)}</div></div>
          <div className="print-card print-card--red"><div className="print-card-label">Total Saídas</div><div className="print-card-value">{fmt(reportTotals.expenses)}</div></div>
          <div className="print-card print-card--green"><div className="print-card-label">Receita Bruta</div><div className="print-card-value">{fmt(reportTotals.revenue)}</div></div>
        </div>
        
        <div className="print-summary">
          <div className="print-card print-card--dark"><div className="print-card-label">Lucro Bruto</div><div className="print-card-value">{fmt(reportTotals.grossProfit)}</div></div>
          <div className="print-card print-card--dark"><div className="print-card-label">Lucro Líquido</div><div className="print-card-value">{fmt(reportTotals.profit)}</div></div>
          <div className="print-card print-card--green"><div className="print-card-label">Total Recebido</div><div className="print-card-value">{fmt(reportTotals.paid)}</div></div>
          <div className="print-card print-card--red"><div className="print-card-label">Total Pendente</div><div className="print-card-value">{fmt(reportTotals.pending)}</div></div>
        </div>
        
        <div className="print-section">
          <h2 className="print-section-title">Saídas / Despesas</h2>
          <table className="print-table">
            <thead><tr><th>Categoria</th><th>Valor</th></tr></thead>
            <tbody>
              {expenses.byCategory.map((d, i) => <tr key={i}><td><strong>{d.category}</strong></td><td className="text-red">{fmt(d.amount)}</td></tr>)}
              <tr className="print-total"><td><strong>TOTAL</strong></td><td className="text-red"><strong>{fmt(reportTotals.expenses)}</strong></td></tr>
            </tbody>
          </table>
        </div>
        
        <div className="print-two-cols">
          <div className="print-section">
            <h2 className="print-section-title">Vendas por Modelo</h2>
            <table className="print-table">
              <thead><tr><th>Modelo</th><th>Unid.</th><th>Custo</th><th>Receita</th><th>Lucro</th></tr></thead>
              <tbody>
                {salesByModel.map((d, i) => <tr key={i}><td><strong>{d.label}</strong></td><td>{d.units}</td><td>{fmt(d.cost)}</td><td>{fmt(d.revenue)}</td><td className="text-green">{fmt(d.profit)}</td></tr>)}
                <tr className="print-total"><td><strong>TOTAL</strong></td><td><strong>{reportTotals.units}</strong></td><td><strong>{fmt(reportTotals.cost)}</strong></td><td><strong>{fmt(reportTotals.revenue)}</strong></td><td className="text-green"><strong>{fmt(reportTotals.grossProfit)}</strong></td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="print-section">
            <h2 className="print-section-title">Métodos de Pagamento</h2>
            <table className="print-table">
              <thead><tr><th>Método</th><th>Valor</th></tr></thead>
              <tbody>
                {paymentBreakdown.map((d, i) => <tr key={i}><td>{d.label}</td><td>{fmt(d.value)}</td></tr>)}
              </tbody>
            </table>
            
            <h2 className="print-section-title" style={{marginTop: 15}}>Desempenho por Líder</h2>
            <table className="print-table">
              <thead><tr><th>Líder</th><th>Pedidos</th><th>Valor</th></tr></thead>
              <tbody>
                {leaderStats.map((d, i) => <tr key={i}><td>{d.leader}</td><td>{d.count}</td><td>{fmt(d.value)}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
        
        {pendingOrders.length > 0 && (
          <div className="print-section">
            <h2 className="print-section-title">Pendências a Receber ({fmt(pendingOrders.reduce((a, o) => a + o.amountDue, 0))})</h2>
            <table className="print-table">
              <thead><tr><th>ID</th><th>Data</th><th>Comprador</th><th>Telefone</th><th>Total</th><th>Pago</th><th>Pendente</th></tr></thead>
              <tbody>
                {pendingOrders.map(o => <tr key={o.id}><td>{o.id}</td><td>{fmtDate(o.date)}</td><td><strong>{o.buyerName}</strong></td><td>{o.phone}</td><td>{fmt(o.total)}</td><td className="text-green">{fmt(o.amountPaid)}</td><td className="text-red">{fmt(o.amountDue)}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="print-footer">Relatório gerado automaticamente pelo Sistema de Gestão de Vendas de Camisas</div>
      </div>
      
      <div className="tab-bar">
        {[['sales','Vendas'],['pending','Pendências'],['leaders','Por líder']].map(([id, lbl]) => (
          <button key={id} className={`tab-btn ${tab === id ? 'tab-btn--on' : ''}`} onClick={() => setTab(id)}>{lbl}</button>
        ))}
        <button className="btn btn--ghost btn--sm" style={{ marginLeft: 'auto' }} onClick={() => window.print()}>
          <Printer size={14} /> Imprimir
        </button>
      </div>

      {tab === 'sales' && (
        <div>
          <div className="stat-grid stat-grid--3" style={{ marginBottom: 20 }}>
            <StatCard label="Total Arrecadado" value={fmt(orders.reduce((a, o) => a + (o.amountPaid || 0), 0))} color="green" icon={TrendingUp} />
            <StatCard label="Camisas Vendidas" value={orders.reduce((a, o) => a + (o.items || []).reduce((s, i) => s + (i.quantity || 0), 0), 0)} color="blue" icon={PackageCheck} />
            <StatCard label="Lucro Estimado" value={fmt(orders.reduce((a, o) => a + (o.items || []).reduce((s, i) => {
              const m = models.find(m => m.id === i.modelId);
              return s + ((i.unitPrice || 0) - (m?.cost ?? 0)) * (i.quantity || 0);
            }, 0), 0))} color="teal" icon={ArrowUpRight} />
          </div>
          <div className="reports-grid">
            <SectionCard title="Vendas por modelo" noPad>
              <table className="data-table data-table--centered">
                <thead><tr><th>Modelo</th><th>Unidades</th><th>Receita</th></tr></thead>
                <tbody>
                  {salesByModel.map((d, i) => (
                    <tr key={i}>
                      <td>{d.label}</td>
                      <td>{d.units}</td>
                      <td className="mono">{fmt(d.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
            <SectionCard title="Métodos de pagamento" noPad>
              <table className="data-table data-table--centered">
                <thead><tr><th>Método</th><th>Valor</th></tr></thead>
                <tbody>
                  {paymentBreakdown.map((d, i) => (
                    <tr key={i}>
                      <td>{d.label}</td>
                      <td className="mono">{fmt(d.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
            <SectionCard title="Ranking de compradores" noPad>
              <table className="data-table data-table--centered">
                <thead><tr><th>#</th><th>Comprador</th><th>Total gasto</th></tr></thead>
                <tbody>
                  {buyerRanking.map(([name, total], i) => (
                    <tr key={i}>
                      <td className="text-muted" style={{ fontWeight: 700 }}>#{i + 1}</td>
                      <td className="text-strong">{name}</td>
                      <td className="mono">{fmt(total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
          </div>
        </div>
      )}

      {tab === 'pending' && (
        <SectionCard title={`Pendências — ${fmt(pendingOrders.reduce((a, o) => a + o.amountDue, 0))} a receber`} noPad>
          <table className="data-table data-table--centered">
            <thead><tr><th>ID</th><th>Data</th><th>Comprador</th><th>Telefone</th><th>Total</th><th>Pago</th><th>Restante</th></tr></thead>
            <tbody>
              {pendingOrders.map(o => (
                <tr key={o.id}>
                  <td className="mono text-muted" style={{ fontSize: 12 }}>{o.id}</td>
                  <td>{fmtDate(o.date)}</td>
                  <td className="text-strong">{o.buyerName}</td>
                  <td className="text-muted">{o.phone}</td>
                  <td className="mono">{fmt(o.total)}</td>
                  <td className="mono text-success">{fmt(o.amountPaid)}</td>
                  <td className="mono text-danger">{fmt(o.amountDue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}

      {tab === 'leaders' && (
        <div>
          <div className="stat-grid stat-grid--3" style={{ marginBottom: 20 }}>
            <StatCard label="Total de Pedidos" value={orders.length || 0} color="blue" icon={ShoppingCart} />
            <StatCard label="Total Arrecadado" value={fmt(orders.reduce((a, o) => a + (o.amountPaid || 0), 0))} color="green" icon={TrendingUp} />
            <StatCard label="Líderes Ativos" value={leaderStats.length || 0} color="teal" icon={Users} />
          </div>
          <SectionCard title="Desempenho por líder" noPad>
            <table className="data-table data-table--centered">
              <thead><tr><th>Líder</th><th>Pedidos</th><th>Valor total</th></tr></thead>
              <tbody>
                {leaderStats.map((d, i) => (
                  <tr key={i}>
                    <td className="text-strong">{d.leader}</td>
                    <td>{d.count}</td>
                    <td className="mono">{fmt(d.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        </div>
        )}
    </>
  );
}