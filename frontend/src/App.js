import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';

import LoginForm from './Components/LoginForm/LoginForm';
import SignUpForm from './Components/SignUpForm/SignUpForm';
import Dashboard from './Components/Dashboard/Dashboard';
import Profile from './Components/Profile/Profile';
import ProjectForm from './Components/ProjectForm/ProjectForm';
import PublicProfile from './Components/ShareableInfo/PublicProfile'; 
import ProfileForm from './Components/ProfileForm/ProfileForm';
import supabase from './helper/supabaseClient';

// ProjectForm wrapper to support onCancel and onSave
const ProjectFormWrapper = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleSave = (data) => {
    console.log('Project saved:', data); // Add your Supabase logic here
    navigate('/dashboard');
  };

  return <ProjectForm onCancel={handleCancel} onSave={handleSave} />;
};

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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
        <Route
          path="/profile"
          element={session ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/add-project"
          element={session ? <ProjectFormWrapper /> : <Navigate to="/login" />}
        />
        <Route
          path="/u/:username"
          element={<PublicProfile />}
        />
        <Route path="/profile/form" element={<ProfileForm/>}/>
      </Routes>
    </Router>
  );
}

export default App;
