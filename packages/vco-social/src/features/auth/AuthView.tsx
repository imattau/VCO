import React, { useState } from 'react';
import { Shield, Lock, Key, ArrowRight, Loader2, AlertCircle, Upload } from 'lucide-react';
import { KeyringService } from '@/lib/KeyringService';

interface AuthViewProps {
  onUnlock: (password: string) => Promise<void>;
  onCreate: (password: string) => Promise<void>;
  hasExisting: boolean;
}

export function AuthView({ onUnlock, onCreate, hasExisting }: AuthViewProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [importPackage, setImportPackage] = useState('');
  const [mode, setMode] = useState<'unlock' | 'create' | 'import'>(hasExisting ? 'unlock' : 'create');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'create' && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'import') {
        if (!importPackage.trim()) {
          setError("Please provide an encrypted package");
          setIsLoading(false);
          return;
        }
        await KeyringService.importEncryptedPackage(importPackage.trim());
        await onUnlock(password);
      } else if (mode === 'create') {
        await onCreate(password);
      } else {
        await onUnlock(password);
      }
    } catch (err) {
      setError(mode === 'unlock' ? "Incorrect password or corrupted identity" : "Operation failed");
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
            {mode === 'create' ? "Secure Swarm" : mode === 'import' ? "Import Swarm" : "Unlock Identity"}
          </h1>
          <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">
            {mode === 'create' 
              ? "Establish your decentralized presence" 
              : mode === 'import' ? "Paste your encrypted identity package"
              : "Enter your password to access the VCO network"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          
          {mode === 'import' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">
                Encrypted Identity Package
              </label>
              <div className="relative">
                <textarea
                  value={importPackage}
                  onChange={(e) => setImportPackage(e.target.value)}
                  placeholder='{"salt": "...", "iv": "...", "ciphertext": "..."}'
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-4 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none font-mono text-[10px] h-24 resize-none"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">
              {mode === 'import' ? "Original Passphrase" : "Passphrase"}
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

          {mode === 'create' && (
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
            {isLoading ? <Loader2 className="animate-spin" /> : (mode === 'create' ? "Create Identity" : mode === 'import' ? "Import & Unlock" : "Unlock")}
            {!isLoading && <ArrowRight size={18} />}
          </button>

          <div className="pt-4 flex flex-col items-center gap-4">
            {mode === 'unlock' ? (
              <>
                <button type="button" onClick={() => { setMode('create'); setError(null); }} className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all">Need a new identity? Create one</button>
                <button type="button" onClick={() => { setMode('import'); setError(null); }} className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all">Recover existing identity?</button>
              </>
            ) : mode === 'create' ? (
              <button type="button" onClick={() => { setMode('unlock'); setError(null); }} className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all">Already have an identity? Unlock</button>
            ) : (
              <button type="button" onClick={() => { setMode('unlock'); setError(null); }} className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all">Cancel Import</button>
            )}
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
