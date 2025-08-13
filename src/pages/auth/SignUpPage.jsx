// src/pages/auth/SignUpPage.jsx
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Link, useNavigate } from 'react-router-dom'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true); setMessage(null)
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    setLoading(false)
    if (error) return setMessage(error.message)

    // Confirm-email ON => ask user to check inbox; OFF => redirect (already signed in)
    if (!data.session) setMessage('Check your email to confirm your account.')
    else navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B2537] to-[#000000] text-white py-8">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Create your account</h1>
          
          <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input 
                  className="ui-input" 
                  type="email"
                  value={email} 
                  onChange={e=>setEmail(e.target.value)} 
                  placeholder="your@email.com"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input 
                  className="ui-input" 
                  type="password"
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  placeholder="Choose a password"
                  required 
                />
              </div>
              <button 
                disabled={loading} 
                className="w-full bg-[#33ccff]/20 text-white px-4 py-2 rounded-xl shadow-lg font-medium hover:bg-gray-100 transition-colors border border-[#33ccff]"
              >
                {loading ? 'Creating...' : 'Sign up'}
              </button>
            </form>
            
            {message && (
              <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm">
                {message}
              </div>
            )}
            
            <p className="mt-6 text-sm text-center">
              Have an account?{' '}
              <Link className="text-blue-300 hover:text-blue-200 transition-colors" to="/login">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
