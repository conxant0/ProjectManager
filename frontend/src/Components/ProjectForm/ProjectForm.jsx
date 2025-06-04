import React, { useState, useEffect } from 'react'
import { useTheme } from '../../ThemeContext';
import { useNavigate } from 'react-router-dom'
import supabase from '../../helper/supabaseClient'
import './ProjectForm.css'

const ProjectForm = ({ onCancel, onSave, initialData = null }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category: initialData?.category || '',
    status: initialData?.status || '',
    tags: initialData?.tags || '',
    visibility: initialData?.visibility || 'Public',
    description: initialData?.description || '',
    coverFile: null, // User uploads new one if needed
    file: [],        // New files to upload
    tools: initialData?.tools || '',
    role: initialData?.role || '',
    timeline: initialData?.timeline || '',
    githubURL: initialData?.githubURL || '',
    figmaURL: initialData?.figmaURL || '',
    notionURL: initialData?.notionURL || ''
  })  

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

  // URL validation helper function
  const isValidURL = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === 'file') {
      const newFiles = Array.from(files)

      setFormData((prev) => ({
        ...prev,
        [name]: [...prev[name], ...newFiles] // append new files to existing
      }))
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }

    // Clear any previous errors when user starts typing
    if (error) setError('')
  }


  const removeFile = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      file: prev.file.filter((_, index) => index !== indexToRemove)
    }))
  }

  const uploadFile = async (file, projectId, isCover = false) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}_${Date.now()}.${fileExt}`;  // just filename

      // Upload path relative to the bucket (NO bucket prefix here)
      const uploadPath = fileName;  

      // Upload file to the 'project-files' bucket at path `uploadPath`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(uploadPath, file);

      if (uploadError) throw uploadError;

      if (isCover) {
        const { error: deleteError } = await supabase
          .from('Media')
          .delete()
          .eq('projectID', projectId)
          .eq('isCover', true);

        if (deleteError) throw deleteError;
      }

      // Compose filePATH to store in DB including bucket prefix 'project-files/'
      const filePATH = `project-files/${uploadPath}`;

      const { data: mediaData, error: mediaError } = await supabase
        .from('Media')
        .insert({
          fileName: file.name,
          fileType: file.type,
          projectID: projectId,
          filePATH,    // store with bucket prefix
          isCover: isCover
        })
        .select();

      if (mediaError) throw mediaError;

      return mediaData[0];
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
  
    try {
      // Validation
      if (
        !formData.title.trim() ||
        !formData.category ||
        !formData.status ||
        !formData.visibility ||
        !formData.description.trim()
      ) {
        throw new Error('Please fill in all required fields')
      }
  
      // URL validation
      const urlFields = ['githubURL', 'figmaURL', 'notionURL']
      for (const field of urlFields) {
        const url = formData[field].trim()
        if (url && !/^https?:\/\/\S+$/.test(url)) {
          throw new Error(`Invalid URL in ${field}`)
        }
      }
  
      // 🔑 Step 1: Declare projectId
      let projectId
  
      // ✍️ Step 2: Update if editing, else insert
      if (initialData) {
        // Edit mode
        projectId = initialData.projectID
  
        const { error: updateError } = await supabase
          .from('Project')
          .update({
            title: formData.title.trim(),
            category: formData.category,
            status: formData.status,
            tags: formData.tags.trim(),
            visibility: formData.visibility,
            description: formData.description.trim(),
            tools: formData.tools.trim(),
            role: formData.role.trim(),
            timeline: formData.timeline.trim(),
            githubURL: formData.githubURL.trim(),
            figmaURL: formData.figmaURL.trim(),
            notionURL: formData.notionURL.trim()
          })
          .eq('projectID', projectId)
  
        if (updateError) throw updateError
  
      } else {
        // Create mode
        const { data, error: insertError } = await supabase
          .from('Project')
          .insert({
            title: formData.title.trim(),
            category: formData.category,
            status: formData.status,
            tags: formData.tags.trim(),
            visibility: formData.visibility,
            description: formData.description.trim(),
            tools: formData.tools.trim(),
            role: formData.role.trim(),
            timeline: formData.timeline.trim(),
            githubURL: formData.githubURL.trim(),
            figmaURL: formData.figmaURL.trim(),
            notionURL: formData.notionURL.trim(),
            userID: currentUser.id 
          })
          .select()
  
        if (insertError) throw insertError
  
        // ⚠️ Get the newly created ID
        projectId = data[0].projectID
      }
  
      // 🖼 Step 3: Handle media uploads (same as before)
      if (formData.coverFile) {
        await uploadFile(formData.coverFile, projectId, true)
      }
  
      if (formData.file.length > 0) {
        for (const file of formData.file) {
          await uploadFile(file, projectId, false)
        }
      }
  
      onSave()
      setFormData({
        title: '',
        category: '',
        status: '',
        tags: '',
        visibility: 'Public',
        description: '',
        coverFile: null,
        file: [],
        tools: '',
        role: '',
        timeline: '',
        githubURL: '',
        figmaURL: '',
        notionURL: ''
      })
    } catch (err) {
      console.error('Submission error:', err)
      setError(err.message)
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
    <div className={`project-form-bg-blur${darkMode ? ' dark' : ' light'}`}> 
      <form className={`project-form${darkMode ? ' dark' : ''}`} onSubmit={handleSubmit}>
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
              <option value="Idea">Idea</option>
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

        <input
          id="cover-upload"
          type="file"
          accept=".jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              coverFile: e.target.files[0],
            }))
          }
        />

        <label htmlFor="cover-upload" className="file-upload-label">
          {formData.coverFile
            ? `Selected: ${formData.coverFile.name}`
            : '+ Upload Cover Photo (JPG, PNG)'}
        </label>

        {/* Trigger to open file picker */}
        <label htmlFor="file-upload" className="file-upload-label cursor-pointer">
          + Upload File (JPG, PNG, PDF)
        </label>

        {/* Hidden file input */}
        <input
          id="file-upload"
          type="file"
          name="file"
          multiple
          onChange={handleChange}
          accept=".jpg,.jpeg,.png,.pdf"
          style={{ display: 'none' }}
          disabled={isLoading}
        />

        {/* List of selected files */}
        {formData.file.length > 0 && (
          <ul className="mt-2">
            {formData.file.map((f, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span>{f.name}</span>
                <button
                  type="button"
                  className="text-red-500 hover:underline"
                  onClick={() => removeFile(idx)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}


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

        <h3>Project Links</h3>
        <input 
          placeholder="GitHub Repository URL (optional)" 
          name="githubURL" 
          value={formData.githubURL} 
          onChange={handleChange}
          disabled={isLoading}
          type="url"
        />
        <input 
          placeholder="Figma Design URL (optional)" 
          name="figmaURL" 
          value={formData.figmaURL} 
          onChange={handleChange}
          disabled={isLoading}
          type="url"
        />
        <input 
          placeholder="Notion Documentation URL (optional)" 
          name="notionURL" 
          value={formData.notionURL} 
          onChange={handleChange}
          disabled={isLoading}
          type="url"
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
    </div>
  )
}

export default ProjectForm