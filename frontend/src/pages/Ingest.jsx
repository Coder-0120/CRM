import { useState } from 'react';
import Papa from 'papaparse';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Upload, Plus, Database, TrendingUp } from 'lucide-react';

const CUSTOMER_SAMPLE = `name,email,phone,city,totalSpend,visitCount
Priya Sharma,priya@example.com,9876543210,Mumbai,15000,8
Rahul Gupta,rahul@example.com,9123456789,Delhi,8500,4`;

const ORDER_SAMPLE = `customerEmail,amount,status
priya@example.com,3500,completed
rahul@example.com,2200,completed`;

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Ingest() {
  const [tab, setTab]             = useState('csv-customers');
  const [csvData, setCsvData]     = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragover, setDragover]   = useState(false);

  const [customer, setCustomer] = useState({ name:'', email:'', phone:'', city:'', totalSpend:'', visitCount:'' });
  const [order, setOrder]       = useState({ customerEmail:'', amount:'', status:'completed' });

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (result) => {
        setCsvHeaders(Object.keys(result.data[0] || {}));
        setCsvData(result.data);
        toast.success(`📊 Parsed ${result.data.length} rows`);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault(); 
    setDragover(false);
    const file = e.dataTransfer.files[0];
    if (file) parseCSV(file);
  };

  const uploadCSV = async () => {
    if (!csvData.length) return;
    setUploading(true);
    try {
      if (tab === 'csv-customers') {
        const customers = csvData.map(r => ({
          name: r.name, email: r.email, phone: r.phone,
          city: r.city, totalSpend: Number(r.totalSpend) || 0,
          visitCount: Number(r.visitCount) || 0
        }));
        await api.post('/api/customers/bulk', { customers });
        toast.success(`✅ Imported ${customers.length} customers!`);
      } else {
        const orders = csvData.map(r => ({
          customerEmail: r.customerEmail,
          amount: Number(r.amount) || 0,
          status: r.status || 'completed'
        }));
        await api.post('/api/orders/bulk', { orders });
        toast.success(`✅ Imported ${orders.length} orders!`);
      }
      setCsvData([]); 
      setCsvHeaders([]);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Import failed');
    } finally { 
      setUploading(false); 
    }
  };

  const addCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/customers/bulk', { customers: [{ ...customer, totalSpend: Number(customer.totalSpend), visitCount: Number(customer.visitCount) }] });
      toast.success('✅ Customer added!');
      setCustomer({ name:'', email:'', phone:'', city:'', totalSpend:'', visitCount:'' });
    } catch (e) { 
      toast.error(e.response?.data?.error || 'Failed'); 
    }
  };

  const addOrder = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/orders/bulk', { orders: [{ ...order, amount: Number(order.amount) }] });
      toast.success('✅ Order added!');
      setOrder({ customerEmail:'', amount:'', status:'completed' });
    } catch (e) { 
      toast.error(e.response?.data?.error || 'Failed'); 
    }
  };

  const tabs = [
    { id: 'csv-customers', label: 'CSV — Customers', icon: Database },
    { id: 'csv-orders',    label: 'CSV — Orders', icon: TrendingUp },
    { id: 'form-customer', label: 'Add Customer', icon: Plus },
    { id: 'form-order',    label: 'Add Order', icon: Plus },
  ];

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="page-header-left">
          <h2>Data Ingestion</h2>
          <p>Import customers and orders via CSV or add records individually</p>
        </div>
      </motion.div>

      <motion.div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {tabs.map((t, idx) => {
          const Icon = t.icon;
          return (
            <motion.button
              key={t.id}
              onClick={() => { setTab(t.id); setCsvData([]); setCsvHeaders([]); }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: tab === t.id ? 'linear-gradient(135deg, #1e40af, #3b82f6)' : 'var(--card)',
                border: tab === t.id ? 'none' : '1px solid var(--bd)',
                padding: 16,
                borderRadius: 12,
                color: tab === t.id ? 'white' : 'var(--t1)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.3s ease'
              }}
            >
              <Icon size={18} />
              {t.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* CSV Upload */}
      {(tab === 'csv-customers' || tab === 'csv-orders') && (
        <motion.div initial="hidden" animate="visible" variants={tabVariants}>
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
                {tab === 'csv-customers' ? 'Upload Customer CSV' : 'Upload Orders CSV'}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--t2)' }}>Drag and drop your file or click to browse</p>
            </div>

            <motion.div
              onDragOver={e => { e.preventDefault(); setDragover(true); }}
              onDragLeave={() => setDragover(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('csv-file').click()}
              initial={{ borderColor: 'var(--bd)' }}
              animate={{ borderColor: dragover ? '#1e40af' : 'var(--bd)', backgroundColor: dragover ? 'rgba(30,64,175,.08)' : 'var(--bg2)' }}
              transition={{ duration: 0.2 }}
              style={{
                border: '2px dashed currentColor',
                padding: '60px 24px',
                borderRadius: 16,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: 20
              }}
            >
              <motion.div
                animate={{ y: dragover ? -8 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: 48, marginBottom: 12 }}>
                📂
              </motion.div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
                Drop your CSV here
              </h3>
              <p style={{ fontSize: 13, color: 'var(--t2)' }}>or click to select a file (up to 10MB)</p>
              <input 
                id="csv-file" 
                type="file" 
                accept=".csv" 
                style={{ display: 'none' }} 
                onChange={e => e.target.files[0] && parseCSV(e.target.files[0])} 
              />
            </motion.div>

            <div style={{
              background: 'var(--bg2)',
              padding: 16,
              borderRadius: 12,
              fontSize: 12,
              color: 'var(--t2)',
              border: '1px solid var(--bd)',
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>📋 Expected columns:</div>
              <code style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'monospace', display: 'block', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {tab === 'csv-customers' ? CUSTOMER_SAMPLE : ORDER_SAMPLE}
              </code>
            </div>
          </motion.div>

          {csvData.length > 0 && (
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ marginTop: 20 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--bd)' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>Preview</h3>
                  <p style={{ fontSize: 13, color: 'var(--t2)', margin: 0 }}>{csvData.length} rows ready to import</p>
                </div>
                <motion.button 
                  className="btn btn-primary"
                  onClick={uploadCSV} 
                  disabled={uploading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {uploading ? '⟳ Importing…' : `✓ Import ${csvData.length} records`}
                </motion.button>
              </div>
              <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--bd)' }}>
                <table className="table">
                  <thead>
                    <tr>{csvHeaders.map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 10).map((row, i) => (
                      <motion.tr 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        {csvHeaders.map(h => (
                          <td key={h}>{row[h]}</td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {csvData.length > 10 && (
                <p style={{ padding: 16, fontSize: 12, color: 'var(--t3)', textAlign: 'center', margin: 0 }}>
                  … and {csvData.length - 10} more rows
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Add single customer */}
      {tab === 'form-customer' && (
        <motion.div initial="hidden" animate="visible" variants={tabVariants}>
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: 600 }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 24 }}>Add Single Customer</h3>
            <form onSubmit={addCustomer}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'Priya Sharma', required: true },
                  { key: 'email', label: 'Email', placeholder: 'priya@example.com', required: true, type: 'email' },
                  { key: 'phone', label: 'Phone Number', placeholder: '9876543210' },
                  { key: 'city', label: 'City', placeholder: 'Mumbai' },
                  { key: 'totalSpend', label: 'Total Spend (₹)', placeholder: '15000', type: 'number' },
                  { key: 'visitCount', label: 'Visit Count', placeholder: '8', type: 'number' },
                ].map((f, idx) => (
                  <motion.div
                    key={f.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', display: 'block', marginBottom: 6 }}>
                      {f.label}
                    </label>
                    <input
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      required={f.required}
                      value={customer[f.key]}
                      onChange={e => setCustomer(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'var(--bg2)',
                        border: '1px solid var(--bd)',
                        borderRadius: 8,
                        color: 'var(--t1)',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                  </motion.div>
                ))}
              </div>
              <motion.button 
                className="btn btn-primary"
                type="submit"
                style={{ marginTop: 24 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✓ Add Customer
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Add single order */}
      {tab === 'form-order' && (
        <motion.div initial="hidden" animate="visible" variants={tabVariants}>
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: 600 }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 24 }}>Add Single Order</h3>
            <form onSubmit={addOrder}>
              {[
                { 
                  key: 'customerEmail', 
                  label: 'Customer Email', 
                  placeholder: 'priya@example.com', 
                  type: 'email',
                  required: true,
                  hint: 'Must match an existing customer email'
                },
                { 
                  key: 'amount', 
                  label: 'Order Amount (₹)', 
                  placeholder: '3500', 
                  type: 'number',
                  required: true
                },
              ].map((f, idx) => (
                <motion.div
                  key={f.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ marginBottom: 20 }}
                >
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', display: 'block', marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type || 'text'}
                    placeholder={f.placeholder}
                    required={f.required}
                    value={order[f.key]}
                    onChange={e => setOrder(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg2)',
                      border: '1px solid var(--bd)',
                      borderRadius: 8,
                      color: 'var(--t1)',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                  {f.hint && <p style={{ fontSize: 12, color: 'var(--t3)', margin: '6px 0 0 0' }}>{f.hint}</p>}
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: 24 }}
              >
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', display: 'block', marginBottom: 6 }}>
                  Status
                </label>
                <select
                  value={order.status}
                  onChange={e => setOrder(p => ({ ...p, status: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg2)',
                    border: '1px solid var(--bd)',
                    borderRadius: 8,
                    color: 'var(--t1)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="completed">✓ Completed</option>
                  <option value="cancelled">✕ Cancelled</option>
                  <option value="refunded">↩ Refunded</option>
                </select>
              </motion.div>

              <motion.button 
                className="btn btn-primary"
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✓ Add Order
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
