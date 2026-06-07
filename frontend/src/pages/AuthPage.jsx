import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        if (!form.name.trim()) return toast.error('Name is required');
        await register(form.name, form.email, form.password);
        toast.success('Account created!');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💰</div>
          <h1 className="text-2xl font-semibold text-gray-800">FinTrack</h1>
          <p className="text-gray-400 text-sm mt-1">Your personal finance companion</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                  mode === m ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                }`}
              >
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="label">Full name</label>
                <input name="name" value={form.name} onChange={handle} className="input" placeholder="Rahul Sharma" />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle} className="input" placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && submit()} />
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="btn btn-primary w-full mt-5 justify-center py-2.5"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Demo: email <span className="font-mono">demo@fintrack.com</span> / password <span className="font-mono">demo123</span>
        </p>
      </div>
    </div>
  );
}
