"use client";
import React, { useRef } from "react";
import Editor, { BeforeMount } from "@monaco-editor/react";
import { emmetHTML, emmetCSS, emmetJSX } from "emmet-monaco-es";
import { useEditorStore } from "@/features/editor/stores/useEditorStore";

interface CodeEditorProps {
  code: string;
  language?: string;
  onChange: (value: string | undefined) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, language = "python", onChange }) => {
  const { editorTheme } = useEditorStore();

  const handleBeforeMount: BeforeMount = (monaco) => {
    // Current Default
    monaco.editor.defineTheme('synthea-default', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.lineHighlightBackground': '#111111',
        'editorGutter.background': '#0a0a0a',
        'editorLineNumber.foreground': '#3f3f46',
        'editorLineNumber.activeForeground': '#71717a',
        'editorCursor.foreground': '#ffffff',
        'editor.selectionBackground': '#27272a',
        'scrollbar.shadow': '#0a0a0a',
        'editor.inactiveSelectionBackground': '#1f1f1f',
        'minimap.background': '#0a0a0a',
        'editorWidget.background': '#111111',
        'editorWidget.border': '#27272a',
        'input.background': '#111111',
        'input.border': '#27272a',
      }
    });

    // Monaco Red
    monaco.editor.defineTheme('monaco-red', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1a0505',
        'editor.lineHighlightBackground': '#2a0808',
        'editorGutter.background': '#1a0505',
      }
    });

    // Monaco Purple
    monaco.editor.defineTheme('monaco-purple', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#13051a',
        'editor.lineHighlightBackground': '#1f082a',
        'editorGutter.background': '#13051a',
      }
    });

    // Monaco Green
    monaco.editor.defineTheme('monaco-green', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#051a0a',
        'editor.lineHighlightBackground': '#082a10',
        'editorGutter.background': '#051a0a',
      }
    });

    // Monaco Bluish
    monaco.editor.defineTheme('monaco-bluish', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#05101a',
        'editor.lineHighlightBackground': '#081a2a',
        'editorGutter.background': '#05101a',
      }
    });

    // Greenhacker (Matrix)
    monaco.editor.defineTheme('greenhacker', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: '00ff00' },
        { token: 'keyword', foreground: '00ff00', fontStyle: 'bold' },
        { token: 'string', foreground: '00cc00' },
        { token: 'number', foreground: '00cc00' },
        { token: 'comment', foreground: '005500', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#000000',
        'editor.foreground': '#00ff00',
        'editor.lineHighlightBackground': '#002200',
        'editorGutter.background': '#000000',
        'editorLineNumber.foreground': '#005500',
        'editorLineNumber.activeForeground': '#00ff00',
        'editorCursor.foreground': '#00ff00',
        'editor.selectionBackground': '#004400',
      }
    });


    // Initialize emmet-monaco-es for dynamic Emmet snippet expansion
    emmetHTML(monaco);
    emmetCSS(monaco);
    emmetJSX(monaco);

    // Force Monaco to instantly show completion list when typing '!' in HTML files
    monaco.languages.registerCompletionItemProvider('html', {
      triggerCharacters: ['!'],
      provideCompletionItems: () => {
        return { suggestions: [] };
      }
    });

    // Some minor tweaks to ensure editor treats `!` as a trigger
    monaco.languages.setLanguageConfiguration('html', {
      wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g
    });

    // JavaScript / TypeScript Snippets
    ['javascript', 'typescript'].forEach(lang => {
      monaco.languages.registerCompletionItemProvider(lang, {
        provideCompletionItems: (model: any, position: any) => {
          return {
            suggestions: [
              {
                label: 'clg',
                kind: monaco.languages.CompletionItemKind.Snippet,
                documentation: 'Console Log',
                insertText: 'console.log(${1:variable});',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              },
              {
                label: 'fn',
                kind: monaco.languages.CompletionItemKind.Snippet,
                documentation: 'Arrow Function',
                insertText: 'const ${1:name} = (${2:args}) => {\n  ${3}\n};',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              },
              {
                label: 'for',
                kind: monaco.languages.CompletionItemKind.Snippet,
                documentation: 'For Loop',
                insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n  ${3}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              }
            ]
          };
        }
      });
    });

    // Python Snippets
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model: any, position: any) => {
        return {
          suggestions: [
            {
              label: 'def',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Function Definition',
              insertText: 'def ${1:function_name}(${2:args}):\n    ${3:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            },
            {
              label: 'class',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Class Definition',
              insertText: 'class ${1:ClassName}:\n    def __init__(self, ${2:args}):\n        ${3:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            },
            {
              label: 'main',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Main Guard',
              insertText: 'if __name__ == "__main__":\n    ${1:main()}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            }
          ]
        };
      }
    });

    // C++ Snippets
    monaco.languages.registerCompletionItemProvider('cpp', {
      provideCompletionItems: (model: any, position: any) => {
        return {
          suggestions: [
            {
              label: 'cpp',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'C++ Boilerplate',
              insertText: '#include <iostream>\n\nusing namespace std;\n\nint main() {\n    ${1}\n    return 0;\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            },
            {
              label: 'main',
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: 'Main Function',
              insertText: 'int main() {\n    ${1}\n    return 0;\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            }
          ]
        };
      }
    });
  };

  return (
    <div className="h-full w-full overflow-hidden bg-[#0a0a0a]">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={code}
        theme={editorTheme}
        beforeMount={handleBeforeMount}
        onChange={onChange}
        options={{
          minimap: {
            enabled: true,
            showSlider: "always"
          },
          fontSize: 13,
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontLigatures: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          lineHeight: 22,
          padding: { top: 12 },
          renderLineHighlight: 'gutter',
          unicodeHighlight: {
            ambiguousCharacters: false,
            invisibleCharacters: false,
          },
          scrollbar: {
            verticalScrollbarSize: 4,
            horizontalScrollbarSize: 4,
          },
        }}
      />
    </div>
  );
};

export default CodeEditor;
