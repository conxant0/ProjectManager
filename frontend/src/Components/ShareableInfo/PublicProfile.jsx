import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchPublicProfile } from '../../helper/fetchPublicProfile'
import './PublicProfile.css'

const PublicProfile = () => {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { profile, projects, error } = await fetchPublicProfile(username)
      console.log("Loaded profile:", profile)

      if (error) {
        setError(error.message || 'Something went wrong')
        return
      }

      // Handle missing profile
      if (!profile) {
        setError('User not found.')
        return
      }

      setProfile(profile)
      setProjects(projects || [])
    }

    loadProfile()
  }, [username])

  if (error) return <p>Error: {error}</p>
  if (!profile) return <p>Loading profile...</p>

  return (
    <div className="public-profile">
      <section className="profile-info">
        <h1>{profile.name || 'Unnamed User'}</h1>
        <p className="username">@{profile.username || 'unknown'}</p>

        {profile.bio ? (
          <p className="bio">{profile.bio}</p>
        ) : (
          <p className="bio muted">No bio provided.</p>
        )}

        <p>
          <strong>Skills:</strong>{' '}
          {profile.skills && profile.skills.trim() !== ''
            ? profile.skills
            : 'Not specified'}
        </p>
      </section>

      <section className="public-projects">
        <h2>Projects</h2>

        {projects.length === 0 ? (
          <p>This user hasn't shared any public projects yet.</p>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => {
              const tags = typeof project.tags === 'string'
                ? project.tags.split(',').map(tag => tag.trim())
                : Array.isArray(project.tags)
                  ? project.tags
                  : []

              return (
                <div className="project-card" key={project.projectID}>
                  <div className="status-container">
                    <span className="badge status-badge">{project.status}</span>
                  </div>

                  <h3>{project.title}</h3>
                  <p>{project.description}</p>

                  {tags.length > 0 && (
                    <div className="tags">
                      {tags.map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  {project.type && (
                    <div className="badges">
                      <span className="badge">🌐 {project.type}</span>
                    </div>
                  )}
                </div>
              )
            })}

          </div>
        )}
      </section>
    </div>
  )
}

export default PublicProfile
