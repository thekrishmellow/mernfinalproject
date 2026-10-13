import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownViewer({ content }) {
  if (!content) {
    return (
      <div className="text-slate-400 italic text-sm py-4">No content provided.</div>
    );
  }

  return (
    <div className="prose prose-invert prose-blue max-w-none text-slate-200 text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-white border-b border-slate-800 pb-2 mb-4 mt-6" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-semibold text-white mb-3 mt-5" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-slate-100 mb-2 mt-4" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 text-slate-300 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-slate-300" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-slate-300" {...props} />,
          li: ({ node, ...props }) => <li className="text-slate-300" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 bg-slate-900/60 rounded-r-lg px-4 py-2 my-4 text-slate-300 italic" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className="bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto my-4 text-xs font-mono text-slate-200">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-xs" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th className="bg-slate-800/60 px-3 py-2 text-left font-semibold text-slate-200" {...props} />,
          td: ({ node, ...props }) => <td className="px-3 py-2 border-t border-slate-800 text-slate-300" {...props} />,
          a: ({ node, ...props }) => (
            <a className="text-blue-400 hover:text-blue-300 underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
