import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import LoginForm from './Components/LoginForm/LoginForm'
import SignUpForm from './Components/SignUpForm/SignUpForm'
import Dashboard from './Components/Dashboard/Dashboard'
import supabase from './helper/supabaseClient'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Check if user is already logged in on mount
    const currentSession = supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={session ? <Navigate to="/dashboard" /> : <LoginForm />}
        />
        <Route
          path="/login"
          element={session ? <Navigate to="/dashboard" /> : <LoginForm />}
        />
        <Route
          path="/signup"
          element={session ? <Navigate to="/dashboard" /> : <SignUpForm />}
        />
        <Route
          path="/dashboard"
          element={session ? <Dashboard /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  )
}

export default App
