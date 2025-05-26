import React from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../../helper/supabaseClient'

const Dashboard = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error.message)
    } else {
      navigate('/') // redirect to login
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>DASHBOARD!</h1>
      <p>Welcome — you are logged in.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Dashboard
