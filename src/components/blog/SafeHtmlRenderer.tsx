import React, { useMemo } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { fromHtml } from 'hast-util-from-html';
import { sanitize, type Schema } from 'hast-util-sanitize';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';

interface SafeHtmlRendererProps {
  html: string;
  className?: string;
  textColor?: string;
}

// Use the same allowlist in the server renderer and during hydration.
const articleHtmlSchema: Schema = {
  tagNames: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'strong', 'em', 'b', 'i', 'u',
    'ul', 'ol', 'li', 'blockquote', 'a', 'span', 'div',
  ],
  attributes: { '*': ['className'], a: ['href', 'target', 'rel'] },
  protocols: { href: ['http', 'https', 'mailto', 'tel', 'ftp', 'ftps', 'sms', 'callto', 'cid', 'xmpp'] },
  strip: ['script', 'style', 'iframe', 'object', 'embed', 'template', 'svg', 'math'],
};

const SafeHtmlRenderer: React.FC<SafeHtmlRendererProps> = ({ html, className = "", textColor = "text-foreground" }) => {
  const content = useMemo(() => toJsxRuntime(
    sanitize(fromHtml(html, { fragment: true }), articleHtmlSchema),
    { Fragment, jsx, jsxs },
  ), [html]);

  // Convert textColor class to prose modifier format
  const getProseTextClass = (textColor: string) => {
    if (textColor === 'text-muted-foreground') {
      return 'prose-headings:text-muted-foreground prose-p:text-muted-foreground prose-strong:text-muted-foreground prose-em:text-muted-foreground prose-blockquote:text-muted-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:text-muted-foreground prose-code:text-muted-foreground';
    }
    return 'prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-blockquote:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-code:text-foreground';
  };

  return (
    <div
      className={`prose prose-lg dark:prose-invert max-w-none ${getProseTextClass(textColor)} prose-a:text-primary ${className}`}
    >
      {content}
    </div>
  );
};

export default SafeHtmlRenderer;
