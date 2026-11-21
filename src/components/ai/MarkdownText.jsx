import React from "react";

const renderInline = (text, keyPrefix = "inl") => {
  if (!text) return null;

  // Match **bold**, *italic*, or `code`
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    const key = `${keyPrefix}-${idx}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={key}
          className="px-1 py-0 rounded bg-secondary bg-opacity-10 text-dark"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
};

export default function MarkdownText({ content }) {
  if (!content) return null;

  const lines = String(content).split(/\r?\n/);
  const blocks = [];
  let currentList = null;

  const flushList = () => {
    if (currentList) {
      const ListTag = currentList.ordered ? "ol" : "ul";
      blocks.push(
        <ListTag
          key={`list-${blocks.length}`}
          className="mb-2 ps-3"
          style={{ fontSize: "0.92rem" }}
        >
          {currentList.items.map((item, i) => (
            <li key={i} className="mb-1">
              {renderInline(item, `li-${blocks.length}-${i}`)}
            </li>
          ))}
        </ListTag>
      );
      currentList = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    const unorderedMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    const orderedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);

    if (unorderedMatch) {
      if (!currentList || currentList.ordered) {
        flushList();
        currentList = { ordered: false, items: [] };
      }
      currentList.items.push(unorderedMatch[1]);
    } else if (orderedMatch) {
      if (!currentList || !currentList.ordered) {
        flushList();
        currentList = { ordered: true, items: [] };
      }
      currentList.items.push(orderedMatch[1]);
    } else {
      flushList();
      blocks.push(
        <p key={`p-${index}`} className="mb-2 last-mb-0">
          {renderInline(line, `p-${index}`)}
        </p>
      );
    }
  });

  flushList();

  return <div className="ai-markdown-content">{blocks}</div>;
}
