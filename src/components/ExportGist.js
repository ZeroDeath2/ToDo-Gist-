import axios from 'axios';

const exportAsGist = async (title, content, isPublic = false) => { // Added isPublic parameter with default value
  try {
    // Access the environment variable using import.meta.env for Vite
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    
    if (!token) {
      throw new Error('GitHub token not found in environment variables');
    }

    const response = await axios.post(
      'https://api.github.com/gists',
      {
        files: { [`${title}.md`]: { content } },
        public: isPublic, // Use the isPublic parameter here
        description: `${title} - ${isPublic ? 'Public' : 'Private'} gist` // Added descriptive text
      },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        } 
      }
    );

    if (response.status === 201) {
      const gistUrl = response.data.html_url;
      alert(`Gist created successfully!\nAccess your ${isPublic ? 'public' : 'private'} gist at: ${gistUrl}`);
      downloadMarkdownFile(title, content);
      return gistUrl; // Return the gist URL for further use if needed
    }
  } catch (error) {
    console.error('Error creating gist:', error);
    // Still download markdown even if Gist creation fails
    downloadMarkdownFile(title, content);
    throw error; // Re-throw the error for handling by the caller
  }
};

const downloadMarkdownFile = (title, content) => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.md`;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default exportAsGist;