import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { CreditCard, Plus, Receipt, DollarSign, RefreshCw, Printer } from 'lucide-react';

const FeeManagement = () => {
  const [structures, setStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [isStructureOpen, setIsStructureOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Forms
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    feeStructureId: '',
    amountPaid: '',
    discountAmount: 0,
    paymentMode: 'CASH',
    transactionId: '',
  });

  const [structureForm, setStructureForm] = useState({
    classId: 1,
    feeCategoryId: 1,
    amount: '',
    dueDate: '2025-05-15',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [structRes, payRes, stRes, cRes] = await Promise.all([
        api.get('/school/fees/structures'),
        api.get('/school/fees/payments'),
        api.get('/school/students'),
        api.get('/school/classes'),
      ]);
      setStructures(structRes.data);
      setPayments(payRes.data);
      setStudents(stRes.data);
      setClasses(cRes.data);
      if (structRes.data.length > 0) {
        setPaymentForm((prev) => ({ ...prev, feeStructureId: structRes.data[0].id }));
      }
      if (stRes.data.length > 0) {
        setPaymentForm((prev) => ({ ...prev, studentId: stRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/fees/payments', paymentForm);
      setIsCollectOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStructureSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/fees/structures', structureForm);
      setIsStructureOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const paymentColumns = [
    {
      header: 'Receipt No.',
      accessor: 'receipt_number',
      render: (row) => (
        <code className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-mono text-[11px] font-bold">
          {row.receipt_number}
        </code>
      ),
    },
    {
      header: 'Student Details',
      accessor: 'student_name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white text-xs">{row.student_name}</div>
          <div className="text-[10px] text-slate-500 font-mono">Admission: {row.admission_number}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category_name',
      render: (row) => <Badge variant="neutral">{row.category_name || 'General Tuition'}</Badge>,
    },
    {
      header: 'Amount Paid',
      accessor: 'amount_paid',
      render: (row) => (
        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
          ${parseFloat(row.amount_paid).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Mode',
      accessor: 'payment_mode',
      render: (row) => <Badge variant="indigo">{row.payment_mode}</Badge>,
    },
    {
      header: 'Date',
      accessor: 'payment_date',
      render: (row) => (
        <span className="text-slate-500 font-mono text-[11px]">
          {new Date(row.payment_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Receipt',
      accessor: 'actions',
      render: (row) => (
        <Button variant="outline" size="sm" icon={Printer} onClick={() => setActiveReceipt(row)}>
          Print
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Fee Structure & Collection Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">MySQL Transactional Financial Payments & Print Receipts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={Plus} onClick={() => setIsStructureOpen(true)}>
            Create Fee Structure
          </Button>
          <Button variant="primary" size="sm" icon={DollarSign} onClick={() => setIsCollectOpen(true)}>
            Collect Student Fee
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Payment & Collection History
          </h3>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchData}>
            Refresh History
          </Button>
        </div>

        <DataTable
          columns={paymentColumns}
          data={payments}
          isLoading={loading}
          searchPlaceholder="Search receipt or student..."
          emptyMessage="No fee payments recorded yet"
        />
      </Card>

      {/* Collect Fee Modal */}
      <Modal isOpen={isCollectOpen} onClose={() => setIsCollectOpen(false)} title="Collect Student Fee Payment">
        <form onSubmit={handleCollectSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Student *</label>
            <select
              required
              value={paymentForm.studentId}
              onChange={(e) => setPaymentForm({ ...paymentForm, studentId: parseInt(e.target.value) })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.admission_number})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Fee Category Structure *</label>
              <select
                required
                value={paymentForm.feeStructureId}
                onChange={(e) => setPaymentForm({ ...paymentForm, feeStructureId: parseInt(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              >
                {structures.map((s) => (
                  <option key={s.id} value={s.id}>
                    Class {s.class_id} - ${s.amount} ({s.category_name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Amount Paid ($) *</label>
              <input
                type="number"
                required
                value={paymentForm.amountPaid}
                onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                placeholder="500.00"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Payment Mode</label>
              <select
                value={paymentForm.paymentMode}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              >
                <option value="CASH">CASH</option>
                <option value="CARD">CREDIT/DEBIT CARD</option>
                <option value="ONLINE">ONLINE BANK TRANSFER</option>
                <option value="CHEQUE">CHEQUE</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Discount Amount ($)</label>
              <input
                type="number"
                value={paymentForm.discountAmount}
                onChange={(e) => setPaymentForm({ ...paymentForm, discountAmount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCollectOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Structure Modal */}
      <Modal isOpen={isStructureOpen} onClose={() => setIsStructureOpen(false)} title="Create New Fee Structure">
        <form onSubmit={handleStructureSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Target Class</label>
              <select
                value={structureForm.classId}
                onChange={(e) => setStructureForm({ ...structureForm, classId: parseInt(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Amount ($)</label>
              <input
                type="number"
                required
                value={structureForm.amount}
                onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
                placeholder="1200.00"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsStructureOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Fee Structure
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      <Modal isOpen={!!activeReceipt} onClose={() => setActiveReceipt(null)} title="Official Fee Payment Receipt">
        {activeReceipt && (
          <div className="space-y-4 text-slate-800 dark:text-slate-200">
            <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="font-semibold text-slate-500">Receipt Number:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{activeReceipt.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Student Name:</span>
                <span className="font-bold">{activeReceipt.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Amount Paid:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${parseFloat(activeReceipt.amount_paid).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Payment Mode:</span>
                <span className="font-semibold">{activeReceipt.payment_mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Date:</span>
                <span className="font-mono">{new Date(activeReceipt.payment_date).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveReceipt(null)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print Hardcopy Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeeManagement;
