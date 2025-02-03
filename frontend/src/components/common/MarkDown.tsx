/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { ReactNode } from 'react';
import ReactMarkdown, { Components, ExtraProps } from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import rangeParser from 'parse-numeric-range';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// Custom Import
import { IconButton } from "@ly_components/common/IconButton";
import { LYCopyIcon } from '@ly_styles/icons';
import { Div, Div_Markdown } from '@ly_components/styles/Div';
import { Typography } from '@ly_components/common//Typography';
import { IconButton_Contrast } from '@ly_components/styles/IconButton';

// Register languages for syntax highlighting
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('json', json);

type Props = Readonly<{
  markdown: string;
}>;

interface MarkdownComponentProps {
  children?: ReactNode;
}

export const MarkDown= ( {markdown}: Props ) => {
  const syntaxTheme = oneDark;

  // Function to handle copying text to the clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  const MarkdownComponents: Components = {
    h1({ children }: MarkdownComponentProps) {
      return <Typography variant="h4" style={{ margin: '16px 0', fontWeight: 'bold' }}>{children}</Typography>;
    },
    h2({ children }: MarkdownComponentProps) {
      return <Typography variant="h5" style={{ margin: '12px 0', fontWeight: 'bold' }}>{children}</Typography>;
    },
    h3({ children }: MarkdownComponentProps) {
      return <Typography variant="h6" style={{ margin: '8px 0', fontWeight: 'bold' }}>{children}</Typography>;
    },
    p({ children }: MarkdownComponentProps) {
      return <Typography variant="body1" style={{ margin: '4px 0', lineHeight: 1.6 }}>{children}</Typography>;
    },
    ul({ children }: MarkdownComponentProps) {
      return <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>{children}</ul>;
    },
    ol({ children }: MarkdownComponentProps) {
      return <ol style={{ paddingLeft: '20px', margin: '4px 0' }}>{children}</ol>;
    },
    li({ children }: MarkdownComponentProps) {
      return <li style={{ marginBottom: '4px', lineHeight: 1.6 }}>{children}</li>;
    },
    a({ href, children }: MarkdownComponentProps & { href?: string }) {
      return (
        <Typography
          component="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#1976d2', // Consistent link color
            textDecoration: 'underline', // Ensure link is visually distinct
            cursor: 'pointer', // Pointer cursor for clarity
            wordBreak: 'break-word', // Prevent long URLs from breaking the layout
          }}
        >
          {children}
        </Typography>
      );
    },
    code: (props: JSX.IntrinsicElements["code"] & ExtraProps) => {
      const {children, className, node, ...rest} = props
      const hasLang = /language-(\w+)/.exec(className || '');
      const hasMeta = node?.data?.meta;

      const applyHighlights = (applyHighlights: number) => {
        if (hasMeta) {
          const RE = /{([\d,-]+)}/;
          const metadata = node.data?.meta?.replace(/\s/g, '');
          const strlineNumbers = RE?.test(metadata as string) ? (RE.exec(metadata as string)?.[1] ?? '') : '0';
          const highlightLines = rangeParser(strlineNumbers);
          return highlightLines.includes(applyHighlights) ? { data: 'highlight' } : {};
        }
        return {};
      };


      return hasLang ? (
        <Div position='relative'>
          <Div_Markdown>
            <Typography variant="body2">
              {hasLang[1].toUpperCase()}
            </Typography>
            <IconButton_Contrast 
              onClick={() => handleCopy(String(children))}
              icon={LYCopyIcon} 
            />
          </Div_Markdown>

          <SyntaxHighlighter
            style={syntaxTheme}
            language={hasLang[1]}
            PreTag="div"
            className="codeStyle"
            showLineNumbers
            wrapLines={hasMeta ? true : false}
            useInlineStyles
            lineProps={applyHighlights}
          >
            {String(children).replace(/\n$/, '')} {/* Preserving the line breaks */}
            </SyntaxHighlighter>
        </Div>
      ) : (
        <code className={className} {...props}>{children}</code>
      );
    },
  };

  return (
    <ReactMarkdown components={MarkdownComponents}>
      {markdown}
    </ReactMarkdown>
  );
}
