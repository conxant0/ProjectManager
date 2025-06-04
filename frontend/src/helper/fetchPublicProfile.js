
import supabase from './supabaseClient'

export const fetchPublicProfile = async (username) => {
  // Step 1: Call the RPC to get user ID by username
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_user_by_username', { _username: username })
    .maybeSingle()

  if (rpcError) {
    console.error('RPC error:', rpcError)
    return { error: rpcError, profile: null, projects: [] }
  }
  if (!rpcData) {
    return { error: new Error('User not found'), profile: null, projects: [] }
  }
  const userId = rpcData.id

  // Step 2: Fetch the Profile row using the mixed-case "userID" column
  const { data: profileData, error: profileError } = await supabase
    .from('Profile')
    .select('ProfileID, name, bio, skills, username')
    .eq('"userID"', userId)
    .single()

  if (profileError || !profileData) {
    console.error('Profile not found or error:', profileError)
    return {
      error: profileError || new Error('Profile not found'),
      profile: null,
      projects: []
    }
  }

  // Step 3: Fetch public projects for that user
  const { data: projectData, error: projectError } = await supabase
    .from('Project')
    .select('*')
    .eq('userID', userId)      // Assuming Project.userID is all lowercase or adjust similarly
    .eq('visibility', 'Public')

  if (projectError) {
    console.error('Failed to load projects:', projectError)
    return {
      error: projectError,
      profile: profileData,
      projects: []
    }
  }

  return {
    error: null,
    profile: profileData,
    projects: projectData
  }
}
