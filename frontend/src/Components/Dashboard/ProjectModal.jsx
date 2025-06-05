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
  const [newGalleryFiles, setNewGalleryFiles] = useState([]); // files to add
  const [imagesToRemove, setImagesToRemove] = useState([]);   // URLs to remove

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
        coverImage: project.coverImage || '',
        images: project.images || []
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
        onClose(); 
        if (typeof onDelete === 'function') {
          onDelete(); 
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
      // Update project fields
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
      const { error } = await supabase
        .from('Project')
        .update(updates)
        .eq('projectID', projectId);
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
      // Remove gallery images
      for (const url of imagesToRemove) {
        // Find the file name from the URL
        const match = url.match(/project-files\/([^?]+)/);
        const fileName = match ? match[1] : null;
        if (fileName) {
          // Remove from storage
          await supabase.storage.from('project-files').remove([fileName]);
          // Remove from Media table
          await supabase.from('Media')
            .delete()
            .eq('projectID', projectId)
            .eq('filePATH', `${fileName}`)
            .eq('isCover', false);
        }
      }
      // Upload new gallery images
      for (const file of newGalleryFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}_${Date.now()}_${Math.floor(Math.random()*10000)}.${fileExt}`;
        const uploadPath = fileName;
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(uploadPath, file);
        if (!uploadError) {
          await supabase.from('Media').insert({
            fileName: file.name,
            fileType: file.type,
            projectID: projectId,
            filePATH: `${uploadPath}`,
            isCover: false
          });
        }
      }
      if (onProjectUpdate) onProjectUpdate();
      setIsEditing(false);
      setNewGalleryFiles([]);
      setImagesToRemove([]);
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
      coverImage: project.coverImage || '',
      images: project.images || []
    });
    setNewCoverFile(null);
    setIsEditing(false);
  };

  if (!project) return null;

  const tags = form.tags 
    ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];

  console.log("Gallery images for this project:", form.images);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal ${darkMode ? 'dark' : 'light'}`} onClick={e => e.stopPropagation()}>
        {/* Cover Image */}
        {form.coverImage && (
          <img
            src={form.coverImage}
            alt={form.title}
            className="project-cover-image"
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}

        {/* Cover Image Upload (Edit Mode) */}
        {isEditing && (
          <div className="cover-image-upload-section">
            <label><strong>Cover Image:</strong></label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleCoverChange}
              className={`cover-image-upload-input${darkMode ? ' dark' : ''}`}
            />
          </div>
        )}

        {/* Header Buttons */}
        <div className="modal-header-buttons">
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
          <div className="modal-title-edit-section">
            <label><strong>Title:</strong></label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange}
              placeholder="Project title"
              className={`modal-title-input${darkMode ? ' dark' : ''}`}
            />
          </div>
        ) : (
          <div className="modal-project-title">{form.title}</div>
        )}

        {/* Description */}
        {isEditing ? (
          <div className="modal-description-edit-section">
            <label><strong>Description:</strong></label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange}
              placeholder="Project description"
              rows="3"
              className={`modal-description-input${darkMode ? ' dark' : ''}`}
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
              className={`modal-select${darkMode ? ' dark' : ''}`}
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
              className={`modal-select${darkMode ? ' dark' : ''}`}
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
              className={`modal-input-short${darkMode ? ' dark' : ''}`}
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
              className={`modal-select${darkMode ? ' dark' : ''}`}
            >
              {VISIBILITIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (form.visibility || '-')}
        </p>

        {/* Project Highlights */}
        <div className="project-highlights-section">
          <h3>Project Highlights</h3>
          
          <p>
            <strong>Tools Used:</strong> {isEditing ? (
            <input 
              name="tools" 
              value={form.tools} 
              onChange={handleChange}
              placeholder="Tools and technologies used"
              className={`project-highlights-input${darkMode ? ' dark' : ''}`}
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
              className={`project-highlights-input${darkMode ? ' dark' : ''}`}
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
              className={`project-highlights-input${darkMode ? ' dark' : ''}`}
            />
            ) : (form.timeline || '-')}
          </p>
        </div>

        {/* Project Links */}
        <div className="project-links-section">
          <h3>Project Links</h3>
          
          <p>
            <strong>GitHub:</strong> {isEditing ? (
            <input 
              name="githubURL" 
              value={form.githubURL} 
              onChange={handleChange}
              placeholder="GitHub URL"
              className={`project-links-input${darkMode ? ' dark' : ''}`}
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
              className={`project-links-input${darkMode ? ' dark' : ''}`}
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
              className={`project-links-input${darkMode ? ' dark' : ''}`}
            />
            ) : (form.notionURL ? (
              <a href={form.notionURL} target="_blank" rel="noopener noreferrer">{form.notionURL}</a>
            ) : ' -')}
          </p>
        </div>

        {/* Project Images Showcase */}
        <div className="project-gallery-section">
          <h3 className="project-gallery-title">Project Gallery</h3>
          <div className="project-gallery-images">
            {isEditing ? (
              <>
                {/* Existing images with remove button, always render if non-empty string, like cover image */}
                {Array.isArray(form.images) && form.images
                  .map((img, idx) => (
                    img && !imagesToRemove.includes(img) ? (
                      <div key={idx} className="gallery-image-wrapper">
                        <img
                          src={img}
                          alt={`Project image ${idx + 1}`}
                          className="project-gallery-image"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        <button
                          type="button"
                          className="gallery-remove-btn"
                          title="Remove image"
                          onClick={() => setImagesToRemove(prev => [...prev, img])}
                        >×</button>
                      </div>
                    ) : null
                  ))}
                {/* New images preview */}
                {newGalleryFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="gallery-image-wrapper">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="project-gallery-image"
                    />
                    <button
                      type="button"
                      className="gallery-remove-btn"
                      title="Remove new image"
                      onClick={() => setNewGalleryFiles(prev => prev.filter((_, i) => i !== idx))}
                    >×</button>
                  </div>
                ))}
                {/* Add images input */}
                <label
                  htmlFor="gallery-upload"
                  className="gallery-add-label"
                >
                  + Add
                  <input
                    id="gallery-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      setNewGalleryFiles(prev => [...prev, ...files]);
                      e.target.value = '';
                    }}
                  />
                </label>
                {/* Show message if no images */}
                {(!form.images || form.images.filter(img => img && !imagesToRemove.includes(img)).length === 0) &&
                  newGalleryFiles.length === 0 && (
                  <div style={{ color: '#888', marginTop: 12 }}>No gallery images yet.</div>
                )}
              </>
            ) : (
              Array.isArray(form.images) && form.images.some(img => img && typeof img === 'string' && img.length > 0) ? (
                form.images.map((img, idx) => (
                  img && typeof img === 'string' && img.length > 0 ? (
                    <img
                      key={idx}
                      src={img}
                      alt={`Project image ${idx + 1}`}
                      className="project-gallery-image"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : null
                ))
              ) : (
                <div style={{ color: '#888', marginTop: 12 }}>No gallery images yet.</div>
              )
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-action-buttons">
          {isEditing ? (
            <div className="modal-action-edit-buttons">
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