import React, { useState } from 'react'
import './ProjectForm.css'

const ProjectForm = ({ onCancel, onSave }) => {
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

  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <h2>New Project</h2>

      <label>Project Title</label>
      <input name="title" value={formData.title} onChange={handleChange} required />

      <div className="row">
        <div>
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Design">Design</option>
            <option value="Development">Development</option>
          </select>
        </div>
        <div>
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <label>Tags</label>
      <input name="tags" value={formData.tags} onChange={handleChange} />

      <label>Visibility</label>
      <div className="visibility-options">
        {['Public', 'Private', 'Archived'].map((v) => (
          <button
            key={v}
            type="button"
            className={formData.visibility === v ? 'selected' : ''}
            onClick={() => setFormData({ ...formData, visibility: v })}
          >
            {v}
          </button>
        ))}
      </div>

      <label>Description</label>
      <textarea name="description" value={formData.description} onChange={handleChange} />

      <label htmlFor="file-upload" className="file-upload-label">
        + Upload File
      </label>
      <input
        id="file-upload"
        type="file"
        name="file"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      <h3>Project Highlights</h3>
      <input placeholder="Tools Used" name="tools" value={formData.tools} onChange={handleChange} />
      <input placeholder="Your Role" name="role" value={formData.role} onChange={handleChange} />
      <input placeholder="Timeline" name="timeline" value={formData.timeline} onChange={handleChange} />

      <div className="form-buttons">
        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
        <button type="submit" className="save-btn">Save Project</button>
      </div>
    </form>
  )
}

export default ProjectForm
