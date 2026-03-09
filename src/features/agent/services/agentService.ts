import axios from 'axios';

const API_URL = "/api";

export const agentService = {
  // Existing Edit Logic
  executeEdit: async (instruction: string, filename: string, currentContent: string) => {
    return axios.post(`${API_URL}/agent/edit`, {
      instruction,
      filename,
      current_content: currentContent
    });
  },

  // NEW: File System Operations
  performFileSystemOp: async (command: string, payload: any) => {
    try {
      // Endpoint to handle CREATE, DELETE, RENAME
      const response = await axios.post(`${API_URL}/agent/fs-operation`, {
        operation: command, // e.g., 'CREATE_FILE', 'RENAME_FILE'
        ...payload          // e.g., { path: 'src/utils.ts' }
      });
      return response.data;
    } catch (error) {
      console.error("FS Operation Error:", error);
      throw error;
    }
  },

  checkHealth: async () => {
    return axios.get(`${API_URL}/`);
  }
};