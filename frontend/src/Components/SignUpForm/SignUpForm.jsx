import React, { useState } from 'react'
import supabase from '../../helper/supabaseClient'
import './SignUpForm.css'
import { FaEnvelope, FaLock } from "react-icons/fa"
import { useNavigate } from 'react-router-dom'

const SignUpForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate();

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

   const handleLoginClick = () => {
    navigate('/login'); 
  };


  return (
    <div className="wrapper">
      <form onSubmit={handleSignUp}>
        <h1>Sign Up</h1>
        <div className="input-box">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FaEnvelope className='icon' />
        </div>
        
        <div className="input-box">
        <input
          type="password"
          placeholder="Password (6 or More Characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FaLock className='icon' />
        </div>

        <div className="remember-forgot">
          <label><input type="checkbox" />I agree to the terms and conditions</label>
        </div>

        <button type="submit">Create Account</button>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

        <div className="register-link">
          <p>Already have an account? <a href="/login" onClick={(e) => {
          e.preventDefault(); 
          handleLoginClick();
        }}>
          Login
        </a>
      </p>
        </div>

      </form>
    </div>
  )
}

export default SignUpForm
