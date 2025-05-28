import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(false)
  const [editorMode, setEditorMode] = useState(false)

  const handleLogout = () => {
    navigate('/')
  }

  const goToProfile = () => {
    navigate('/profile')
  }

  const goToAddProject = () => {
  if (editorMode) {
    navigate('/add-project');
  }
  };


  return (
    <div className={`dashboard-fullscreen ${darkMode ? 'dark' : 'light'}`}>
      <aside className={`sidebar ${darkMode ? 'dark' : 'light'}`}>
        <div className="profile-btn" onClick={goToProfile} title="Go to profile">
          <div className="profile-circle">Profile Button</div>
        </div>
        <nav className="nav-links">
          <button className="nav-btn">PROJECTS</button>
          <button className="nav-btn">PROJECTS</button>
          <button className="nav-btn">PROJECTS</button>
          <button className="nav-btn">PROJECTS</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>LOGOUT</button>
      </aside>

      <main className={`main-content ${darkMode ? 'dark' : 'light'}`}>
        <header className={`navbar ${darkMode ? 'dark' : 'light'}`}>
          <h1>Project Dashboard</h1>
          <div>
            <button className="toggle-mode" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? '🌙' : '☀️'}
            </button>
            <button className="editor-btn" onClick={() => setEditorMode(!editorMode)}>
              ✏️ Editor Mode
            </button>
          </div>
        </header>

        <div className="projects-grid">
          {editorMode && (
            <div
              className={`project-card add-project-card ${darkMode ? 'dark' : 'light'}`}
              onClick={goToAddProject}
            >
              <div className="project-thumbnail" style={{ backgroundColor: 'darkred' }}></div>
              <h3>Add Project</h3>
              <p>Click to add a new project</p>
            </div>
          )}
          {[...Array(4)].map((_, i) => (
            <div className={`project-card ${darkMode ? 'dark' : 'light'}`} key={i}>
              <div className="project-thumbnail"></div>
              <h3>Website</h3>
              <p>Description</p>
              <div className="tags">
                <span>NextJS</span>
                <span>HTML</span>
                <span>TypeScript</span>
                <span>NextJS</span>
              </div>
              <div className="badges">
                <span className="badge">🌐 Website</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
