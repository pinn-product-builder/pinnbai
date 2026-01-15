import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Pinn Logo SVG Component - matching original design
const PinnLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2.5", className)}>
    {/* Icon - Two interlocking angular brackets forming S shape */}
    <svg 
      viewBox="0 0 32 32" 
      className="w-7 h-7"
      fill="none"
    >
      {/* Top-left bracket: vertical down then diagonal to center-right (lighter orange) */}
      <path 
        d="M6 2 L6 10 L18 22" 
        stroke="#FF8A3D" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      {/* Bottom-right bracket: vertical up then diagonal to center-left (darker orange) */}
      <path 
        d="M26 30 L26 22 L14 10" 
        stroke="#C84E0A" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
    {/* Text */}
    <span className="text-xl font-bold text-white tracking-tight">Pinn</span>
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
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="glass-card-glow p-8 rounded-2xl border border-border animate-scale-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            {/* Pinn Logo */}
            <PinnLogo className="mb-4 drop-shadow-[0_0_20px_hsl(var(--pinn-orange-500)/0.6)] animate-fade-in [animation-delay:100ms]" />
            
            <h1 className="text-3xl font-bold text-gradient-primary drop-shadow-[0_0_25px_hsl(var(--pinn-orange-500)/0.6)] animate-fade-in [animation-delay:300ms]">
              Pinn Growth
            </h1>
            <p className="text-lg font-semibold text-pinn-gold-400 mt-2 drop-shadow-[0_0_20px_hsl(var(--pinn-gold-500)/0.5)] animate-fade-in [animation-delay:400ms]">
              Business Analytics Intelligence
            </p>
            <p className="text-text-3 text-sm mt-3 animate-fade-in [animation-delay:500ms]">Entre com suas credenciais</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in [animation-delay:600ms]">
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
        <p className="text-center text-text-3 text-xs mt-6 animate-fade-in [animation-delay:800ms]">
          © {new Date().getFullYear()} Pinn. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
