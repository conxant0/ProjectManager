import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import supabase from '../../helper/supabaseClient';  // import your supabase client

const Profile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('User'); // default name if none found

  useEffect(() => {
    const fetchProfileName = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error fetching user:', userError);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('Profile')
        .select('name')
        .eq('userID', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (profileData && profileData.name) {
        setName(profileData.name);
      }
    };

    fetchProfileName();
  }, []);

  return (
    <div className= "profile-wrapper">
    <div className="profile-container">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      <div className="profile-card">
        <div className="profile-picture"></div>
        <h2 className="profile-name">{name}</h2>
        <div className="profile-links">
          <p onClick={() => navigate('/profile/view')} className="profile-link">
            View Profile
          </p>
          <p onClick={() => navigate('/profile/form')} className="profile-link">
            Edit Profile
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Profile;
