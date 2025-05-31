import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../../helper/supabaseClient'
import './ProjectForm.css'

const ProjectForm = ({ onCancel, onSave }) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    status: '',
    tags: '',
    visibility: 'Public',
    description: '',
    file: null,
    tools: '',
    role: '',
    timeline: ''
  })

  // Get current user on component mount
  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      if (user) {
        setCurrentUser(user)
      } else {
        setError('No authenticated user found. Please log in.')
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      setError('Failed to get user information: ' + error.message)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value
    })
    // Clear any previous errors when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!currentUser) {
      setError('You must be logged in to create a project')
      return
    }

    if (!formData.title.trim()) {
      setError('Project title is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('Project')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          status: formData.status,
          category: formData.category,
          tags: formData.tags.trim(),
          visibility: formData.visibility,
          tools: formData.tools.trim(),
          role: formData.role.trim(),
          timeline: formData.timeline.trim(),
          userID: currentUser.id
        })
        .select()

      if (projectError) throw projectError

      const project = projectData[0]
      let imageUrl = null

      if (formData.file) {
        try {
          const fileExt = formData.file.name.split('.').pop()
          const fileName = `${project.id || project.projectID}_${Date.now()}.${fileExt}`
          const filePath = `project-files/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('project-files')
            .upload(filePath, formData.file)

          if (uploadError) throw uploadError

          const { data: publicUrlData } = supabase
            .storage
            .from('project-files')
            .getPublicUrl(filePath)
          imageUrl = publicUrlData.publicUrl

          await supabase
            .from('Project')
            .update({ imageUrl })
            .eq('id', project.id || project.projectID)

          await supabase
            .from('Media')
            .insert({
              filePATH: filePath, 
              projectID: project.id || project.projectID, 
              uploadedBy: currentUser.id 
            })
        } catch (fileError) {
          console.error('File upload failed:', fileError)
          setError(`Project created successfully, but file upload failed: ${fileError.message}`)
          setTimeout(() => {
            navigate('/dashboard')
          }, 3000)
          return
        }
      }

      if (onSave) {
        onSave(project)
      }

      navigate('/dashboard')

    } catch (error) {
      console.error('Error creating project:', error)
      setError(`Failed to create project: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate('/dashboard')
    }
  }

  if (!currentUser && !error) {
    return <div className="loading">Loading user information...</div>
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <h2>New Project</h2>

      {error && (
        <div className="error-message" style={{ 
          color: 'red', 
          padding: '10px', 
          marginBottom: '15px', 
          border: '1px solid red', 
          borderRadius: '4px',
          backgroundColor: '#ffe6e6'
        }}>
          {error}
        </div>
      )}

      <label>Project Title *</label>
      <input 
        name="title" 
        value={formData.title} 
        onChange={handleChange} 
        required 
        disabled={isLoading}
      />

      <div className="row">
        <div>
          <label>Category</label>
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">Select</option>
            <option value="Design">Design</option>
            <option value="Development">Development</option>
          </select>
        </div>
        <div>
          <label>Status</label>
          <select 
            name="status" 
            value={formData.status} 
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">Select</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <label>Tags</label>
      <input 
        name="tags" 
        value={formData.tags} 
        onChange={handleChange} 
        placeholder="e.g., React, UI/UX, Mobile"
        disabled={isLoading}
      />

      <label>Visibility</label>
      <div className="visibility-options">
        {['Public', 'Private', 'Archived'].map((v) => (
          <button
            key={v}
            type="button"
            className={formData.visibility === v ? 'selected' : ''}
            onClick={() => setFormData({ ...formData, visibility: v })}
            disabled={isLoading}
          >
            {v}
          </button>
        ))}
      </div>

      <label>Description</label>
      <textarea 
        name="description" 
        value={formData.description} 
        onChange={handleChange}
        placeholder="Describe your project..."
        disabled={isLoading}
      />

      <label htmlFor="file-upload" className="file-upload-label">
        {formData.file ? `Selected: ${formData.file.name}` : '+ Upload File (JPG, PNG, PDF)'}
      </label>
      <input
        id="file-upload"
        type="file"
        name="file"
        onChange={handleChange}
        accept=".jpg,.jpeg,.png,.pdf"
        style={{ display: 'none' }}
        disabled={isLoading}
      />

      <h3>Project Highlights</h3>
      <input 
        placeholder="Tools Used (e.g., Figma, React, Node.js)" 
        name="tools" 
        value={formData.tools} 
        onChange={handleChange}
        disabled={isLoading}
      />
      <input 
        placeholder="Your Role (e.g., Lead Developer, UI Designer)" 
        name="role" 
        value={formData.role} 
        onChange={handleChange}
        disabled={isLoading}
      />
      <input 
        placeholder="Timeline (e.g., 2 months, Jan-Mar 2024)" 
        name="timeline" 
        value={formData.timeline} 
        onChange={handleChange}
        disabled={isLoading}
      />

      <div className="form-buttons">
        <button 
          type="button" 
          onClick={handleCancel} 
          className="cancel-btn"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="save-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Project'}
        </button>
      </div>
    </form>
  )
}

export default ProjectForm