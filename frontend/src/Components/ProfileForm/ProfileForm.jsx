import React, { useState, useEffect } from 'react';
import './ProfileForm.css';
import { useNavigate } from 'react-router-dom';
import supabase from '../../helper/supabaseClient';

const ProfileForm = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: '',
    githubURL: '',
    linkedinURL: '',
    company: '',
    role: '',
    work_year: '',
    institution: '',
    ed_attain: '',
    educ_year: '',
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('Error fetching user:', error);
        setError('You must be logged in to create a profile.');
        return;
      }
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError('User not authenticated.');
      return;
    }

    setIsLoading(true);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('Profile')
        .upsert([
          {
            name: formData.name,
            bio: formData.bio,
            skills: formData.skills,
            githubURL: formData.githubURL,
            linkedinURL: formData.linkedinURL,
            userID: currentUser.id
          }],
          { onConflict: ['userID'],
            ignoreDuplicates: false
          } // treat userID uniqely
        );

      if (profileError) {
        console.error('Profile insert error:', profileError);
        throw profileError;
      }

      //Inserting into Work TAble
      const { data: workData, error: workError } = await supabase
      .from('Work')
      .upsert([
        {
            company: formData.company,
            role: formData.role,
            year: formData.work_year,
            userID: currentUser.id
        }], {
            onConflict: ['userID']
        });

      if (workError){
        console.error('Work insert error:', workError);
        throw workError;
      }

      //Inserting into Educ table 
      const { data: educData, error: educError } = await supabase
      .from('Education')
      .upsert([
        {
            institution: formData.institution,
            ed_attainment: formData.ed_attain,
            year: formData.educ_year,
            userID: currentUser.id
        }], {
            onConflict: ['userID']
        });

      if (educError){
        console.error('Education insert error:', educError);
        throw educError;
      }

      navigate('/Profile');
    } catch (err) {
      console.error('Caught error in form submission:', err);
      setError(`Error saving profile: ${JSON.stringify(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <h2>Profile Info</h2>

      {error && (
        <div className="error-message" style={{
          color: 'red',
          padding: '10px',
          border: '1px solid red',
          borderRadius: '4px',
          backgroundColor: '#ffe6e6',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

        {/* Image Upload Area */}
    <div className="image-upload-container">
    <div className="cover-photo">
        <label htmlFor="coverPhotoInput" className="cover-photo-label">
        <span className="plus-icon">+</span>
        <input
            type="file"
            id="coverPhotoInput"
            accept="image/*"
            style={{ display: 'none' }}
        />
        </label>

        <div className="profile-photo-wrapper">
        <label htmlFor="profilePhotoInput" className="profile-photo-label">
            <span className="plus-icon">+</span>
            <input
            type="file"
            id="profilePhotoInput"
            accept="image/*"
            style={{ display: 'none' }}
            />
        </label>
        </div>
    </div>
    </div>

      <label>Name</label>
      <input name="name" value={formData.name} onChange={handleChange} required />

      <label>Bio</label>
      <textarea name="bio" value={formData.bio} onChange={handleChange} required />

      <label>Skills</label>
      <input name="skills" value={formData.skills} onChange={handleChange} required />

      <label>GitHub Link</label>
      <input name="githubURL" type="url" value={formData.githubURL} onChange={handleChange} placeholder="https://github.com/yourusername" />

      <label>LinkedIn Link</label>
      <input name="linkedinURL" type="url" value={formData.linkedinURL} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" />

        {/* Work Info Section */}
      <h3 style={{ marginTop: '32px', fontWeight: '600' }}>Work Info</h3>

      <label>Company</label>
      <input name="company" value={formData.company} onChange={handleChange} />

      <label>Role</label>
      <input name="role" value={formData.role} onChange={handleChange} />

      <label>Year</label>
      <input name="work_year" value={formData.work_year} onChange={handleChange} />

      {/* Educ info Section */}
      <h4 style ={{ marginTop: '32px', fontWeight: '600'}}>Education Info</h4>

      <label>Institution</label>
      <input name="institution" value ={formData.institution} onChange={handleChange} />

      <label>Educational Attainment</label>
      <input name="ed_attain" value ={formData.ed_attain} onChange={handleChange} />

      <label>Year</label>
      <input name="educ_year" value ={formData.educ_year} onChange={handleChange} />

      <div className="form-actions">
        <button type="button" onClick={() => navigate('/Profile')} disabled={isLoading}>Cancel</button>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
