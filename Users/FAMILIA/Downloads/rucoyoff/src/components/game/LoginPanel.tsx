import { useState } from 'react'

interface LoginPanelProps {
  onLogin: (email: string) => void
  onSwitchToRegister: () => void
  onContinueAsGuest: () => void
  isLoading?: boolean
}

export default function LoginPanel({
  onLogin,
  onSwitchToRegister,
  onContinueAsGuest,
  isLoading = false,
}: LoginPanelProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleLogin = () => {
    setError('')

    if (!email.trim()) {
      setError('Digite seu email.')
      return
    }

    if (!validateEmail(email)) {
      setError('Email inválido.')
      return
    }

    onLogin(email)
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: 100, background: 'rgba(0,0,0,0.8)' }}
    >
      <div
        className="rounded-lg p-6 w-full max-w-md"
        style={{
          background: 'rgba(8,10,18,0.98)',
          border: '2px solid #2a3860',
          boxShadow: '0 0 60px rgba(0,0,0,0.9)',
        }}
      >
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#f0c040', fontFamily: 'serif' }}>
          Fazer Login
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Acesse sua conta para continuar suas aventuras
        </p>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-sm text-muted-foreground mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            placeholder="seu@email.com"
            disabled={isLoading}
            className="w-full px-3 py-2 rounded text-sm outline-none"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid #2a3860',
              color: '#e8d9b5',
              fontFamily: 'monospace',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'auto',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) handleLogin()
            }}
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-400 text-xs mb-3" style={{ textShadow: '0 0 10px rgba(200,64,64,0.3)' }}>
            ⚠ {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-2 rounded font-bold text-sm transition-all"
            style={{
              background: isLoading
                ? 'rgba(201,149,42,0.1)'
                : 'linear-gradient(135deg,rgba(201,149,42,0.25),rgba(201,149,42,0.1))',
              border: '2px solid #c9952a',
              color: isLoading ? '#c9952a' : '#f0c040',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = 'linear-gradient(135deg,rgba(201,149,42,0.4),rgba(201,149,42,0.2))'
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.background = 'linear-gradient(135deg,rgba(201,149,42,0.25),rgba(201,149,42,0.1))'
            }}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            onClick={onContinueAsGuest}
            disabled={isLoading}
            className="w-full py-2 rounded font-bold text-sm transition-all"
            style={{
              background: 'rgba(100,120,160,0.1)',
              border: '2px solid #6478a0',
              color: '#90b0d0',
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = 'rgba(100,120,160,0.2)'
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.background = 'rgba(100,120,160,0.1)'
            }}
          >
            Continuar como Visitante
          </button>

          <button
            onClick={onSwitchToRegister}
            disabled={isLoading}
            className="w-full py-2 rounded font-bold text-sm text-muted-foreground transition-all"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid #2a3860',
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.borderColor = '#3a4860'
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.borderColor = '#2a3860'
            }}
          >
            Criar Conta
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground/70 text-center mt-4">
          Salve seu progresso na nuvem com uma conta
        </p>
      </div>
    </div>
  )
}
