import React, { useState, useEffect } from 'react'
import { useTheme } from '../../ThemeContext';
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import supabase from '../../helper/supabaseClient'
import ProjectModal from './ProjectModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [editorMode, setEditorMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    getUser();

    const checkFileList = async () => {
      const { data, error } = await supabase.storage.from('project-files').list('', {
        search: '46_1748854834988',
      });

      console.log('Supabase file list result:', data);
      if (error) console.error('Error listing files:', error);
    };

    checkFileList();
  }, []);

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

    // Build projects with cover and images
    const projectsWithMedia = await Promise.all(
      data.map(async (project) => {
        // Cover image
        const coverMedia = Array.isArray(project.Media)
          ? project.Media.find(m => m.isCover)
          : null;
        const coverImage = coverMedia?.filePATH
          ? `${SUPABASE_URL}/storage/v1/object/public/project-files/${coverMedia.filePATH}`
          : null;

        // Gallery images
        const { data: imagesData, error: imagesError } = await supabase
          .from('Media')
          .select('filePATH')
          .eq('projectID', project.projectID)
          .eq('isCover', false);

        let images = [];
        if (!imagesError && imagesData) {
          console.log('imagesData:', imagesData);
          images = imagesData.map(img => {
            const relativePath = img.filePATH.replace(/^project-files\//, '');
            const { data } = supabase.storage.from('project-files').getPublicUrl(relativePath);
            return data.publicUrl;
          });
        }

        return {
          ...project,
          coverImage,
          images,
        };
      })
    );

    setProjects(projectsWithMedia);
  };

  useEffect(() => {
    if (userId) fetchProjects(userId);
  }, [userId]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error.message);
    } else {
      navigate('/');
    }
  }
  const goToProfile = () => navigate('/profile')

  return (
    <div className={`dashboard-fullscreen ${darkMode ? 'dark' : 'light'}`}>
      <aside className={`sidebar ${darkMode ? 'dark' : 'light'}`}>
        <div className="profile-btn" onClick={goToProfile} title="Go to profile">
          <div className="profile-circle">Profile Button</div>
        </div>
        <nav className="nav-links">
          <button className="nav-btn">PROJECTS</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          LOGOUT
        </button>
      </aside>

      <main className={`main-content ${darkMode ? 'dark' : 'light'}`}>
        <header className={`navbar ${darkMode ? 'dark' : 'light'}`}>
          <h1>Project Dashboard</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="toggle-mode" onClick={toggleDarkMode} title="Toggle dark/light mode">
            <span className="toggle-icon">{darkMode ? '🌙' : '☀️'}</span>
          </button>
            <button
              className={`editor-btn${editorMode ? ' active' : ''}`}
              onClick={async (e) => {
                const btn = e.currentTarget;
                btn.style.transition = 'box-shadow 0.2s, transform 0.4s cubic-bezier(0.4,0,0.2,1)';
                btn.style.transform = 'scale(0.85) rotate(-10deg)';
                btn.style.opacity = '0.5';
                await new Promise(res => setTimeout(res, 350));
                btn.style.transform = '';
                btn.style.opacity = '';
                navigate('/add-project');
              }}
              title="Add Project"
              style={{
                background: '#111',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: editorMode ? '0 0 0 2px #1976d2' : 'none',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s cubic-bezier(0.4,0,0.2,1)',
                padding: 0
              }}
            >
              <span style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', lineHeight: 1 }}>+</span>
            </button>
          </div>
        </header>


        <div className="projects-grid">

          {projects.map((project, i) => (
            <div
              className={`project-card ${darkMode ? 'dark' : 'light'}${selectedProject && selectedProject.projectID === project.projectID ? ' selected' : ''}`}
              key={project.projectID || i}
              onClick={() => setSelectedProject(project)}
              data-status={project.status}
            >
              {project.coverImage ? (
                <img
                  src={project.coverImage}
                  onError={() => console.warn('Image failed to load:', project.coverImage)}
                  alt={project.title}
                  className="project-thumbnail"
                  style={{
                    width: '100%',
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                />
              ) : (
                <div
                  className="project-thumbnail"
                  style={{
                    backgroundColor: project.thumbnailColor || '#ccc',
                    height: 120,
                    borderRadius: 8,
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 32
                  }}
                >
                  <span role="img" aria-label="project">📁</span>
                </div>
              )}

              <span className={`project-status-badge`}>{project.status}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="tags">
                {(Array.isArray(project.tags)
                  ? project.tags
                  : typeof project.tags === 'string'
                    ? project.tags.split(',').map((tag) => tag.trim())
                    : []
                ).map((tag, j) => (
                  <span key={j}>{tag}</span>
                ))}
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
  );
};


export default Dashboard

