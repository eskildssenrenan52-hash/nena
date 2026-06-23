import { useState } from 'react'

interface RegisterPanelProps {
  onRegister: (email: string, username: string) => void
  onSwitchToLogin: () => void
  isLoading?: boolean
}

export default function RegisterPanel({
  onRegister,
  onSwitchToLogin,
  isLoading = false,
}: RegisterPanelProps) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validateUsername = (username: string): boolean => {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(username)
  }

  const handleRegister = () => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Digite seu email.'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email inválido.'
    }

    if (!confirmEmail.trim()) {
      newErrors.confirmEmail = 'Confirme seu email.'
    } else if (email !== confirmEmail) {
      newErrors.confirmEmail = 'Os emails não correspondem.'
    }

    if (!username.trim()) {
      newErrors.username = 'Digite um nome de usuário.'
    } else if (!validateUsername(username)) {
      newErrors.username = 'De 3-20 caracteres, apenas letras, números, _ e -'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onRegister(email, username)
    }
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
          Criar Conta
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Registre-se para salvar seu progresso na nuvem
        </p>

        {/* Email Input */}
        <div className="mb-3">
          <label className="block text-sm text-muted-foreground mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrors({ ...errors, email: '' })
            }}
            placeholder="seu@email.com"
            disabled={isLoading}
            className="w-full px-3 py-2 rounded text-sm outline-none"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: errors.email ? '1px solid #c84040' : '1px solid #2a3860',
              color: '#e8d9b5',
              fontFamily: 'monospace',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'auto',
            }}
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Confirm Email Input */}
        <div className="mb-3">
          <label className="block text-sm text-muted-foreground mb-1">Confirme seu Email</label>
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => {
              setConfirmEmail(e.target.value)
              setErrors({ ...errors, confirmEmail: '' })
            }}
            placeholder="confirme@email.com"
            disabled={isLoading}
            className="w-full px-3 py-2 rounded text-sm outline-none"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: errors.confirmEmail ? '1px solid #c84040' : '1px solid #2a3860',
              color: '#e8d9b5',
              fontFamily: 'monospace',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'auto',
            }}
          />
          {errors.confirmEmail && (
            <p className="text-red-400 text-xs mt-1">{errors.confirmEmail}</p>
          )}
        </div>

        {/* Username Input */}
        <div className="mb-4">
          <label className="block text-sm text-muted-foreground mb-1">Nome de Usuário</label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setErrors({ ...errors, username: '' })
            }}
            placeholder="seu_usuario"
            disabled={isLoading}
            className="w-full px-3 py-2 rounded text-sm outline-none"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: errors.username ? '1px solid #c84040' : '1px solid #2a3860',
              color: '#e8d9b5',
              fontFamily: 'monospace',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'auto',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) handleRegister()
            }}
          />
          {errors.username && (
            <p className="text-red-400 text-xs mt-1">{errors.username}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleRegister}
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
            {isLoading ? 'Criando Conta...' : 'Registrar'}
          </button>

          <button
            onClick={onSwitchToLogin}
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
            Voltar para Login
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground/70 text-center mt-4">
          Seus dados estão seguros e protegidos
        </p>
      </div>
    </div>
  )
}
