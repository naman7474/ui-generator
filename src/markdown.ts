const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const formatInline = (value: string): string => {
  let result = escapeHtml(value);
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/_(.+?)_/g, '<em>$1</em>');
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  return result;
};

export const markdownToHtml = (markdown: string): string => {
  const lines = markdown.replace(/\r/g, '').split('\n');
  let html = '';
  let inUnorderedList = false;
  let inOrderedList = false;
  let inCodeBlock = false;

  const closeLists = () => {
    if (inUnorderedList) {
      html += '</ul>';
      inUnorderedList = false;
    }
    if (inOrderedList) {
      html += '</ol>';
      inOrderedList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        html += '</code></pre>';
        inCodeBlock = false;
      } else {
        closeLists();
        inCodeBlock = true;
        html += '<pre><code>';
      }
      continue;
    }

    if (inCodeBlock) {
      html += `${escapeHtml(line)}\n`;
      continue;
    }

    if (trimmed.length === 0) {
      closeLists();
      continue;
    }

    const unorderedMatch = line.match(/^\s*[-*]\s+(.*)$/);
    if (unorderedMatch) {
      if (!inUnorderedList) {
        closeLists();
        inUnorderedList = true;
        html += '<ul>';
      }
      html += `<li>${formatInline(unorderedMatch[1])}</li>`;
      continue;
    }

    const orderedMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (!inOrderedList) {
        closeLists();
        inOrderedList = true;
        html += '<ol>';
      }
      html += `<li>${formatInline(orderedMatch[2])}</li>`;
      continue;
    }

    closeLists();

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html += `<h${level}>${formatInline(headingMatch[2])}</h${level}>`;
      continue;
    }

    html += `<p>${formatInline(trimmed)}</p>`;
  }

  closeLists();
  if (inCodeBlock) {
    html += '</code></pre>';
  }

  return html;
};
