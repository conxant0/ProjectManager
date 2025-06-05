import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchPublicProfile } from '../../helper/fetchPublicProfile'
import './PublicProfile.css'
import '../Dashboard/Dashboard.css'

const PublicProfile = () => {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { profile, projects, error } = await fetchPublicProfile(username)
      if (error) return setError(error.message || 'Something went wrong')
      if (!profile) return setError('User not found.')
      setProfile(profile)
      setProjects(projects || [])
    }

    loadProfile()
  }, [username])

  const parseTags = (tags) => {
    if (Array.isArray(tags)) return tags
    if (typeof tags === 'string') return tags.split(',').map(tag => tag.trim())
    return []
  }

  if (error) return <p className="error-message">Error: {error}</p>
  if (!profile) return <p className="loading-message">Loading profile...</p>

  return (
    <div className="dashboard-container">
      <div className="dashboard-content public-profile">

        <section className="profile-info">
          <h1>{profile.name || 'Unnamed User'}</h1>
          <p className="username">@{profile.username || 'unknown'}</p>
          <p className={`bio ${profile.bio ? '' : 'muted'}`}>
            {profile.bio || 'No bio provided.'}
          </p>
          <p>
            <strong>Skills:</strong>{' '}
            {profile.skills?.trim() ? profile.skills : 'Not specified'}
          </p>

          {(profile.githubURL || profile.linkedinURL) && (
            <div className="social-links">
              {profile.githubURL && (
                <a
                  href={profile.githubURL.startsWith('http') ? profile.githubURL : `https://${profile.githubURL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              )}
              {profile.linkedinURL && (
                <a
                  href={profile.linkedinURL.startsWith('http') ? profile.linkedinURL : `https://${profile.linkedinURL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              )}
              {profile.discord && (
                <span className="discord-handle">{profile.discord}</span>
              )}
            </div>
          )}
        </section>

        <section className="public-projects">
          <h2>Projects</h2>
          {projects.length === 0 ? (
            <p>This user hasn't shared any public projects yet.</p>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div
                  key={project.projectID}
                  className="project-card"
                  data-status={project.status}
                >
                  {project.coverURL && (
                    <div className="project-cover">
                      <img
                        src={project.coverURL}
                        alt={`${project.title} cover`}
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="project-content">
                    <div className="status-container">
                      <span className="status-badge">{project.status}</span>
                    </div>

                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description line-clamp-3">
                      {project.description}
                    </p>

                    {parseTags(project.tags).length > 0 && (
                      <div className="tags">
                        {parseTags(project.tags).map((tag, i) => (
                          <span key={i} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {(project.githubURL || project.figmaURL || project.notionURL) && (
                      <div className="project-links">
                        {project.githubURL && (
                          <a href={project.githubURL} target="_blank" rel="noopener noreferrer">
                            GitHub
                          </a>
                        )}
                        {project.figmaURL && (
                          <a href={project.figmaURL} target="_blank" rel="noopener noreferrer">
                            Figma
                          </a>
                        )}
                        {project.notionURL && (
                          <a href={project.notionURL} target="_blank" rel="noopener noreferrer">
                            Notion
                          </a>
                        )}
                      </div>
                    )}

                    {project.mediaURLs?.length > 0 && (
                      <div className="project-gallery">
                        {project.mediaURLs.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Media ${idx + 1}`}
                            className="gallery-image"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}

                    {project.uploadedFiles?.length > 0 && (
                      <div className="project-files">
                        <h4>Files</h4>
                        {project.uploadedFiles.map((file, idx) => (
                          <a
                            key={idx}
                            href={file.url}
                            className="project-file"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {file.name || `File ${idx + 1}`}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default PublicProfile

