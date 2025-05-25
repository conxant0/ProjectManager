import React, { useState } from 'react'
import supabase from '../../helper/supabaseClient'
import './SignUpForm.css'

const SignUpForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Sign-up successful! Check your email for confirmation.')
      console.log(data)
    }
  }

  return (
    <div className="wrapper">
      <form onSubmit={handleSignUp}>
        <h1>Sign Up</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (6+ chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Create Account</button>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
      </form>
    </div>
  )
}

export default SignUpForm
