// src/pages/auth/OAuthCallbackPage.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export default function OAuthCallbackPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // once session is present, bounce to where they were going
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  return <p className="p-6 text-white">Signing you in…</p>
}
