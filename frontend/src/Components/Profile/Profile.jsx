import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import supabase from '../../helper/supabaseClient'
import githubLogo from '../Assets/profile/github-logo.png';
import linkedinLogo from '../Assets/profile/linkedin-logo.png';
import avatarlogo from '../Assets/profile/Avatar/default-profile.png';
import bglogo from '../Assets/profile/Avatar/default-bg.png';

const Profile = () => {
  const [userID, setUserID] = useState(null);
  const [tab, setTab] = useState('work');
  const [darkMode, setDarkMode] = useState(false);
  const [editorMode, setEditorMode] = useState(false);
  const navigate = useNavigate();
  const goHome = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user) {
        setUserID(user.id);

        const { data: profileData, error: profileError } = await supabase 
        .from('Profile')
        .select('*')
        .eq('userID', user.id)
        .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile:", profileError);
        } else if (profileData) {
          setName(profileData.name || 'User');
          setBio(profileData.bio || 'Your Bio');
          setGithubUrl(profileData.githubURL || 'https://github.com/');
          setLinkedinUrl(profileData.linkedinURL || 'https://www.linkedin.com/');
        }

        const { data: workEntries, error: workError } =await supabase 
        .from('Work')
        .select('*')
        .eq('userID', user.id);

        if (workError) {
          console.error("Error fetching work data:", workError);
        } else {
          setWorkData(workEntries);
          setTempWork([...workEntries]);
        }

        const { data: educationEntries, error: educationError } = await supabase
        .from('Education')
        .select('*')
        .eq('userID', user.id);

        if (educationError){
          console.error("Error fetching education data:", educationError);
        }else {
          const mappedEducation =educationEntries.map(entry => ({
            ...entry,
            attainment: entry.ed_attainment
          }));
          setEducationData(mappedEducation);
          setTempEducation([...mappedEducation]);
        }
      } else {
        console.error("User not logged in:", error);
        navigate('/login');
      }

      const { data: skillsData, error: skillsError } = await supabase
      .from('UserSkills')
      .select('skill')
      .eq('userID', user.id);

      if(skillsError){
        console.error('Error fetching skills:', skillsError);
      }else {
        const loadedSkills = skillsData.map(skill => ({
          name:skill.skill,
          icon: '/assets/default-skill.png'
        }));
      setSkills(loadedSkills);
      setTempSkills(loadedSkills);
      }
    };

    fetchUser();
  }, [navigate]);

  const [bio, setBio] = useState('Your Bio');
  const [name, setName] = useState('User');
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
    { company: '-', role: '-', year: '-' },
  ]);

  const [educationData, setEducationData] = useState([]);

 


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

  const saveChanges = async () => {
  console.log('tempEducation before save:', tempEducation);
  setBio(tempBio);
  setSkills(tempSkills);
  setWorkData(tempWork);
  setEducationData(tempEducation);
  setName(tempName);
  setGithubUrl(tempGithubUrl);
  setLinkedinUrl(tempLinkedinUrl);
  setEditorMode(false);

  if (!userID) {
    console.error('User ID not available.');
    return;
  }

  const { data: existingProfile, error: fetchError } = await supabase
    .from('Profile')
    .select('*')
    .eq('userID', userID)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Fetch error:', fetchError);
    return;
  }

  if (existingProfile) {
    // Update if entry exists
    const { error: updateError } = await supabase
      .from('Profile')
      .update({
        bio: tempBio,
        name: tempName,
        githubURL: tempGithubUrl,
        linkedinURL: tempLinkedinUrl
      })
      .eq('userID', userID);

    if (updateError) {
      console.error('Update error:', updateError);
    }
  } else {
    // Insert new profile if it doesn't exist
    const { error: insertError } = await supabase
      .from('Profile')
      .insert([{
        userID: userID,
        bio: tempBio,
        name: tempName,
        githubURL: tempGithubUrl,
        linkedinURL: tempLinkedinUrl
      }]);

    if (insertError) {
      console.error('Insert error:', insertError);
    }
  }

  if (userID) {
    try {
      const { error: deleteSkillsError } = await supabase
      .from('UserSkills')
      .delete()
      .eq('userID', userID);

      if (deleteSkillsError) {
        console.error('Error deleting old skills:', deleteSkillsError);
      }

      const skillsToInsert = Array.from(
        new Map(
          tempSkills
            .filter(skill => skill.name.trim() !== '')
            .map(skill => [skill.name.trim().toLowerCase(), {
              userID: userID,
              skill: skill.name.trim()
            }])
        ).values()
      );
    
      if(skillsToInsert.length > 0) {
        const {error: insertSkillsError } = await supabase
        .from('UserSkills')
        .insert(skillsToInsert);

        if(insertSkillsError){
          console.error('Error inserting new skills:', insertSkillsError);
        }
      }
    } catch (err) {
      console.error('Unexpected error syncing skills:', err);
    }
  }

  await supabase.from('Work').delete().eq('userID', userID);

  const workToInsert = tempWork.map(item => ({
    userID,
    company: item.company,
    role: item.role,
    year: item.year
  }));

  const { error: insertWorkError } = await supabase
    .from('Work')
    .insert(workToInsert);

  if (insertWorkError) {
    console.error('Error inserting work entries:', insertWorkError);
  }

  await supabase.from('Education').delete().eq('userID', userID);


  const educationToInsert = tempEducation
  .filter(item => item.institution && item.attainment && item.year)
  .map(item => ({
    userID,
    institution: item.institution,
    ed_attainment: item.attainment,
    year: item.year
  }));

  if (educationToInsert.length > 0) {
  const { error: insertEducationError } = await supabase
    .from('Education')
    .insert(educationToInsert);

  if(insertEducationError){
    console.error('Error inserting education entries:', insertEducationError);
  }
}

  const { error: insertEducationError } = await supabase
  .from('Education')
  .insert(educationToInsert);

  if(insertEducationError){
    console.error('Error inserting education entries:', insertEducationError);
  }
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
    if (type === 'work') {
      const updated = tempWork.map((entry, i) => 
      i === index ? {...entry, [field]: value}: entry 
    );
    setTempWork(updated);
    } else {
      const updated = tempEducation.map((entry, i) =>
      i === index ? {...entry, [field]: value }: entry
    );
    setTempEducation(updated);
    }
  };

  const addTimelineEntry = (type) => {
    const newEntry = type === 'work'
      ? { company: '', role: '', year: '' }
      : { institution: '', attainment: '', year: '' };
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
      <button onClick={goHome} className="home-button">
        🏠
      </button>

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
                <th>{tab === 'work' ? 'Company' : 'Institution'}</th>
                <th>{tab === 'work' ? 'Role' : 'Attainment'}</th>
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
                        value={tab === 'work' ? item.company : item.institution}
                        onChange={(e) => handleTimelineChange(idx, tab === 'work' ? 'company' : 'institution', e.target.value, tab)}
                      />
                    ) : (
                      tab === 'work' ? item.company : item.institution
                    )}
                  </td>
                  <td>
                    {editorMode ? (
                      <input
                        type="text"
                        value={tab === 'work' ? item.role : item.attainment}
                        onChange={(e) => handleTimelineChange(idx, tab === 'work' ? 'role' : 'attainment', e.target.value, tab)}
                      />
                    ) : (
                      tab === 'work' ? item.role : item.attainment
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
            <button onClick={() => addTimelineEntry(tab)}>
              + Add {tab === 'work' ? 'Work' : 'Education'} Entry
            </button>
          )}
        </div>

        {editorMode && (
          <div className="button-wrapper">
            <button onClick={saveChanges} className= "save-button">Save Changes</button>
            <button onClick={cancelChanges} className="cancel-button">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
