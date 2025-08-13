// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setErrorMsg(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) setErrorMsg(error.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen text-white py-8">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Reset your password</h1>
          
          <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6">
            {sent ? (
              <div className="text-center">
                <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 mb-4">
                  Reset link sent successfully!
                </div>
                <p className="text-gray-300">
                  We sent a reset link to <span className="font-semibold text-white">{email}</span>. 
                  Check your inbox and follow the instructions.
                </p>
              </div>
            ) : (
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
                <button className="w-full bg-[#33ccff]/20 text-white px-4 py-2 rounded-xl shadow-lg font-medium hover:bg-gray-100 transition-colors border border-[#33ccff]">
                  Send reset link
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
