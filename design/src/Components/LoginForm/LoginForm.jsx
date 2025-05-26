import React, { useState } from 'react'
import './LoginForm.css'
import { FaUser, FaLock } from "react-icons/fa"

import supabase from '../../helper/supabaseClient'
import { useNavigate } from 'react-router-dom'

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error(error)
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
  }

   const handleSignupClick = () => {
    navigate('/signup'); 
  };


  return (
    <div className='wrapper'>
      <form onSubmit={handleLogin}>
        <h1>Login</h1>
        <div className="input-box">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FaUser className='icon' />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FaLock className='icon' />
        </div>

        <div className="remember-forgot">
          <label><input type="checkbox" />Remember me</label>
          <a href="#">Forgot password?</a>
        </div>

        <button type="submit">Login</button>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <div className="register-link">
          <p>Don't have an account? <a href="#" onClick={(e) => {
          e.preventDefault(); 
          handleSignupClick();
        }}>
          Sign up
        </a>
      </p>

        </div>
      </form>
    </div>
  )
}

export default LoginForm
