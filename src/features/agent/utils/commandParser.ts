// src/features/agent/utils/commandParser.ts

export type CommandType = 
  | 'CREATE_FILE' 
  | 'DELETE_FILE' 
  | 'RENAME_FILE'  // Added
  | 'CREATE_FOLDER' // Added
  | 'DELETE_FOLDER' // Added
  | 'EXPLAIN_CODE' 
  | 'RUN_CODE' 
  | 'REFACTOR'
  | 'UNKNOWN';

export interface ParsedCommand {
  type: CommandType;
  payload: any;
  originalText: string;
}

export const parseVoiceCommand = (transcript: string): ParsedCommand => {
  const lower = transcript.toLowerCase().trim();

  // Helper regex for capturing names
  const nameCapture = /(?:named|called|name)\s+([a-zA-Z0-9_\-\.\/]+)/;
  const renameCapture = /(?:rename|change)\s+([a-zA-Z0-9_\-\.\/]+)\s+(?:to|as)\s+([a-zA-Z0-9_\-\.\/]+)/;

  // 1. File Creation
  if (lower.includes('create file') || lower.includes('new file')) {
    const match = lower.match(nameCapture);
    return {
      type: 'CREATE_FILE',
      payload: { path: match ? match[1] : 'untitled.ts' },
      originalText: transcript
    };
  }

  // 2. Folder Creation
  if (lower.includes('create folder') || lower.includes('new folder') || lower.includes('make directory')) {
    const match = lower.match(nameCapture);
    return {
      type: 'CREATE_FOLDER',
      payload: { path: match ? match[1] : 'NewFolder' },
      originalText: transcript
    };
  }

  // 3. Deletion (File or Folder)
  if (lower.includes('delete') || lower.includes('remove')) {
    const match = lower.match(/(?:delete|remove)\s+(?:file|folder|directory)?\s*([a-zA-Z0-9_\-\.\/]+)/);
    const isFolder = lower.includes('folder') || lower.includes('directory');
    return {
      type: isFolder ? 'DELETE_FOLDER' : 'DELETE_FILE',
      payload: { path: match ? match[1] : null },
      originalText: transcript
    };
  }

  // 4. Renaming
  // Example: "Rename utils.ts to helpers.ts"
  if (lower.includes('rename')) {
    const match = lower.match(renameCapture);
    if (match) {
      return {
        type: 'RENAME_FILE', // Generic type, backend can distinguish dir/file
        payload: { oldPath: match[1], newPath: match[2] },
        originalText: transcript
      };
    }
  }

  // 5. Code Execution
  if (lower.includes('run code') || lower.includes('execute')) {
    return { type: 'RUN_CODE', payload: {}, originalText: transcript };
  }

  // 6. Refactoring
  if (lower.includes('refactor') || lower.includes('fix this')) {
    return {
      type: 'REFACTOR',
      payload: { instruction: transcript },
      originalText: transcript
    };
  }

  return { type: 'UNKNOWN', payload: {}, originalText: transcript };
};