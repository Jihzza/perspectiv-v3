// src/pages/auth/ResetPasswordPage.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [ok, setOk] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Optional: you can listen for PASSWORD_RECOVERY here if you want to gate UI
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // user has a recovery session; show the change-password form (already shown)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setErrorMsg(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setErrorMsg(error.message)
    else {
      setOk(true)
      setTimeout(() => navigate('/login'), 1200)
    }
  }

  return (
    <div className="min-h-screen text-white py-8">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Choose a new password</h1>
          
          <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6">
            {ok ? (
              <div className="text-center">
                <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 mb-4">
                  Password updated successfully!
                </div>
                <p className="text-gray-300">Redirecting to login page...</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">New password</label>
                  <input 
                    className="ui-input" 
                    type="password"
                    value={password} 
                    onChange={e=>setPassword(e.target.value)} 
                    placeholder="Enter your new password"
                    required 
                  />
                </div>
                <button className="w-full bg-[#33ccff]/15 text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Update password
                </button>
              </form>
            )}
            
            {errorMsg && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {errorMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
