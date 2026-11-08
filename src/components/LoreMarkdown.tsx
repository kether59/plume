import React from "react";

type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; rows: string[][] };

function isTableRow(line: string): boolean {
  return line.includes("|") && line.trim().startsWith("|");
}

function tableCells(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function isTableDivider(line: string): boolean {
  return tableCells(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseMarkdown(content: string): MarkdownBlock[] {
  const lines = content.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }

    if (isTableRow(line) && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const rows = [tableCells(line)];
      index += 2;
      while (index < lines.length && isTableRow(lines[index].trim())) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push({ type: "table", rows });
      continue;
    }

    const listMatch = /^([-*+]|\d+[.)])\s+(.+)$/.exec(line);
    if (listMatch) {
      const ordered = /^\d/.test(listMatch[1]);
      const items: string[] = [];
      while (index < lines.length) {
        const itemMatch = /^([-*+]|\d+[.)])\s+(.+)$/.exec(lines[index].trim());
        if (!itemMatch || /^\d/.test(itemMatch[1]) !== ordered) break;
        items.push(itemMatch[2]);
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() &&
      !/^(#{1,6})\s+/.test(lines[index].trim()) &&
      !/^([-*+]|\d+[.)])\s+/.test(lines[index].trim()) &&
      !(isTableRow(lines[index].trim()) && index + 1 < lines.length && isTableDivider(lines[index + 1]))) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

export function LoreMarkdown({ content, className = "" }: { content: string; className?: string }) {
  const blocks = parseMarkdown(content);
  return (
    <div className={`space-y-2 text-xs leading-relaxed text-slate-300 ${className}`}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const headingClass = "font-semibold text-slate-100";
          if (block.level === 1) return <h3 key={index} className={headingClass}>{block.text}</h3>;
          if (block.level === 2) return <h4 key={index} className={headingClass}>{block.text}</h4>;
          return <h5 key={index} className={headingClass}>{block.text}</h5>;
        }
        if (block.type === "paragraph") return <p key={index}>{block.text}</p>;
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={index} className={block.ordered ? "list-inside list-decimal space-y-1" : "list-inside list-disc space-y-1"}>
              {block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
            </List>
          );
        }

        const [header, ...rows] = block.rows;
        return (
          <div key={index} className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[11px]">
              <thead>
                <tr>{header.map((cell, cellIndex) => <th key={cellIndex} className="border border-slate-700 bg-slate-800 px-2 py-1 font-semibold text-slate-100">{cell}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {header.map((_, cellIndex) => <td key={cellIndex} className="border border-slate-800 px-2 py-1">{row[cellIndex] || ""}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
