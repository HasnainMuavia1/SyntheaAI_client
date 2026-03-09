import Cookies from 'js-cookie';

// The Base URL of your Python Backend (Django)
// Django is configured with:
//   path('api/', include('accounts.urls'))
//   path('api/ide/', include('ide.urls'))
// so the canonical prefix is "/api" (no trailing slash), and:
//   - Health check lives at "/api/" (trailing slash required because APPEND_SLASH = False)
//   - IDE routes live under "/api/ide/..."
const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Normalize so we never have a trailing slash in the base,
// which keeps IDE routes exactly matching Django re_path() patterns.
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

// Health endpoint must be "/api/" (with trailing slash) to match accounts.urls
const HEALTH_CHECK_URL = `${API_BASE_URL}/`;

const getAuthHeaders = (): Record<string, string> => {
  const token = Cookies.get('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const apiClient = {
  // 1. Health Check
  getHealth: async () => {
    try {
      const res = await fetch(HEALTH_CHECK_URL);
      return await res.json();
    } catch (error) {
      console.error("Backend offline:", error);
      return { status: "offline" };
    }
  },

  // 2. Transcribe Audio (Mic -> Backend -> Gladia)
  transcribeAudio: async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    // Note: This matches the "Voice Router" we built: /api/voice/process
    const res = await fetch(`${API_BASE_URL}/voice/process`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error("Transcription failed");
    return await res.json();
  },

  // 3. Execute Agent (Text -> Backend -> OpenAI -> Code)
  executeAgent: async (instruction: string, filename: string, fileContent: string) => {
    const res = await fetch(`${API_BASE_URL}/agent/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instruction,
        filename,
        file_content: fileContent
      }),
    });

    if (!res.ok) {
      throw new Error('AI execution failed');
    }

    return await res.json();
  },

  // 4. Projects (Workspaces)
  projects: {
    list: async () => {
      const res = await fetch(`${API_BASE_URL}/ide/projects`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to list projects');
      return res.json();
    },
    create: async (name: string, description: string = '') => {
      const res = await fetch(`${API_BASE_URL}/ide/projects`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create project');
      }
      return res.json();
    },
    delete: async (projectId: string) => {
      const res = await fetch(`${API_BASE_URL}/ide/projects/${projectId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete project');
      return res.json();
    }
  },

  // IDE Methods
  ide: {
    listFiles: async (projectId: string, path: string = '') => {
      const timestamp = new Date().getTime();
      const res = await fetch(`${API_BASE_URL}/ide/files/list?projectId=${projectId}&path=${encodeURIComponent(path)}&_t=${timestamp}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to list files');
      return res.json();
    },
    readFile: async (projectId: string, path: string) => {
      const res = await fetch(`${API_BASE_URL}/ide/files/detail?projectId=${projectId}&path=${encodeURIComponent(path)}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to read file');
      return res.json();
    },
    writeFile: async (projectId: string, path: string, content: string = '', isDir: boolean = false) => {
      const res = await fetch(`${API_BASE_URL}/ide/files/detail`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId, path, content, is_dir: isDir })
      });
      if (!res.ok) throw new Error('Failed to write file');
      return res.json();
    },
    deleteFile: async (projectId: string, path: string) => {
      const res = await fetch(`${API_BASE_URL}/ide/files/detail?projectId=${projectId}&path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete file');
      return res.json();
    },
    renameFile: async (projectId: string, oldPath: string, newPath: string) => {
      // Django re_path in ide/urls.py: r'^files/rename$' (no trailing slash)
      const res = await fetch(`${API_BASE_URL}/ide/files/rename`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId, old_path: oldPath, new_path: newPath })
      });
      if (!res.ok) throw new Error('Failed to rename file');
      return res.json();
    },
    getChatSessions: async (projectId: string) => {
      const res = await fetch(`${API_BASE_URL}/ide/projects/${projectId}/sessions`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch chat sessions');
      return res.json();
    },
    createChatSession: async (projectId: string, title: string = 'New Chat') => {
      const res = await fetch(`${API_BASE_URL}/ide/projects/${projectId}/sessions`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });
      if (!res.ok) throw new Error('Failed to create chat session');
      return res.json();
    },
    deleteChatSession: async (projectId: string, sessionId: string) => {
      const res = await fetch(`${API_BASE_URL}/ide/projects/${projectId}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete chat session');
      // 204 No Content usually doesn't have JSON body, so return empty object
      return res.status === 204 ? {} : res.json();
    },
    getChatHistory: async (projectId: string, sessionId: string) => {
      const res = await fetch(`${API_BASE_URL}/ide/projects/${projectId}/sessions/${sessionId}/messages`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch chat history');
      return res.json();
    },
    sendChatMessage: async (projectId: string, sessionId: string, sender: 'user' | 'agent', text: string) => {
      const res = await fetch(`${API_BASE_URL}/ide/projects/${projectId}/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sender, text })
      });
      if (!res.ok) throw new Error('Failed to send chat message');
      return res.json();
    },
    updateChatSessionTitle: async (projectId: string, sessionId: string, title: string) => {
      const res = await fetch(`${API_BASE_URL}/ide/projects/${projectId}/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });
      if (!res.ok) throw new Error('Failed to update chat session title');
      return res.json();
    }
  },

  // 5. Auth
  auth: {
    getProfile: async () => {
      const res = await fetch(`${API_BASE_URL}/profile/`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    }
  }
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errorMsg = `API Error: ${res.statusText}`;
    try {
      const errData = await res.json();
      errorMsg = errData.error || errorMsg;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
};