"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User } from 'lucide-react';
import { useGoalStore } from '@/store/useGoalStore';

export default function Home() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("employee@test.com");
  const [password, setPassword] = useState("employee123");

  const [name, setName] = useState("John Employee");
  const [role, setRole] = useState("Employee");

  const [loading, setLoading] = useState(false);

  const { setAuth } = useGoalStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const endpoint = isLogin
        ? '/api/auth/login'
        : '/api/auth/register';

      const bodyPayload = isLogin
        ? { email, password }
        : { name, email, password, role };

      const res = await fetch(`http://localhost:5005${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      setAuth(data.token, data.user);

      const normalizedRole = data.user.role?.toLowerCase();

      if (normalizedRole.includes('employee')) {
        router.push('/dashboard/employee');
      } else if (normalizedRole.includes('manager')) {
        router.push('/dashboard/manager');
      } else if (normalizedRole.includes('admin')) {
        router.push('/dashboard/admin');
      } else {
        alert('Unknown role: ' + data.user.role);
      }

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="max-w-md w-full bg-[#0b1120]/80 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>

        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          AtomQuest
        </h1>

        <p className="text-slate-400 mb-8 text-sm">
          Enterprise Goal-Setting & Tracking Portal
        </p>

        <form onSubmit={handleAuth} className="space-y-4 relative z-10">

          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full bg-black/20 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Persona Role
                </label>

                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-black/20 border border-slate-700/50 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Email Address
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="enterprise@atomberg.com"
                className="w-full bg-black/20 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1 mb-8">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Security Credential
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-black/20 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-xl shadow-blue-600/30 transition-all flex justify-center items-center gap-2 group disabled:opacity-50"
          >
            {loading
              ? 'Processing...'
              : (isLogin ? 'Secure Access' : 'Register Account')}

            <Shield
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
        </form>

        <div className="mt-6 text-center relative z-10">
          <button
            onClick={() => setIsLogin(!isLogin)}
            type="button"
            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            {isLogin
              ? 'Need an account? Sign up'
              : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}