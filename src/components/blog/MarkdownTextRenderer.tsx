
import React from 'react';
import { parseMarkdownLinks, isExternalLink } from '@/utils/markdownLinkParser';
import { ExternalLink } from 'lucide-react';

interface MarkdownTextRendererProps {
  text: string;
  className?: string;
}

const MarkdownTextRenderer: React.FC<MarkdownTextRendererProps> = ({ text, className = "" }) => {
  const parts = parseMarkdownLinks(text);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'link' && part.url) {
          const external = isExternalLink(part.url);
          
          return (
            <a
              key={index}
              href={part.url}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
            >
              {part.content}
              {external && <ExternalLink className="h-3 w-3" />}
            </a>
          );
        }
        
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
};

export default MarkdownTextRenderer;
