// src/components/ExportGist.js
import axios from 'axios';

const exportAsGist = async (title, summary) => {
  const content = `# ${title}\n\n## Summary\n${summary}\n`;

  const response = await axios.post(
    'https://api.github.com/gists',
    {
      files: { [`${title}.md`]: { content } },
      public: false,
    },
    { headers: { Authorization: `token YOUR_GITHUB_TOKEN` } }
  );

  if (response.status === 201) {
    alert('Gist created successfully!');
  }
};

export default exportAsGist;
