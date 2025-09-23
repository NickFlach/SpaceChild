# Version Control with GitHub

SpaceChild integrates seamlessly with GitHub to provide powerful version control capabilities. This guide explains how to connect and work with GitHub repositories.

## Connecting to GitHub

1. Click on your profile picture in the bottom left corner
2. Select "Settings"
3. Go to the "Integrations" tab
4. Click "Connect" next to GitHub
5. Authorize SpaceChild to access your GitHub account

## Cloning a Repository

1. Click "New Project"
2. Select "Clone from GitHub"
3. Choose a repository from your GitHub account
4. Select the branch you want to work on
5. Click "Clone"

## Working with Branches

### Creating a New Branch

1. Click the branch selector in the bottom status bar
2. Click "New Branch"
3. Enter a branch name
4. Click "Create"

### Switching Branches

1. Click the branch selector in the bottom status bar
2. Select the branch you want to switch to
3. If you have uncommitted changes, you'll be prompted to commit or stash them

## Committing Changes

1. Make changes to your files
2. Stage changes by clicking the "+" next to modified files
3. Enter a commit message
4. Click "Commit"

## Pushing and Pulling

### Pushing Changes to GitHub

1. Click the sync button in the bottom status bar
2. Select "Push"
3. Choose the branch to push to
4. Click "Push"

### Pulling Changes from GitHub

1. Click the sync button in the bottom status bar
2. Select "Pull"
3. Choose the branch to pull from
4. Click "Pull"

## Creating Pull Requests

1. Click the GitHub icon in the sidebar
2. Go to the "Pull Requests" tab
3. Click "New Pull Request"
4. Select the base and compare branches
5. Enter a title and description
6. Click "Create Pull Request"

## Reviewing Code

1. Open the Pull Request in the GitHub interface
2. Click on the "Files changed" tab
3. Add line comments by clicking the "+" next to a line
4. Start a review by clicking "Start a review"
5. When done, click "Finish your review"

## Resolving Merge Conflicts

1. When conflicts occur, you'll be notified
2. Open the file with conflicts
3. Resolve the conflicts directly in the editor
4. Stage the resolved file
5. Commit the resolution

## GitHub Actions Integration

SpaceChild can show GitHub Actions workflow runs:

1. Click the GitHub icon in the sidebar
2. Go to the "Actions" tab
3. View workflow runs and their status
4. Click on a run to see detailed logs

## Best Practices

1. **Commit often** - Small, focused commits are easier to review
2. **Write good commit messages** - Be clear about what changed and why
3. **Use branches** - Keep your main branch stable
4. **Review before merging** - Always review code before merging to main
5. **Keep your fork up to date** - Regularly sync with the upstream repository

## Troubleshooting

### Authentication Issues
- Make sure you're properly authenticated with GitHub
- Check that you have the necessary permissions on the repository
- Try disconnecting and reconnecting the GitHub integration

### Sync Issues
- Check your internet connection
- Make sure you have the latest changes pulled
- Try refreshing the page

For more advanced GitHub workflows, see the [GitHub documentation](https://docs.github.com).
