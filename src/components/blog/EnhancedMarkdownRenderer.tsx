import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';

interface EnhancedMarkdownRendererProps {
  text: string;
  className?: string;
  textColor?: string;
}

const EnhancedMarkdownRenderer: React.FC<EnhancedMarkdownRendererProps> = ({ text, className = "", textColor = "text-foreground" }) => {
  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom link component to handle external links
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith('http://') || href?.startsWith('https://');

            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                {...props}
              >
                {children}
                {isExternal && <ExternalLink className="h-3 w-3" />}
              </a>
            );
          },
          // Ensure headings use custom text color
          h1: ({ children, ...props }) => (
            <h1 className={`text-3xl font-bold mb-4 ${textColor}`} {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className={`text-2xl font-semibold mb-3 ${textColor}`} {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className={`text-xl font-semibold mb-3 ${textColor}`} {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className={`text-lg font-semibold mb-2 ${textColor}`} {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className={`text-base font-semibold mb-2 ${textColor}`} {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className={`text-sm font-semibold mb-2 ${textColor}`} {...props}>
              {children}
            </h6>
          ),
          // Ensure paragraphs use custom text color
          p: ({ children, ...props }) => (
            <p className={`mb-4 ${textColor} leading-relaxed`} {...props}>
              {children}
            </p>
          ),
          // Style blockquotes with custom text color
          blockquote: ({ children, ...props }) => (
            <blockquote className={`border-l-4 border-primary/20 pl-4 my-4 ${textColor} italic`} {...props}>
              {children}
            </blockquote>
          ),
          // Style unordered lists with custom text color
          ul: ({ children, ...props }) => (
            <ul className={`list-disc list-outside mb-4 ${textColor} space-y-1 pl-6`} {...props}>
              {children}
            </ul>
          ),
          // Style ordered lists with custom text color
          ol: ({ children, ...props }) => (
            <ol className={`list-decimal list-outside mb-4 ${textColor} space-y-1 pl-6`} {...props}>
              {children}
            </ol>
          ),
          // Style list items with custom text color
          li: ({ children, ...props }) => (
            <li className={textColor} {...props}>
              {children}
            </li>
          ),
          // Style strong/bold text with custom color
          strong: ({ children, ...props }) => (
            <strong className={`font-bold ${textColor}`} {...props}>
              {children}
            </strong>
          ),
          // Style emphasis/italic text with custom color
          em: ({ children, ...props }) => (
            <em className={`italic ${textColor}`} {...props}>
              {children}
            </em>
          ),
          // Style code text with theme-aware colors
          code: ({ children, ...props }) => (
            <code className="bg-muted text-foreground px-1 py-0.5 rounded text-sm" {...props}>
              {children}
            </code>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default EnhancedMarkdownRenderer;
