import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import supabase from '../../helper/supabaseClient'
import ProjectModal from './ProjectModal';


const Dashboard = () => {
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setUserId(data.user.id)
    }
    getUser()

    const checkFileList = async () => {
    const { data, error } = await supabase
      .storage
      .from('project-files')
      .list('', {
        search: '46_1748854834988',
      });

    console.log('Supabase file list result:', data);
    if (error) console.error('Error listing files:', error);
  };

  checkFileList();
  
  }, [])

  const fetchProjects = async (uid) => {
    if (!uid) return;

    const { data, error } = await supabase
      .from('Project')
      .select(`
        *,
        Media (
          fileID,
          filePATH,
          isCover
        )
      `)
      .eq('userID', uid);

    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }

    const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;

    const projectsWithCover = data.map(project => {
      const coverMedia = Array.isArray(project.Media)
        ? project.Media.find(m => m.isCover)
        : null;

      const coverImage = coverMedia?.filePATH
        ? `${SUPABASE_URL}/storage/v1/object/public/${coverMedia.filePATH}`
        : null;

      console.log('Generated coverImage URL:', coverImage);
      console.log('coverMedia.filePATH:', coverMedia?.filePATH);
      return {
        ...project,
        coverImage,
      };
    });

    setProjects(projectsWithCover);
  };


  useEffect(() => {
    if (userId) fetchProjects(userId)
  }, [userId])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout failed:', error.message)
    } else {
      navigate('/') 
    }
  }
  const goToProfile = () => navigate('/profile')
  const goToAddProject = () => navigate('/add-project')

  return (
    <div className={`dashboard-fullscreen ${darkMode ? 'dark' : 'light'}`}>
      <aside className={`sidebar ${darkMode ? 'dark' : 'light'}`}>
        <div className="profile-btn" onClick={goToProfile} title="Go to profile">
          <div className="profile-circle">Profile Button</div>
        </div>
        <nav className="nav-links">
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
            <button className="editor-btn" onClick={goToAddProject}>
               Add Project
            </button>
          </div>
        </header>

        <div className="projects-grid">
          {projects.map((project, i) => (
            <div
              className={`project-card ${darkMode ? 'dark' : 'light'}`}
              key={project.id || i}
              onClick={() => setSelectedProject(project)}
            >
              {project.coverImage ? (
                <img
                  src={project.coverImage}
                  onError={() => console.warn('Image failed to load:', project.coverImage)}
                  alt={project.title}
                  className="project-thumbnail"
                  style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                />
              ) : (
                <div
                  className="project-thumbnail"
                  style={{
                    backgroundColor: project.thumbnailColor || '#ccc',
                    height: 120,
                    borderRadius: 8,
                    marginBottom: 8
                  }}
                />
              )}

              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="tags">
                {(Array.isArray(project.tags)
                  ? project.tags
                  : typeof project.tags === 'string'
                    ? project.tags.split(',').map(tag => tag.trim())
                    : []
                ).map((tag, j) => <span key={j}>{tag}</span>)}
              </div>
              <div className="badges">
                <span className="badge">🌐 {project.type}</span>
              </div>
            </div>
          ))}
        </div>

        <ProjectModal
          project={selectedProject}
          darkMode={darkMode}
          onClose={() => setSelectedProject(null)}
          onDelete={() => fetchProjects(userId)}
          onProjectUpdate={() => fetchProjects(userId)}
        />

      </main>
    </div>
  )
}

export default Dashboard