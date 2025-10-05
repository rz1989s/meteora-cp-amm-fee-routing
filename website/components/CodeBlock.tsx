'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  title?: string;
  githubLink?: string;
}

export default function CodeBlock({
  code,
  language = 'rust',
  showLineNumbers = true,
  title,
  githubLink,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
      {title && (
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">{title}</span>
          <div className="flex items-center space-x-2">
            {githubLink && (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-sm"
                title="View on GitHub"
              >
                <ExternalLink size={14} />
                <span>GitHub</span>
              </a>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-sm"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-success" />
                  <span className="text-success">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {!title && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors z-10"
        >
          {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
        </button>
      )}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
          }}
          lineNumberStyle={{
            minWidth: '2.5rem',
            paddingRight: '1rem',
            color: '#64748b',
            userSelect: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
