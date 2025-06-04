import React, { useState } from 'react';
import './Profile.css';
import githubLogo from '../Assets/profile/github-logo.png';
import linkedinLogo from '../Assets/profile/linkedin-logo.png';
import avatarlogo from '../Assets/profile/Avatar/default-profile.png';
import bglogo from '../Assets/profile/Avatar/default-bg.png';



const Profile = () => {
  const [tab, setTab] = useState('work');
  const [darkMode, setDarkMode] = useState(false);
  const [editorMode, setEditorMode] = useState(false);

  const [bio, setBio] = useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi sodales malesuada rutrum. In hac habitasse platea dictumst. Praet nulla ante, eleifend eget pellentesque congue, congue a urna.');
  const [name, setName] = useState('Hey, I’m Wilma');
  const [tempName, setTempName] = useState(name);
  const [githubUrl, setGithubUrl] = useState('https://github.com/');
  const [linkedinUrl, setLinkedinUrl] = useState('https://www.linkedin.com/');

  const [tempGithubUrl, setTempGithubUrl] = useState(githubUrl);
  const [tempLinkedinUrl, setTempLinkedinUrl] = useState(linkedinUrl);

  const [skills, setSkills] = useState([
    { name: 'Python', icon: '/assets/python-icon.png' },
    { name: 'HTML5', icon: '/assets/html5-icon.png' }
  ]);
  const [profileImage, setProfileImage] = useState(avatarlogo);
  const [coverImage, setCoverImage] = useState(bglogo);
  const [tempBio, setTempBio] = useState(bio);
  const [tempSkills, setTempSkills] = useState(skills);
  const [tempWork, setTempWork] = useState([]);
  const [tempEducation, setTempEducation] = useState([]);

  const [workData, setWorkData] = useState([
    { company: 'Google', role: 'Software Engineer', year: '2020 - Present' },
    { company: 'Facebook', role: 'Intern', year: '2019 - 2020' },
  ]);

  const [educationData, setEducationData] = useState([
    { school: 'MIT', degree: 'BSc Computer Science', year: '2016 - 2020' },
    { school: 'High School X', degree: 'High School Diploma', year: '2012 - 2016' },
  ]);

 


  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const toggleTheme = () => setDarkMode(prev => !prev);

  const toggleEdit = () => {
  if (!editorMode) {
    setTempBio(bio);
    setTempSkills(skills);
    setTempWork([...workData]);
    setTempEducation([...educationData]);
    setTempName(name);
    setTempGithubUrl(githubUrl);
    setTempLinkedinUrl(linkedinUrl);
  }
  setEditorMode(prev => !prev);
};

  const saveChanges = () => {
  setBio(tempBio);
  setSkills(tempSkills);
  setWorkData(tempWork);
  setEducationData(tempEducation);
  setName(tempName);
  setGithubUrl(tempGithubUrl);
  setLinkedinUrl(tempLinkedinUrl);
  setEditorMode(false);
};


  const cancelChanges = () => {
  setTempBio(bio);
  setTempSkills(skills);
  setTempWork([...workData]);
  setTempEducation([...educationData]);
  setTempName(name);
  setTempGithubUrl(githubUrl);
  setTempLinkedinUrl(linkedinUrl);
  setEditorMode(false);
};


  const handleSkillChange = (index, newName) => {
    const updatedSkills = [...tempSkills];
    updatedSkills[index].name = newName;
    setTempSkills(updatedSkills);
  };

  const handleSkillIconUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const updatedSkills = [...tempSkills];
      updatedSkills[index].icon = URL.createObjectURL(file);
      setTempSkills(updatedSkills);
    }
  };

  const addSkill = () => {
    setTempSkills([...tempSkills, { name: 'New Skill', icon: '/assets/default-skill.png' }]);
  };

  const deleteSkill = (index) => {
    const updatedSkills = tempSkills.filter((_, i) => i !== index);
    setTempSkills(updatedSkills);
  };

  const handleTimelineChange = (index, field, value, type) => {
    const data = type === 'work' ? [...tempWork] : [...tempEducation];
    data[index][field] = value;
    type === 'work' ? setTempWork(data) : setTempEducation(data);
  };

  const addTimelineEntry = (type) => {
    const newEntry = type === 'work'
      ? { company: '', role: '', year: '' }
      : { school: '', degree: '', year: '' };
    type === 'work'
      ? setTempWork([...tempWork, newEntry])
      : setTempEducation([...tempEducation, newEntry]);
  };

  const deleteTimelineEntry = (type, index) => {
    const updated = type === 'work' ? [...tempWork] : [...tempEducation];
    updated.splice(index, 1);
    type === 'work' ? setTempWork(updated) : setTempEducation(updated);
  };

  return (
    <div className={`profile-container ${darkMode ? 'dark' : 'light'} ${editorMode ? 'edit-mode' : ''}`}>
      <div className="toggle-buttons">
        <button className="toggle-button" onClick={toggleTheme}>
          {darkMode ? '🌞' : '🌙'}
        </button>
        <button className="toggle-button" onClick={toggleEdit}>
          {editorMode ? '🔓' : '✏️'}
        </button>
      </div>

      <div className="profile-header">
        <img className="cover-photo" src={coverImage} alt="cover" />
        {editorMode && (
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setCoverImage)} />
        )}

        <div className="profile-top">
          <div className="profile-pic-container">
            <img className="profile-pic" src={profileImage} alt="profile" />
            <div className="social-links">
              <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                <img src={githubLogo} alt="GitHub" className="social-icon" style={{ width: '32px', height: '32px' }} />
              </a>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                <img src={linkedinLogo} alt="LinkedIn" className="social-icon" style={{ width: '32px', height: '32px' }} />
              </a>
            </div>
          </div>
          {editorMode && (
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setProfileImage)} />
          )}

          <div className="profile-name">
            {editorMode ? (
              <>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                />
                <span className="wave-emoji">👋</span>
              </>
            ) : (
              <>
                {name}
                <span className="wave-emoji">👋</span>
              </>
            )}
          </div>

          {editorMode && (
            <div className="social-inputs">
              <div className="social-edit">
                <img src={githubLogo} alt="GitHub" className="social-icon" style={{ width: '32px', height: '32px' }} />
                <input
                  type="text"
                  value={tempGithubUrl}
                  onChange={(e) => setTempGithubUrl(e.target.value)}
                  placeholder="https://github.com/"
                  className="social-input"
                />
              </div>
              <div className="social-edit">
                <img src={linkedinLogo} alt="LinkedIn" className="social-icon" style={{ width: '32px', height: '32px' }} />
                <input
                  type="text"
                  value={tempLinkedinUrl}
                  onChange={(e) => setTempLinkedinUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/"
                  className="social-input"
                />
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="profile-body">
        {editorMode ? (
          <textarea
            className="bio-textarea"
            value={tempBio}
            onChange={(e) => setTempBio(e.target.value)}
          />
        ) : (
          <p className="bio-text">{bio}</p>
        )}

        <div className="skills-section">
          <h3>Skills</h3>
          <div className="skills-grid">
            {(editorMode ? tempSkills : skills).map((skill, index) => (
              <div className="skill-card" key={index}>
                <img src={skill.icon} alt={skill.name} />
                {editorMode ? (
                  <>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSkillIconUpload(e, index)}
                    />
                    <button onClick={() => deleteSkill(index)}>❌</button>
                  </>
                ) : (
                  <div>{skill.name}</div>
                )}
              </div>
            ))}
            {editorMode && (
              <button className="add-skill-btn" onClick={addSkill}>+ Add Skill</button>
            )}
          </div>
        </div>

        <div className="timeline-tabs">
          <div
            className={`timeline-tab ${tab === 'work' ? 'active' : ''}`}
            onClick={() => setTab('work')}
          >
            Work
          </div>
          <div
            className={`timeline-tab ${tab === 'education' ? 'active' : ''}`}
            onClick={() => setTab('education')}
          >
            Education
          </div>
        </div>

        <div className="table-section">
          <table className="timeline-table">
            <thead>
              <tr>
                <th>{tab === 'work' ? 'Company' : 'School'}</th>
                <th>{tab === 'work' ? 'Role' : 'Degree'}</th>
                <th>Year</th>
                {editorMode && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {(tab === 'work' ? (editorMode ? tempWork : workData) : (editorMode ? tempEducation : educationData)).map((item, idx) => (
                <tr key={idx}>
                  <td>
                    {editorMode ? (
                      <input
                        type="text"
                        value={tab === 'work' ? item.company : item.school}
                        onChange={(e) => handleTimelineChange(idx, tab === 'work' ? 'company' : 'school', e.target.value, tab)}
                      />
                    ) : (
                      tab === 'work' ? item.company : item.school
                    )}
                  </td>
                  <td>
                    {editorMode ? (
                      <input
                        type="text"
                        value={tab === 'work' ? item.role : item.degree}
                        onChange={(e) => handleTimelineChange(idx, tab === 'work' ? 'role' : 'degree', e.target.value, tab)}
                      />
                    ) : (
                      tab === 'work' ? item.role : item.degree
                    )}
                  </td>
                  <td>
                    {editorMode ? (
                      <input
                        type="text"
                        value={item.year}
                        onChange={(e) => handleTimelineChange(idx, 'year', e.target.value, tab)}
                      />
                    ) : (
                      item.year
                    )}
                  </td>
                  {editorMode && (
                    <td>
                      <button onClick={() => deleteTimelineEntry(tab, idx)}>❌</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {editorMode && (
            <button onClick={() => addTimelineEntry(tab)} className="add-entry-button">
              + Add {tab === 'work' ? 'Work' : 'Education'}
            </button>
          )}
        </div>

        {editorMode && (
          <div className="editor-actions">
            <button className="save-button" onClick={saveChanges}>Save</button>
            <button className="cancel-button" onClick={cancelChanges}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
