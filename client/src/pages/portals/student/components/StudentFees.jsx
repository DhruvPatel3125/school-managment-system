import React, { useState } from 'react';
import axios from 'axios';
import { useTenantTheme } from '../../../../context/TenantThemeContext';
import { Loader2, CheckCircle, AlertTriangle, FileText, X, Lock, CreditCard, Award } from 'lucide-react';

const StudentFees = ({ studentFees, fetchStudentFees, fetchStudentDashboard }) => {
  const { tenant } = useTenantTheme();
  
  const pendingFees = studentFees.filter(f => f.status === 'pending');
  const totalUnpaidAmount = pendingFees.reduce((sum, f) => sum + f.amount, 0);

  const [checkoutFeeModal, setCheckoutFeeModal] = useState(null);
  const [paymentStep, setPaymentStep] = useState('form');
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');
  
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardName, setCardName] = useState('Student Name');

  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';

  const handlePaymentCheckoutSubmit = async (e) => {
    e.preventDefault();
    setPaymentStep('processing');
    setProcessingStatus('Securing secure client connection...');

    try {
      await new Promise(r => setTimeout(r, 800));
      setProcessingStatus('Verifying Visa/Mastercard 3D-Secure credentials...');
      await new Promise(r => setTimeout(r, 800));
      setProcessingStatus('Posting authorized ledger transaction...');
      await new Promise(r => setTimeout(r, 600));

      const res = await axios.post(`http://localhost:5001/api/v1/students/portal/fees/${checkoutFeeModal._id}/pay`);
      if (res.data.success) {
        setPaymentStep('success');
        setPaymentSuccessMsg(`Payment Processed Successfully! Transaction ID: ${res.data.data.transactionId}`);
        fetchStudentFees();
        fetchStudentDashboard();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Payment transaction failed.');
      setPaymentStep('form');
      setCheckoutFeeModal(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="text-base font-bold text-slate-900 leading-tight">Fee Statements & Invoices</h3>
        <p className="text-xs text-slate-500 mt-0.5">Manage outstanding fee invoices and review billing statements.</p>
      </div>

      {/* Flat metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-left">
          <span className="text-[10px] text-slate-550 font-semibold block uppercase tracking-wider">Unpaid Dues</span>
          <strong className="text-2xl font-bold text-slate-900 mt-1 block">₹{totalUnpaidAmount.toLocaleString()}</strong>
          <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1.5 mt-2.5">
            <AlertTriangle className="w-3 h-3" /> {pendingFees.length} outstanding invoices
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-left">
          <span className="text-[10px] text-slate-550 font-semibold block uppercase tracking-wider">Cleared Dues</span>
          <strong className="text-2xl font-bold text-emerald-600 mt-1 block">
            ₹{studentFees.filter(f => f.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
          </strong>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5 mt-2.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Settled in full
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-left">
          <span className="text-[10px] text-slate-550 font-semibold block uppercase tracking-wider">Total Bills Issued</span>
          <strong className="text-2xl font-bold text-slate-700 mt-1 block">{studentFees.length} Invoices</strong>
          <span className="text-[11px] text-slate-450 font-semibold flex items-center gap-1.5 mt-2.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" /> Complete academic cycle
          </span>
        </div>
      </div>

      {studentFees.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 text-center">
          <FileText className="w-8 h-8 text-slate-350 mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-slate-700">No Invoices Found</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">There are no fee billing details logged for your profile.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-600 font-medium">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">Billing Item / Invoice</th>
                  <th className="px-5 py-3">Deadline Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {studentFees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <strong className="text-slate-800 font-bold block text-xs">{fee.title}</strong>
                        <span className="text-[9px] text-slate-400 block font-mono">TXN: {fee.transactionId || 'Awaiting Payment'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-500">{new Date(fee.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 text-xs">₹{fee.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${fee.status === 'paid'
                          ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                          : 'bg-rose-50 border-rose-250 text-rose-700'
                        }`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {fee.status === 'pending' ? (
                        <button
                          onClick={() => {
                            setCheckoutFeeModal(fee);
                            setPaymentStep('form');
                          }}
                          className="px-3.5 py-1.5 text-white font-semibold text-[10px] rounded-lg shadow-sm hover:opacity-95 active:scale-95 transition-all uppercase tracking-wider"
                          style={{ backgroundColor: primaryBrandColor }}
                        >
                          Checkout
                        </button>
                      ) : (
                        <button className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold text-[10px] rounded-lg transition-colors uppercase tracking-wider">
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl p-6 border border-slate-200 shadow-xl relative overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
            {paymentStep === 'form' && (
              <div className="space-y-5">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Secure Payment Checkout</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">EduCore Payment Gateway</p>
                  </div>
                  <button onClick={() => setCheckoutFeeModal(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors"><X className="w-4 h-4" /></button>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">{checkoutFeeModal.title}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Due: {new Date(checkoutFeeModal.dueDate).toLocaleDateString()}</span>
                  </div>
                  <strong className="text-xl font-bold text-slate-800">₹{checkoutFeeModal.amount.toLocaleString()}</strong>
                </div>

                <form onSubmit={handlePaymentCheckoutSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cardholder Name</label>
                    <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-250 bg-white text-slate-800 focus:outline-none focus:border-slate-500 text-xs transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="w-3.5 h-3.5 text-slate-450 absolute left-3 top-2.5" />
                      <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-250 bg-white text-slate-800 font-mono text-xs focus:outline-none focus:border-slate-500 transition-colors" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry (MM/YY)</label>
                      <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-250 bg-white text-slate-800 font-mono text-xs focus:outline-none focus:border-slate-500 transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CVC Code</label>
                      <input type="password" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} maxLength="3" className="w-full px-3 py-2 rounded-lg border border-slate-250 bg-white text-slate-800 font-mono text-xs focus:outline-none focus:border-slate-500 transition-colors" required />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={processingPayment} 
                    className="w-full py-2.5 mt-2 text-white font-semibold text-[11px] rounded-lg tracking-wider uppercase transition-all shadow flex items-center justify-center gap-1.5 hover:opacity-95"
                    style={{ backgroundColor: primaryBrandColor }}
                  >
                    <Lock className="w-3.5 h-3.5" /> Settle ₹{checkoutFeeModal.amount.toLocaleString()} securely
                  </button>
                </form>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-3 border-slate-100 rounded-full"></div>
                  <div className="w-12 h-12 border-3 border-t-transparent rounded-full animate-spin absolute inset-0" style={{ borderTopColor: primaryBrandColor }}></div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Processing Payment</h4>
                  <p className="text-[10px] text-slate-400 mt-1 animate-pulse font-semibold uppercase tracking-wider">{processingStatus}</p>
                </div>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight">Payment Settled</h4>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[280px] mx-auto leading-relaxed">{paymentSuccessMsg}</p>
                </div>
                <button 
                  onClick={() => { setCheckoutFeeModal(null); setPaymentStep('form'); }} 
                  className="px-5 py-2 text-white font-semibold text-[10px] rounded-lg tracking-wider uppercase transition-all hover:opacity-95 mt-2"
                  style={{ backgroundColor: primaryBrandColor }}
                >
                  Close Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFees;
