const axios = require('axios');
const fs = require('fs');

// GitHub API credentials
const GITHUB_TOKEN = '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';
const ORG_NAME = 'Latitude-OpenDATA-SIO-Saintbe';

// GitHub API URLs
const REPOS_API = `https://api.github.com/orgs/${ORG_NAME}/repos`;
const ISSUES_API = `https://api.github.com/orgs/${ORG_NAME}/issues`;

async function fetchRepoStats() {
    const reposResponse = await axios.get(REPOS_API, {
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`
        }
    });
    return reposResponse.data;
}

async function fetchOpenIssues() {
    const issuesResponse = await axios.get(ISSUES_API, {
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`
        },
        params: {
            state: 'open',
            filter: 'all',
            per_page: 100
        }
    });
    return issuesResponse.data;
}

async function updateReadme() {
    const repos = await fetchRepoStats();
    const issues = await fetchOpenIssues();

    let repoStatsMarkdown = '| Repository Name | Stars | Forks | Issues | Pull Requests |\n';
    repoStatsMarkdown += '|-----------------|-------|-------|--------|---------------|\n';

    repos.forEach(repo => {
        repoStatsMarkdown += `| ${repo.name} | ${repo.stargazers_count} | ${repo.forks_count} | ${repo.open_issues_count} | ${repo.pull_requests_count || 0} |\n`;
    });

    let issuesMarkdown = '| Repository | Open Issues | Severity (High/Medium/Low) | Last Updated |\n';
    issuesMarkdown += '|------------|-------------|----------------------------|--------------|\n';

    issues.forEach(issue => {
        issuesMarkdown += `| ${issue.repository_url.split('/').pop()} | ${issue.title} | High | ${issue.updated_at} |\n`;
    });

    // Read the existing README.md and update
    const readmeContent = fs.readFileSync('README.md', 'utf8');
    const updatedReadme = readmeContent.replace(/<!-- REPO STATS START -->[\s\S]*<!-- REPO STATS END -->/, `<!-- REPO STATS START -->\n${repoStatsMarkdown}\n<!-- REPO STATS END -->`)
                                        .replace(/<!-- ISSUE STATS START -->[\s\S]*<!-- ISSUE STATS END -->/, `<!-- ISSUE STATS START -->\n${issuesMarkdown}\n<!-- ISSUE STATS END -->`);

    // Write the updated content back to README.md
    fs.writeFileSync('README.md', updatedReadme);
}

updateReadme().catch(error => {
    console.error('Error updating README:', error);
});
