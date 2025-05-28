import React from 'react'
import './Profile.css'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const navigate = useNavigate()

  return (
    <div className="profile-container">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      <div className="profile-card">
        <h1>Your Profile</h1>
        <p><strong>Name:</strong> Jane Doe</p>
        <p><strong>Email:</strong> jane.doe@example.com</p>
        <p><strong>Role:</strong> UI/UX Designer</p>
        <p><strong>Joined:</strong> January 2024</p>
      </div>
    </div>
  )
}

export default Profile
