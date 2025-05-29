import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'


const sampleProjects = [
  {
    title: 'Website',
    description: 'Description',
    tags: ['NextJS', 'HTML', 'TypeScript'],
    type: 'Website',
    thumbnailColor: 'darkred',
  },
  // Add more sample projects if needed
]

const Dashboard = () => {
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(false)
  const [editorMode, setEditorMode] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  const handleLogout = () => navigate('/')
  const goToProfile = () => navigate('/profile')
  const goToAddProject = () => {
    if (editorMode) navigate('/add-project')
  }
const [mediaUrl, setMediaUrl] = useState('');

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

          {sampleProjects.map((project, i) => (
            <div
              className={`project-card ${darkMode ? 'dark' : 'light'}`}
              key={i}
              onClick={() => setSelectedProject(project)}
            >
              <div className="project-thumbnail" style={{ backgroundColor: project.thumbnailColor }}></div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="tags">
                {project.tags.map((tag, j) => <span key={j}>{tag}</span>)}
              </div>
              <div className="badges">
                <span className="badge">🌐 {project.type}</span>
              </div>
            </div>
          ))}
        </div>


        
        {selectedProject && (
          <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelectedProject(null)}>×</button>
              <h2>{selectedProject.title}</h2>
              <p>{selectedProject.description}</p>
              <p><strong>Tags:</strong> {selectedProject.tags.join(', ')}</p>
              <p><strong>Type:</strong> {selectedProject.type}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
