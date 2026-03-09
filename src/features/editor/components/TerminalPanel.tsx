"use client";
import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import "xterm/css/xterm.css";
import { Plus, Trash2 } from "lucide-react";
import { useEditor } from "@/context/EditorContext";

interface TerminalPanelProps {
    onClose?: () => void;
}

export default function TerminalPanel({ onClose }: TerminalPanelProps) {
    const { projectId } = useEditor();
    const [sessionId, setSessionId] = useState(1);
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        let disposed = false;
        let cleanup: (() => void) | undefined;

        const initTerminal = () => {
            if (disposed) return;
            const container = terminalRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            if (!rect.width || !rect.height) {
                requestAnimationFrame(initTerminal);
                return;
            }

            const getCssVar = (name: string, fallback: string) => {
                const val = getComputedStyle(document.body).getPropertyValue(name).trim();
                return val || fallback;
            };

            const term = new Terminal({
                theme: {
                    background: getCssVar('--ide-bg-main', '#1e1e1e'),
                    foreground: getCssVar('--ide-text-main', '#cccccc'),
                    cursor: getCssVar('--ide-text-main', '#ffffff'),
                    cursorAccent: getCssVar('--ide-bg-main', '#1e1e1e'),
                    selectionBackground: getCssVar('--ide-bg-active', '#37373d'),
                    black: getCssVar('--ide-bg-main', '#1e1e1e'),
                    brightBlack: "#52525b",
                    white: getCssVar('--ide-text-main', '#cccccc'),
                    brightWhite: "#ffffff",
                    green: "#22c55e",
                    brightGreen: "#4ade80",
                    red: "#ef4444",
                    brightRed: "#f87171",
                    yellow: "#eab308",
                    brightYellow: "#facc15",
                    blue: "#3b82f6",
                    brightBlue: "#60a5fa",
                    cyan: "#06b6d4",
                    brightCyan: "#22d3ee",
                    magenta: "#a855f7",
                    brightMagenta: "#c084fc",
                },
                fontFamily: 'Consolas, Menlo, Monaco, monospace',
                fontSize: 13,
                letterSpacing: 0,
                cursorStyle: 'bar',
                cursorBlink: true,
                allowProposedApi: true,
                scrollback: 2000,
            });

            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);

            try {
                term.open(container);
                fitAddon.fit();
                // Second fit after a tiny delay for robustness
                setTimeout(() => fitAddon.fit(), 50);
            } catch (e) {
                console.error("xterm open/fit failed", e);
                return;
            }

            xtermRef.current = term;
            fitAddonRef.current = fitAddon;

            // Resize observer to handle container resizing
            const resizeObserver = new ResizeObserver(() => {
                if (fitAddonRef.current) {
                    try {
                        fitAddonRef.current.fit();
                    } catch (e) { }
                }
            });
            resizeObserver.observe(container);

            // Connect WebSocket
            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const host = window.location.host;
            const params = new URLSearchParams();
            if (projectId) params.append("projectId", projectId);
            params.append("cols", term.cols.toString());
            params.append("rows", term.rows.toString());

            const wsUrl = `${protocol}//${host.replace(/:.+$/, ":8000")}/ws/terminal/?${params.toString()}`;
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                term.writeln("\x1b[32mSynthea Terminal Connected...\x1b[0m");
            };

            const handleRunCommand = (event: any) => {
                const command = event?.detail?.command as string | undefined;
                if (!command || ws.readyState !== WebSocket.OPEN) return;
                // \x1b = Escape — clears any partial input in standard Windows console
                // Then send the actual command followed by Enter
                ws.send(JSON.stringify({ command: `\x1b${command}\r\n` }));
            };

            const handleKillCommand = () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ command: "\x03" })); // Ctrl+C
                }
            };

            window.addEventListener("synthea-run-command", handleRunCommand);
            window.addEventListener("synthea-terminal-kill", handleKillCommand);

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.output) {
                        term.write(data.output);
                        term.scrollToBottom();
                    } else if (data.error) {
                        term.writeln(`\r\n\x1b[31mError: ${data.error}\x1b[0m`);
                        term.scrollToBottom();
                    }
                } catch (e) {
                    term.write(event.data);
                    term.scrollToBottom();
                }
            };

            term.onData((data) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ command: data }));
                }
            });

            term.onResize((size) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ resize: { cols: size.cols, rows: size.rows } }));
                }
            });

            const updateTerminalTheme = () => {
                const bg = getCssVar('--ide-bg-main', '#1e1e1e');
                const fg = getCssVar('--ide-text-main', '#cccccc');
                const sel = getCssVar('--ide-bg-active', '#37373d');

                term.options.theme = {
                    ...term.options.theme,
                    background: bg,
                    foreground: fg,
                    cursor: fg,
                    cursorAccent: bg,
                    selectionBackground: sel,
                    black: bg,
                    white: fg
                };
            };

            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.attributeName === 'data-theme') {
                        updateTerminalTheme();
                    }
                }
            });
            observer.observe(document.body, { attributes: true });

            cleanup = () => {
                window.removeEventListener("synthea-run-command", handleRunCommand);
                window.removeEventListener("synthea-terminal-kill", handleKillCommand);
                resizeObserver.disconnect();
                observer.disconnect();
                ws.close();
                term.dispose();
            };
        };

        requestAnimationFrame(initTerminal);

        return () => {
            disposed = true;
            if (cleanup) cleanup();
        };
    }, [sessionId, projectId]);

    const handleNewSession = () => {
        setSessionId((id) => id + 1);
    };

    const handleKillSession = () => {
        // Closing the WebSocket triggers backend PTY destruction (killing tasks)
        // Calling onClose unmounts the component, triggering the cleanup.
        if (onClose) {
            onClose();
        } else {
            // Fallback if no props passed
            const ws = wsRef.current;
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
            if (xtermRef.current) {
                xtermRef.current.writeln("\r\n\x1b[31m[Process terminated]\x1b[0m");
            }
        }
    };

    return (
        <div className="h-full w-full bg-[var(--ide-bg-main)] flex flex-col border-t border-[var(--ide-border)]">
            {/* Terminal Header */}
            <div className="h-[32px] flex items-center justify-between px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--ide-text-muted)] border-b border-[var(--ide-border)] bg-[var(--ide-bg-main)] select-none">
                <span className="text-[var(--ide-text-main)] border-b-2 border-[var(--ide-text-main)] h-full flex items-center">Terminal</span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={handleNewSession}
                        className="p-1 rounded hover:bg-[var(--ide-bg-active)] hover:text-[var(--ide-text-main)] transition-colors"
                        title="New terminal"
                    >
                        <Plus size={12} />
                    </button>
                    <button
                        type="button"
                        onClick={handleKillSession}
                        className="p-1 rounded hover:bg-[var(--ide-bg-active)] hover:text-red-400 transition-colors"
                        title="Kill terminal"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
            <div className="flex-1 w-full pl-3 pt-1 pr-1 overflow-hidden bg-[var(--ide-bg-main)]" ref={terminalRef} />
        </div>
    );
}
