import React from 'react';
import './ProjectModal.css';


const ProjectModal = ({ project, darkMode, onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  if (!project) return null;

  const tags = Array.isArray(project.tags)
    ? project.tags
    : typeof project.tags === 'string'
      ? project.tags.split(',').map(tag => tag.trim())
      : [];

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal ${darkMode ? 'dark' : 'light'}`} onClick={e => e.stopPropagation()}>
        {project.coverImage && (
          <img
            src={project.coverImage}
            alt={project.title}
            className="project-cover-image"
          />
        )}
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{project.title}</h2>
        <p><strong></strong> {project.description}</p>
        <p><strong>Category:</strong> {project.category || '-'}</p>
        <p><strong>Status:</strong> {project.status || '-'}</p>
        <p><strong>Tags:</strong> {tags.length > 0 ? tags.join(', ') : '-'}</p>
        <p><strong>Visibility:</strong> {project.visibility || '-'}</p>
        <div style={{ margin: '12px 0' }}>
          <h3>Project Highlights</h3>
          <p><strong>Tools Used:</strong> {project.tools || '-'}</p>
          <p><strong>Your Role:</strong> {project.role || '-'}</p>
          <p><strong>Timeline:</strong> {project.timeline || '-'}</p>
        </div>
        <div style={{ margin: '12px 0' }}>
          <h3>Project Links</h3>
          <p>
            <strong>GitHub:</strong> {project.githubURL ? (
              <a href={project.githubURL} target="_blank" rel="noopener noreferrer">{project.githubURL}</a>
            ) : '-'}
          </p>
          <p>
            <strong>Figma:</strong> {project.figmaURL ? (
              <a href={project.figmaURL} target="_blank" rel="noopener noreferrer">{project.figmaURL}</a>
            ) : '-'}
          </p>
          <p>
            <strong>Notion:</strong> {project.notionURL ? (
              <a href={project.notionURL} target="_blank" rel="noopener noreferrer">{project.notionURL}</a>
            ) : '-'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;