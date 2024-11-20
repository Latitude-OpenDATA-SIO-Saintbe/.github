const axios = require('axios');
const fs = require('fs');

// GitHub API credentials
const GITHUB_TOKEN = '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';
const ORG_NAME = 'Latitude-OpenDATA-SIO-Saintbe';

// GitHub API URLs
const REPOS_API = `https://api.github.com/orgs/${ORG_NAME}/repos`;
const ISSUES_API = `https://api.github.com/repos/${ORG_NAME}/setup/issues`;

// Function to fetch repositories' stats
async function fetchRepoStats() {
    const reposResponse = await axios.get(REPOS_API, {
        headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
    return reposResponse.data;
}

// Function to fetch open issues
async function fetchOpenIssues() {
    const issuesResponse = await axios.get(ISSUES_API, {
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`
            'X-GitHub-Api-Version': '2022-11-28'
        },
        params: {
            state: 'open',
            filter: 'all',
            per_page: 100
        }
    });
    return issuesResponse.data;
}

// Function to fetch open pull requests for each repository
async function fetchOpenPullRequests(repoName) {
    const pullsResponse = await axios.get(`https://api.github.com/repos/${ORG_NAME}/${repoName}/pulls`, {
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`
        },
        params: {
            state: 'open',
            per_page: 100
        }
    });
    return pullsResponse.data.length;  // Returns the count of open PRs
}

async function updateReadme() {
    const repos = await fetchRepoStats();
    const issues = await fetchOpenIssues();

    let repoStatsMarkdown = '| Repository Name | Stars | Forks | Issues | Pull Requests |\n';
    repoStatsMarkdown += '|-----------------|-------|-------|--------|---------------|\n';

    // Loop through repositories and add stats
    for (const repo of repos) {
        const openPullRequests = await fetchOpenPullRequests(repo.name);  // Fetch pull requests for each repo
        repoStatsMarkdown += `| ${repo.name} | ${repo.stargazers_count} | ${repo.forks_count} | ${repo.open_issues_count} | ${openPullRequests} |\n`;
    }

    let issuesMarkdown = '| Repository | Open Issues | Severity (High/Medium/Low) | Last Updated |\n';
    issuesMarkdown += '|------------|-------------|----------------------------|--------------|\n';

    // Add issue stats
    issues.forEach(issue => {
        issuesMarkdown += `| ${issue.repository_url.split('/').pop()} | ${issue.title} | High | ${issue.updated_at} |\n`;
    });

    // Read the existing README.md in the 'profile' subfolder and update with new stats
    const readmeContent = fs.readFileSync('profile/README.md', 'utf8');  // Correct path for the profile/README.md
    const updatedReadme = readmeContent.replace(/<!-- REPO STATS START -->[\s\S]*<!-- REPO STATS END -->/, `<!-- REPO STATS START -->\n${repoStatsMarkdown}\n<!-- REPO STATS END -->`)
                                        .replace(/<!-- ISSUE STATS START -->[\s\S]*<!-- ISSUE STATS END -->/, `<!-- ISSUE STATS START -->\n${issuesMarkdown}\n<!-- ISSUE STATS END -->`);

    // Write the updated content back to profile/README.md
    fs.writeFileSync('profile/README.md', updatedReadme);  // Correct path for the profile/README.md
}

updateReadme().catch(error => {
    console.error('Error updating README:', error);
});
