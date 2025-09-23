import { Octokit } from "octokit";
import { toast } from "sonner";

// Initialize Octokit with default empty token (will be set after auth)
let octokit: Octokit | null = null;

export interface GitHubRepoOwner {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  default_branch: string;
  owner: GitHubRepoOwner;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir";
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export const initializeGitHub = (accessToken: string) => {
  octokit = new Octokit({
    auth: accessToken,
  });
  return octokit;
};

export const isGitHubInitialized = () => {
  return octokit !== null;
};

export const getAuthenticatedUser = async (): Promise<GitHubUser | null> => {
  if (!octokit) {
    throw new Error("GitHub client not initialized. Call initializeGitHub first.");
  }

  try {
    const { data } = await octokit.rest.users.getAuthenticated();
    return data as GitHubUser;
  } catch (error) {
    console.error("Error fetching authenticated user:", error);
    throw error;
  }
};

export const getUserRepos = async (username: string): Promise<GitHubRepo[]> => {
  if (!octokit) {
    throw new Error("GitHub client not initialized. Call initializeGitHub first.");
  }

  try {
    const { data } = await octokit.rest.repos.listForUser({
      username,
      sort: "updated",
      per_page: 100,
    });
    return data as GitHubRepo[];
  } catch (error) {
    console.error(`Error fetching repos for user ${username}:`, error);
    throw error;
  }
};

export const getRepoContents = async (
  owner: string,
  repo: string,
  path: string = ""
): Promise<GitHubFile[]> => {
  if (!octokit) {
    throw new Error("GitHub client not initialized. Call initializeGitHub first.");
  }

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if (Array.isArray(data)) {
      return data as GitHubFile[];
    } else {
      return [data as GitHubFile];
    }
  } catch (error) {
    console.error(`Error fetching contents for ${owner}/${repo}/${path}:`, error);
    throw error;
  }
};

export const getFileContent = async (
  owner: string,
  repo: string,
  path: string
): Promise<{ content: string; encoding: string }> => {
  if (!octokit) {
    throw new Error("GitHub client not initialized. Call initializeGitHub first.");
  }

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if (Array.isArray(data)) {
      throw new Error("Path points to a directory, not a file");
    }

    if (data.type !== "file") {
      throw new Error("Path does not point to a file");
    }

    return {
      content: data.content || "",
      encoding: data.encoding as string,
    };
  } catch (error) {
    console.error(`Error fetching file content for ${owner}/${repo}/${path}:`, error);
    throw error;
  }
};

export const createOrUpdateFile = async (
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> => {
  if (!octokit) {
    throw new Error("GitHub client not initialized. Call initializeGitHub first.");
  }

  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      sha,
    });
    toast.success("File saved to GitHub successfully!");
  } catch (error) {
    console.error(`Error creating/updating file ${path} in ${owner}/${repo}:`, error);
    toast.error("Failed to save file to GitHub");
    throw error;
  }
};

export const createPullRequest = async (
  owner: string,
  repo: string,
  title: string,
  head: string,
  base: string = "main",
  body: string = ""
) => {
  if (!octokit) {
    throw new Error("GitHub client not initialized. Call initializeGitHub first.");
  }

  try {
    const { data } = await octokit.rest.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body,
    });
    return data;
  } catch (error) {
    console.error(`Error creating pull request for ${owner}/${repo}:`, error);
    throw error;
  }
};

export const searchRepositories = async (query: string): Promise<GitHubRepo[]> => {
  if (!octokit) {
    throw new Error("GitHub client not initialized. Call initializeGitHub first.");
  }

  try {
    const { data } = await octokit.rest.search.repos({
      q: query,
      sort: "stars",
      order: "desc",
      per_page: 10,
    });
    return data.items as GitHubRepo[];
  } catch (error) {
    console.error("Error searching repositories:", error);
    throw error;
  }
};

export const getBranch = async (owner: string, repo: string, branch: string) => {
  if (!octokit) {
    throw new Error("GitHub client not initialized. Call initializeGitHub first.");
  }

  try {
    const { data } = await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch,
    });
    return data;
  } catch (error: any) {
    if (error.status === 404) {
      return null; // Branch doesn't exist
    }
    console.error(`Error getting branch ${branch} in ${owner}/${repo}:`, error);
    throw error;
  }
};

export const createBranch = async (
  owner: string,
  repo: string,
  branch: string,
  baseSha: string
) => {
  if (!octokit) {
    throw new Error("GitHub client not initialized. Call initializeGitHub first.");
  }

  try {
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: baseSha,
    });
  } catch (error) {
    console.error(`Error creating branch ${branch} in ${owner}/${repo}:`, error);
    throw error;
  }
};
