import React, { useState } from 'react';
import { ShieldCheck, CreditCard, ArrowRight, Check, Sparkles, Loader2 } from 'lucide-react';

interface RazorpayModalProps {
  amount: number;
  locationName: string;
  spotName: string;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

export default function RazorpayModal({ amount, locationName, spotName, onSuccess, onClose }: RazorpayModalProps) {
  const [method, setMethod] = useState<'card' | 'upi' | 'wallet'>('card');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Form Fields
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [upiId, setUpiId] = useState('sarah@okaxis');

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate transaction latency
    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
      
      // Simulate confirmation latency
      setTimeout(() => {
        const simulatedPaymentId = `pay_razor_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        onSuccess(simulatedPaymentId);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-2xl transition-colors duration-300">
        
        {/* Razorpay Authentic Blue Header */}
        <div className="bg-[#0b1c3f] p-6 text-white relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* Razorpay-style logo */}
              <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center font-black italic text-sm tracking-tighter">
                R
              </div>
              <div>
                <h4 className="text-xs text-zinc-400 font-bold tracking-wider uppercase">ParkSmart Gateway</h4>
                <p className="text-sm font-semibold text-white">Razorpay Secure Checkout</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              disabled={processing}
              className="text-zinc-400 hover:text-white font-bold text-xs px-2.5 py-1 rounded bg-zinc-800/40"
            >
              Cancel
            </button>
          </div>

          <div className="mt-6 flex justify-between items-baseline">
            <div>
              <span className="text-[10px] text-zinc-400 font-semibold block uppercase">ORDER ID</span>
              <span className="text-xs font-mono font-bold text-zinc-200">order_parking_{Math.random().toString(36).substring(2, 8)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 font-semibold block">AMOUNT DUE</span>
              <span className="text-2xl font-black text-white">₹{amount}</span>
            </div>
          </div>
        </div>

        {/* Payment Main Container */}
        <div className="p-6">
          {processing ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <div>
                <h4 className="font-bold text-zinc-800 dark:text-zinc-100">Securing Transaction...</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">Please do not refresh this page. Communicating with Razorpay merchant servers.</p>
              </div>
            </div>
          ) : completed ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-lg text-zinc-900 dark:text-white">Payment Authorized!</h4>
                <p className="text-xs text-zinc-400 mt-1">Generating QR check-in ticket & confirming spot {spotName}.</p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Redirecting to your ticket board</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              
              {/* Method tabs */}
              <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`py-2 rounded-lg text-xs font-bold transition ${
                    method === 'card' 
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950'
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`py-2 rounded-lg text-xs font-bold transition ${
                    method === 'upi' 
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950'
                  }`}
                >
                  UPI (BHIM)
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('wallet')}
                  className={`py-2 rounded-lg text-xs font-bold transition ${
                    method === 'wallet' 
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950'
                  }`}
                >
                  P-Wallet
                </button>
              </div>

              {/* Form panel based on method */}
              <div className="min-h-[140px]">
                {method === 'card' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Card Number</label>
                      <input 
                        type="text" 
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full text-sm px-3 py-2 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Expiry (MM/YY)</label>
                        <input 
                          type="text" 
                          required
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full text-sm px-3 py-2 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">CVV</label>
                        <input 
                          type="password" 
                          required
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          maxLength={3}
                          className="w-full text-sm px-3 py-2 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {method === 'upi' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Enter Virtual Payment Address (UPI ID)</label>
                      <input 
                        type="text" 
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@bank"
                        className="w-full text-sm px-3 py-2 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      <span>✓ Supports GooglePay, PhonePe, Paytm, and BHIM UPI networks.</span>
                    </div>
                  </div>
                )}

                {method === 'wallet' && (
                  <div className="space-y-3 py-2 text-center text-zinc-600 dark:text-zinc-400">
                    <p className="text-xs">
                      Utilize your preloaded digital demo wallet to complete the booking immediately.
                    </p>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl text-xs font-semibold">
                      Your balance is automatically deducted on authorization.
                    </div>
                  </div>
                )}
              </div>

              {/* Secure footer checkout trigger */}
              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1361e7] hover:bg-[#0c51cb] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10"
                >
                  <span>Pay Securely ₹{amount}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>ISO 27001 Verified • PCI-DSS Compliant</span>
                </div>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
