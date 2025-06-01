import React from 'react';

const ProjectModal = ({ project, darkMode, onClose }) => {
  if (!project) return null;

 
  const tags = Array.isArray(project.tags)
    ? project.tags
    : typeof project.tags === 'string'
      ? project.tags.split(',').map(tag => tag.trim())
      : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${darkMode ? 'dark' : 'light'}`} onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <p>
          <strong>Tags:</strong> {tags.join(', ')}
        </p>
        <p><strong>Type:</strong> {project.type}</p>
      </div>
    </div>
  );
};

export default ProjectModal;