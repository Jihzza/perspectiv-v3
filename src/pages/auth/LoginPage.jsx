// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  async function loginEmail(e) {
    e.preventDefault()
    setLoading(true); setErrorMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setErrorMsg(error.message)
    navigate(from, { replace: true })
  }

  async function loginGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) setErrorMsg(error.message)
    // redirect happens automatically
  }

  return (
    <div className="h-full text-white grid place-items-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Log in to Perspectiv</h1>
          
          <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6">
            <form onSubmit={loginEmail} className="space-y-4">
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
                  placeholder="Enter your password"
                  required 
                />
              </div>
              <button 
                disabled={loading} 
                className="w-full bg-[#33ccff]/20 text-white px-4 py-2 rounded-xl shadow-lg font-medium hover:bg-gray-100 transition-colors border border-[#33ccff]"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <hr className="m-4 text-white/75" />

            <div className="">
              <button 
                onClick={loginGoogle} 
                className="w-full bg-white/10 border border-white/25 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                Continue with Google
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {errorMsg}
              </div>
            )}
            
            <div className="mt-6 text-sm flex justify-between">
              <Link className="text-blue-300 hover:text-blue-200 transition-colors" to="/signup">
                Create account
              </Link>
              <Link className="text-blue-300 hover:text-blue-200 transition-colors" to="/forgot-password">
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
