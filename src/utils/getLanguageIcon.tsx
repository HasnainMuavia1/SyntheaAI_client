import { SiPython, SiJavascript, SiTypescript, SiCplusplus, SiHtml5, SiCss } from 'react-icons/si';
import { VscJson, VscMarkdown, VscTerminalCmd } from 'react-icons/vsc';
import { FileCode, FileText } from 'lucide-react';
import React from 'react';

export const getLanguageIcon = (name: string, size = 16) => {
    if (!name) return <FileText size={size} className="text-[#cccccc]" />;
    const ext = name.split('.').pop()?.toLowerCase();

    switch (ext) {
        case 'ts':
        case 'tsx':
            return <SiTypescript size={size} color="#3178C6" />;
        case 'js':
        case 'jsx':
            return <SiJavascript size={size} color="#F7DF1E" />;
        case 'py':
            return <SiPython size={size} color="#3776AB" />;
        case 'cpp':
        case 'c':
        case 'h':
        case 'hpp':
            return <SiCplusplus size={size} color="#00599C" />;
        case 'html':
            return <SiHtml5 size={size} color="#E34F26" />;
        case 'css':
            return <SiCss size={size} color="#1572B6" />;
        case 'json':
            return <VscJson size={size} color="#FBC02D" />;
        case 'md':
            return <VscMarkdown size={size} color="#cccccc" />;
        case 'sh':
        case 'bash':
            return <VscTerminalCmd size={size} color="#4EAA25" />;
        default:
            return <FileCode size={size} className="text-[#cccccc]" />;
    }
};
