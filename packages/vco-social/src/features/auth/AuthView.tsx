import React, { useState } from 'react';
import { Shield, Lock, Key, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { KeyringService } from '@/lib/KeyringService';

interface AuthViewProps {
  onUnlock: (password: string) => Promise<void>;
  onCreate: (password: string) => Promise<void>;
  hasExisting: boolean;
}

export function AuthView({ onUnlock, onCreate, hasExisting }: AuthViewProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreating, setIsCreating] = useState(!hasExisting);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isCreating && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      if (isCreating) {
        await onCreate(password);
      } else {
        await onUnlock(password);
      }
    } catch (err) {
      setError(isCreating ? "Failed to create identity" : "Incorrect password or corrupted identity");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-600/20 mb-4">
            <Shield className="text-white w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            {isCreating ? "Secure Swarm" : "Unlock Identity"}
          </h1>
          <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">
            {isCreating 
              ? "Establish your decentralized presence" 
              : "Enter your password to access the VCO network"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">
              Passphrase
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none font-mono"
                required
              />
            </div>
          </div>

          {isCreating && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">
                Confirm Passphrase
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none font-mono"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-500 text-xs font-bold animate-shake">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (isCreating ? "Create Identity" : "Unlock")}
            {!isLoading && <ArrowRight size={18} />}
          </button>

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsCreating(!isCreating);
                setError(null);
              }}
              className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all"
            >
              {isCreating ? "Already have an identity? Unlock" : "Need a new identity? Create one"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
            Your private keys are encrypted locally.<br />
            Lost passwords cannot be recovered by the swarm.
          </p>
        </div>
      </div>
    </div>
  );
}
