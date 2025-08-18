import React from 'react';
import { detectContentFormat } from '@/utils/contentFormatDetection';
import SafeHtmlRenderer from './SafeHtmlRenderer';
import EnhancedMarkdownRenderer from './EnhancedMarkdownRenderer';

interface ContentRendererProps {
  content: string;
  className?: string;
  textColor?: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content, className = "", textColor = "text-foreground" }) => {
  const htmlBlockMatch = content.match(/^```html\s*([\s\S]*?)\s*```$/i);
  if (htmlBlockMatch) {
    return <SafeHtmlRenderer html={htmlBlockMatch[1].trim()} className={className} textColor={textColor} />;
  }

  const format = detectContentFormat(content);

  switch (format) {
    case 'html': {
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const htmlContent = bodyMatch ? bodyMatch[1].trim() : content;
      return <SafeHtmlRenderer html={htmlContent} className={className} textColor={textColor} />;
    }
    case 'markdown':
      return <EnhancedMarkdownRenderer text={content} className={className} textColor={textColor} />;
    case 'plain':
    default:
      // For plain text, preserve line breaks and basic formatting with custom text color
      return (
        <div className={`prose prose-lg max-w-none ${className}`}>
          {content.split('\n\n').map((paragraph, index) => (
            <p key={index} className={`mb-4 ${textColor} leading-relaxed`}>
              {paragraph.split('\n').map((line, lineIndex) => (
                <span key={lineIndex} className={textColor}>
                  {line}
                  {lineIndex < paragraph.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
          ))}
        </div>
      );
  }
};

export default ContentRenderer;
