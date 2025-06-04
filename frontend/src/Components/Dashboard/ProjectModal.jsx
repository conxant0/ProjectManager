import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import supabase from '../../helper/supabaseClient';
import './ProjectModal.css';

const CATEGORIES = ['Design', 'Development'];
const STATUSES = ['Completed', 'Ongoing', 'Idea'];
const VISIBILITIES = ['Public', 'Private', 'Archived'];

const ProjectModal = ({ project, darkMode, onClose, onDelete, onProjectUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize form with project data when component mounts or project changes
  useEffect(() => {
    if (project) {
      const initialForm = {
        title: project.title || '',
        description: project.description || '',
        category: project.category || 'Design',
        status: project.status || 'Idea',
        tags: Array.isArray(project.tags) 
          ? project.tags.join(', ') 
          : typeof project.tags === 'string' 
            ? project.tags 
            : '',
        visibility: project.visibility || 'Public',
        tools: project.tools || '',
        role: project.role || '',
        timeline: project.timeline || '',
        githubURL: project.githubURL || '',
        figmaURL: project.figmaURL || '',
        notionURL: project.notionURL || '',
        coverImage: project.coverImage || ''
      };
      
      setForm(initialForm);
    }
  }, [project]);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${project.title}"?`);
    if (!confirmDelete) return;

    if (!project.projectID) {
      console.error('No projectID found for deletion.');
      return;
    }

    try {
      const { error } = await supabase
        .from('Project')
        .delete()
        .eq('projectID', project.projectID);

      if (error) {
        console.error('Failed to delete project:', error.message);
      } else {
        onClose(); // Close the modal
        if (typeof onDelete === 'function') {
          onDelete(); // Trigger dashboard refresh
        }
      }
    } catch (err) {
      console.error('Unexpected error during delete:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCoverFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, coverImage: previewUrl }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const projectId = project.projectID || project.id;
      
      if (!projectId) {
        console.error('No valid project ID found');
        alert('Error: Could not find project ID');
        return;
      }

      // Clean and validate the data before sending
      const updates = {
        title: form.title?.trim() || '',
        description: form.description?.trim() || '',
        category: form.category || 'Design',
        status: form.status || 'Idea',
        visibility: form.visibility || 'Public',
        tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag).join(',') : '',
        tools: form.tools?.trim() || '',
        role: form.role?.trim() || '',
        timeline: form.timeline?.trim() || '',
        githubURL: form.githubURL?.trim() || '',
        figmaURL: form.figmaURL?.trim() || '',
        notionURL: form.notionURL?.trim() || ''
      };

      const { data, error } = await supabase
        .from('Project')
        .update(updates)
        .eq('projectID', projectId)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        alert(`Failed to update project: ${error.message}`);
        return;
      }

      // Upload cover image if a new file is selected
      if (newCoverFile) {
        try {
          const fileExt = newCoverFile.name.split('.').pop();
          const filePath = `project-files/${projectId}_${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('project-files')
            .upload(filePath, newCoverFile, { upsert: true });

          if (uploadError) {
            console.error('Failed to upload cover image:', uploadError);
            alert(`Failed to upload cover image: ${uploadError.message}`);
          } else {
            // Update media record
            const { error: mediaError } = await supabase
              .from('Media')
              .update({ filePATH: filePath })
              .eq('projectID', projectId)
              .eq('isCover', true);
              
            if (mediaError) {
              console.error('Failed to update media record:', mediaError);
            }
          }
        } catch (imageError) {
          console.error('Error handling cover image:', imageError);
        }
      }

      if (onProjectUpdate) onProjectUpdate(); // refresh dashboard
      setIsEditing(false); // exit edit mode
    } catch (error) {
      console.error('Unexpected error saving project:', error);
      alert(`Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original project data
    setForm({
      title: project.title || '',
      description: project.description || '',
      category: project.category || 'Design',
      status: project.status || 'Idea',
      tags: Array.isArray(project.tags) 
        ? project.tags.join(', ') 
        : typeof project.tags === 'string' 
          ? project.tags 
          : '',
      visibility: project.visibility || 'Public',
      tools: project.tools || '',
      role: project.role || '',
      timeline: project.timeline || '',
      githubURL: project.githubURL || '',
      figmaURL: project.figmaURL || '',
      notionURL: project.notionURL || '',
      coverImage: project.coverImage || ''
    });
    setNewCoverFile(null);
    setIsEditing(false);
  };

  if (!project) return null;

  const tags = form.tags 
    ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal ${darkMode ? 'dark' : 'light'}`} onClick={e => e.stopPropagation()}>
        {/* Cover Image */}
        {form.coverImage && (
          <img
            src={form.coverImage}
            alt={form.title}
            className="project-cover-image"
          />
        )}

        {/* Cover Image Upload (Edit Mode) */}
        {isEditing && (
          <div style={{ margin: '12px 0' }}>
            <label><strong>Cover Image:</strong></label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleCoverChange}
              style={{ 
                width: '100%', 
                padding: '4px', 
                marginTop: '4px',
                backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
        )}

        {/* Header Buttons */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
          <button 
            className={`edit-btn ${isEditing ? 'editing' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
            disabled={loading}
            title={isEditing ? "Cancel Edit" : "Edit Project"}
          >
            {isEditing ? <FaTimes /> : <FaEdit />}
          </button>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>


        {/* Title */}
        {isEditing ? (
          <div style={{ margin: '12px 0' }}>
            <label><strong>Title:</strong></label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange}
              placeholder="Project title"
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '4px',
                backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
        ) : (
          <h2>{form.title}</h2>
        )}

        {/* Description */}
        {isEditing ? (
          <div style={{ margin: '12px 0' }}>
            <label><strong>Description:</strong></label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange}
              placeholder="Project description"
              rows="3"
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '4px',
                backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
          </div>
        ) : (
          <p><strong></strong> {form.description}</p>
        )}

        {/* Category */}
        <p>
          <strong>Category:</strong> {isEditing ? (
            <select 
              name="category" 
              value={form.category} 
              onChange={handleChange}
              style={{
                marginLeft: '8px',
                padding: '4px',
                backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              {CATEGORIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (form.category || '-')}
        </p>

        {/* Status */}
        <p>
          <strong>Status:</strong> {isEditing ? (
            <select 
              name="status" 
              value={form.status} 
              onChange={handleChange}
              style={{
                marginLeft: '8px',
                padding: '4px',
                backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              {STATUSES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (form.status || '-')}
        </p>

        {/* Tags */}
        <p>
          <strong>Tags:</strong> {isEditing ? (
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="comma-separated tags"
              style={{
                marginLeft: '8px',
                padding: '4px',
                width: '60%',
                backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          ) : (tags.length > 0 ? tags.join(', ') : '-')}
        </p>

        {/* Visibility */}
        <p>
          <strong>Visibility:</strong> {isEditing ? (
            <select 
              name="visibility" 
              value={form.visibility} 
              onChange={handleChange}
              style={{
                marginLeft: '8px',
                padding: '4px',
                backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              {VISIBILITIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (form.visibility || '-')}
        </p>

        {/* Project Highlights */}
        <div style={{ margin: '12px 0' }}>
          <h3>Project Highlights</h3>
          
          <p>
            <strong>Tools Used:</strong> {isEditing ? (
              <input 
                name="tools" 
                value={form.tools} 
                onChange={handleChange}
                placeholder="Tools and technologies used"
                style={{
                  marginLeft: '8px',
                  padding: '4px',
                  width: '60%',
                  backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#000000',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            ) : (form.tools || '-')}
          </p>
          
          <p>
            <strong>Your Role:</strong> {isEditing ? (
              <input 
                name="role" 
                value={form.role} 
                onChange={handleChange}
                placeholder="Your role in this project"
                style={{
                  marginLeft: '8px',
                  padding: '4px',
                  width: '60%',
                  backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#000000',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            ) : (form.role || '-')}
          </p>
          
          <p>
            <strong>Timeline:</strong> {isEditing ? (
              <input 
                name="timeline" 
                value={form.timeline} 
                onChange={handleChange}
                placeholder="Project timeline"
                style={{
                  marginLeft: '8px',
                  padding: '4px',
                  width: '60%',
                  backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#000000',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            ) : (form.timeline || '-')}
          </p>
        </div>

        {/* Project Links */}
        <div style={{ margin: '12px 0' }}>
          <h3>Project Links</h3>
          
          <p>
            <strong>GitHub:</strong> {isEditing ? (
              <input 
                name="githubURL" 
                value={form.githubURL} 
                onChange={handleChange}
                placeholder="GitHub URL"
                style={{
                  marginLeft: '8px',
                  padding: '4px',
                  width: '60%',
                  backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#000000',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            ) : (form.githubURL ? (
              <a href={form.githubURL} target="_blank" rel="noopener noreferrer">{form.githubURL}</a>
            ) : ' -')}
          </p>
          
          <p>
            <strong>Figma:</strong> {isEditing ? (
              <input 
                name="figmaURL" 
                value={form.figmaURL} 
                onChange={handleChange}
                placeholder="Figma URL"
                style={{
                  marginLeft: '8px',
                  padding: '4px',
                  width: '60%',
                  backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#000000',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            ) : (form.figmaURL ? (
              <a href={form.figmaURL} target="_blank" rel="noopener noreferrer">{form.figmaURL}</a>
            ) : ' -')}
          </p>
          
          <p>
            <strong>Notion:</strong> {isEditing ? (
              <input 
                name="notionURL" 
                value={form.notionURL} 
                onChange={handleChange}
                placeholder="Notion URL"
                style={{
                  marginLeft: '8px',
                  padding: '4px',
                  width: '60%',
                  backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#000000',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            ) : (form.notionURL ? (
              <a href={form.notionURL} target="_blank" rel="noopener noreferrer">{form.notionURL}</a>
            ) : ' -')}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="save-btn"
                onClick={handleSave} 
                disabled={loading}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaSave /> {loading ? 'Saving...' : 'Save'}
              </button>
              <button 
                className="cancel-btn"
                onClick={handleCancel}
                disabled={loading}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div></div>
          )}
          
          <button
            className="delete-btn"
            onClick={handleDelete}
            style={{ marginLeft: '8px' }} // Add left gap here
          >
            <FaTrash style={{ marginRight: '6px' }} />
            Delete
          </button>

        </div>
      </div>
    </div>
  );
};

export default ProjectModal;