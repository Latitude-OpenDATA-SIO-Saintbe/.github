import requests
import matplotlib.pyplot as plt
import os

# Configuration
GITHUB_API_URL = "https://api.github.com"
REPO_OWNER = "Latitude-OpenDATA-SIO-Saintbe"
REPO_NAME = "setup"
TOKEN = os.getenv('GITHUB_TOKEN')

headers = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

# Function to get issues from GitHub
def get_issues(state='all'):
    url = f"{GITHUB_API_URL}/repos/{REPO_OWNER}/{REPO_NAME}/issues"
    params = {"state": state}
    response = requests.get(url, headers=headers, params=params)
    return response.json()

# Function to generate a bug count graph
def generate_bug_graph(issues):
    bug_issues = [issue for issue in issues if 'bug' in [label['name'] for label in issue['labels']]]
    
    if not bug_issues:  # No issues with the 'bug' label
        print("No bug issues found.")
        return  # Exit the function early if no bug issues are found
    
    open_bugs = len([issue for issue in bug_issues if issue['state'] == 'open'])
    closed_bugs = len([issue for issue in bug_issues if issue['state'] == 'closed'])

    labels = ['Open Bugs', 'Closed Bugs']
    sizes = [open_bugs, closed_bugs]
    
    # Avoid empty sizes list
    if sum(sizes) == 0:
        print("No open or closed bugs to display.")
        return
    
    colors = ['lightcoral', 'lightskyblue']
    explode = (0.1, 0)

    plt.pie(sizes, explode=explode, labels=labels, colors=colors,
            autopct='%1.1f%%', shadow=True, startangle=140)
    plt.axis('equal')
    plt.title('Bug Status')
    plt.savefig('bug_status.png')
    plt.close()


# Function to generate workload graph
def generate_workload_graph(issues):
    assignees = {}
    for issue in issues:
        for assignee in issue['assignees']:
            if assignee['login'] in assignees:
                assignees[assignee['login']] += 1
            else:
                assignees[assignee['login']] = 1
    
    plt.bar(assignees.keys(), assignees.values(), color='skyblue')
    plt.xlabel('Assignees')
    plt.ylabel('Number of Issues')
    plt.title('Workload by Assignee')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('workload_by_assignee.png')
    plt.close()

# Function to generate progress graph
def generate_progress_graph(issues):
    open_issues = len([issue for issue in issues if issue['state'] == 'open'])
    closed_issues = len([issue for issue in issues if issue['state'] == 'closed'])

    labels = ['Open Issues', 'Closed Issues']
    sizes = [open_issues, closed_issues]
    colors = ['lightcoral', 'lightskyblue']
    explode = (0.1, 0)

    plt.pie(sizes, explode=explode, labels=labels, colors=colors,
            autopct='%1.1f%%', shadow=True, startangle=140)
    plt.axis('equal')
    plt.title('Project Progress')
    plt.savefig('project_progress.png')
    plt.close()

# Main function to fetch data and generate graphs
def main():
    issues = get_issues()
    generate_bug_graph(issues)
    generate_workload_graph(issues)
    generate_progress_graph(issues)

if __name__ == "__main__":
    main()
