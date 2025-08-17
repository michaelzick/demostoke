import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';

interface EnhancedMarkdownRendererProps {
  text: string;
  className?: string;
}

const EnhancedMarkdownRenderer: React.FC<EnhancedMarkdownRendererProps> = ({ text, className = "" }) => {
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
          // Ensure headings have proper styling
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold mb-4 text-foreground" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-semibold mb-3 text-foreground" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-semibold mb-3 text-foreground" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-lg font-semibold mb-2 text-foreground" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-base font-semibold mb-2 text-foreground" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-sm font-semibold mb-2 text-foreground" {...props}>
              {children}
            </h6>
          ),
          // Ensure paragraphs have proper spacing
          p: ({ children, ...props }) => (
            <p className="mb-4 text-foreground leading-relaxed" {...props}>
              {children}
            </p>
          ),
          // Style blockquotes with muted text
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-primary/20 pl-4 my-4 text-muted-foreground italic" {...props}>
              {children}
            </blockquote>
          ),
          // Style unordered lists with muted text
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside mb-4 text-muted-foreground space-y-1" {...props}>
              {children}
            </ul>
          ),
          // Style ordered lists with muted text
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside mb-4 text-muted-foreground space-y-1" {...props}>
              {children}
            </ol>
          ),
          // Style list items
          li: ({ children, ...props }) => (
            <li className="text-muted-foreground" {...props}>
              {children}
            </li>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default EnhancedMarkdownRenderer;
