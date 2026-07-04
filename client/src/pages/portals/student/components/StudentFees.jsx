import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, CheckCircle, AlertTriangle, FileText, X } from 'lucide-react';

const StudentFees = ({ studentFees, fetchStudentFees, fetchStudentDashboard }) => {
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
        <h3 className="text-lg font-extrabold text-slate-900">Fee Statements & Invoices</h3>
        <p className="text-xs text-slate-400 mt-1">Manage outstanding fee dues or review payment transactions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Unpaid Dues</span>
            <strong className="text-2xl font-black text-slate-900 mt-1 block">₹{totalUnpaidAmount.toLocaleString()}</strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-lg border border-rose-100">₹</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Cleared Dues</span>
            <strong className="text-2xl font-black text-emerald-600 mt-1 block">
              ₹{studentFees.filter(f => f.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100"><CheckCircle className="w-5 h-5" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Invoice Count</span>
            <strong className="text-2xl font-black text-blue-600 mt-1 block">{studentFees.length} Bills</strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100"><FileText className="w-5 h-5" /></div>
        </div>
      </div>

      {studentFees.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center text-xs text-slate-500">
          No billing statements found.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-400 font-medium">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold uppercase text-[9px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Billing Item / Invoice No</th>
                  <th className="px-6 py-4">Deadline Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {studentFees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <strong className="text-slate-900 font-extrabold block text-sm">{fee.title}</strong>
                        <span className="text-[9px] text-slate-500 block font-mono">TXN: {fee.transactionId || 'Awaiting Payment Clearance'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{new Date(fee.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4 font-black text-slate-900 text-sm">₹{fee.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-0.5 rounded-full text-[9px] font-black uppercase border ${fee.status === 'paid'
                          ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600'
                          : 'bg-rose-50 border-rose-500/20 text-rose-600'
                        }`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {fee.status === 'pending' ? (
                        <button
                          onClick={() => {
                            setCheckoutFeeModal(fee);
                            setPaymentStep('form');
                          }}
                          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] rounded-lg tracking-wider uppercase transition-all shadow"
                        >
                          Checkout
                        </button>
                      ) : (
                        <button className="px-4 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold text-[10px] rounded-lg tracking-wider uppercase transition-all">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl relative overflow-hidden text-left">
            {paymentStep === 'form' && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Checkout Gateway</h3>
                    <p className="text-xs text-slate-500 mt-1">Settle invoice via secure transaction.</p>
                  </div>
                  <button onClick={() => setCheckoutFeeModal(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{checkoutFeeModal.title}</span>
                    <span className="text-xs text-slate-600 block mt-0.5">Due: {new Date(checkoutFeeModal.dueDate).toLocaleDateString()}</span>
                  </div>
                  <strong className="text-2xl font-black text-slate-900">₹{checkoutFeeModal.amount.toLocaleString()}</strong>
                </div>

                <form onSubmit={handlePaymentCheckoutSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cardholder Name</label>
                    <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-transparent text-slate-900 font-semibold focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-transparent text-slate-900 font-mono focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry (MM/YY)</label>
                      <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-transparent text-slate-900 font-mono focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">CVC Code</label>
                      <input type="password" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} maxLength="3" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-transparent text-slate-900 font-mono focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <button type="submit" disabled={processingPayment} className="w-full py-3.5 mt-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[12px] rounded-xl tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" /> Pay ₹{checkoutFeeModal.amount.toLocaleString()} Securely
                  </button>
                </form>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Processing Payment</h4>
                  <p className="text-xs text-slate-500 mt-1 animate-pulse">{processingStatus}</p>
                </div>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-500">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">Payment Successful!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-[250px] mx-auto leading-relaxed">{paymentSuccessMsg}</p>
                </div>
                <button onClick={() => { setCheckoutFeeModal(null); setPaymentStep('form'); }} className="px-6 py-2.5 bg-slate-900 text-white font-extrabold text-[11px] rounded-xl tracking-wider uppercase transition-all mt-4">
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
