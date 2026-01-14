import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Pinn Logo SVG Component
const PinnLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    {/* Icon */}
    <svg 
      viewBox="0 0 40 40" 
      className="w-8 h-8"
      fill="none"
    >
      {/* Top right arrow */}
      <path 
        d="M28 8 L36 8 L36 16" 
        stroke="url(#gradient1)" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M36 8 L24 20" 
        stroke="url(#gradient1)" 
        strokeWidth="4" 
        strokeLinecap="round"
      />
      {/* Bottom left arrow */}
      <path 
        d="M12 32 L4 32 L4 24" 
        stroke="url(#gradient2)" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M4 32 L16 20" 
        stroke="url(#gradient2)" 
        strokeWidth="4" 
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C42" />
          <stop offset="100%" stopColor="#E85D04" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E85D04" />
          <stop offset="100%" stopColor="#C44D04" />
        </linearGradient>
      </defs>
    </svg>
    {/* Text */}
    <span className="text-2xl font-bold text-white tracking-tight">Pinn</span>
  </div>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, loading } = useAuthContext();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn(email, password);

    if (result.success) {
      navigate('/dash/executivo');
    } else {
      setError(result.error?.message || 'Erro ao fazer login');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pinn-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-pinn-gold-500/8 rounded-full blur-[100px]" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="glass-card-glow p-8 rounded-2xl border border-border">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            {/* Pinn Logo */}
            <PinnLogo className="mb-4 drop-shadow-[0_0_20px_hsl(var(--pinn-orange-500)/0.6)]" />
            <p className="text-xs text-text-3 tracking-widest uppercase mb-4">Business Analytics Intelligence</p>
            
            <h1 className="text-3xl font-bold text-gradient-primary drop-shadow-[0_0_25px_hsl(var(--pinn-orange-500)/0.6)]">
              Pinn Growth
            </h1>
            <p className="text-lg font-semibold text-pinn-gold-400 mt-2 drop-shadow-[0_0_20px_hsl(var(--pinn-gold-500)/0.5)]">
              BAI Analytics Dashboard
            </p>
            <p className="text-text-3 text-sm mt-3">Entre com suas credenciais</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-2 text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "pl-10 bg-bg-1 border-border text-text-1 placeholder:text-text-3",
                    "focus:border-pinn-orange-500/50 focus:ring-focus"
                  )}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-2 text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "pl-10 pr-10 bg-bg-1 border-border text-text-1 placeholder:text-text-3",
                    "focus:border-pinn-orange-500/50 focus:ring-focus"
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className={cn(
                "w-full h-11 bg-pinn-gradient text-bg-0 font-semibold",
                "hover:opacity-90 transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-text-3 text-xs mt-6">
          © 2024 Pinn. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
