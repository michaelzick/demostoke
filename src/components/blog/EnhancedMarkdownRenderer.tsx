import React from 'react';
import { parseMarkdownLinks, isExternalLink } from '@/utils/markdownLinkParser';
import { ExternalLink } from 'lucide-react';

interface EnhancedMarkdownRendererProps {
  text: string;
  className?: string;
}

const EnhancedMarkdownRenderer: React.FC<EnhancedMarkdownRendererProps> = ({ text, className = "" }) => {
  const renderMarkdownContent = (content: string) => {
    // Split content into paragraphs first
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, paragraphIndex) => {
      // Check if this paragraph is a header (starts with **)
      const headerMatch = paragraph.match(/^\*\*([^*]+)\*\*(.*)$/);
      if (headerMatch) {
        const headerText = headerMatch[1].trim();
        const remainingText = headerMatch[2].trim();
        
        return (
          <div key={paragraphIndex} className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-foreground">{headerText}</h3>
            {remainingText && (
              <div className="space-y-2">
                {renderTextWithFormatting(remainingText)}
              </div>
            )}
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <div key={paragraphIndex} className="mb-4">
          {renderTextWithFormatting(paragraph)}
        </div>
      );
    });
  };

  const renderTextWithFormatting = (text: string) => {
    // Split by line breaks to handle individual lines
    const lines = text.split('\n').filter(line => line.trim());
    
    return lines.map((line, lineIndex) => (
      <p key={lineIndex} className="mb-2 last:mb-0">
        {renderFormattedLine(line)}
      </p>
    ));
  };

  const renderFormattedLine = (line: string) => {
    // Parse markdown links first
    const linkParts = parseMarkdownLinks(line);
    
    return linkParts.map((part, index) => {
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
            {renderBoldItalic(part.content)}
            {external && <ExternalLink className="h-3 w-3" />}
          </a>
        );
      }
      
      return <span key={index}>{renderBoldItalic(part.content)}</span>;
    });
  };

  const renderBoldItalic = (text: string) => {
    // Handle **bold** and *italic* formatting
    const parts = [];
    let currentIndex = 0;
    
    // Regex to match **bold** and *italic* (but not ***bold italic***)
    const formatRegex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let match;
    
    while ((match = formatRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.slice(currentIndex, match.index));
      }
      
      const matchedText = match[1];
      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        // Bold text
        const boldContent = matchedText.slice(2, -2);
        parts.push(<strong key={`bold-${match.index}`} className="font-semibold">{boldContent}</strong>);
      } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
        // Italic text
        const italicContent = matchedText.slice(1, -1);
        parts.push(<em key={`italic-${match.index}`} className="italic">{italicContent}</em>);
      }
      
      currentIndex = match.index + matchedText.length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {renderMarkdownContent(text)}
    </div>
  );
};

export default EnhancedMarkdownRenderer;