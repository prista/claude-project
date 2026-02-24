import type { ReactNode } from "react";

type TipTapNode = {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string }[];
  attrs?: Record<string, unknown>;
};

export function NoteRenderer({ contentJson }: { contentJson: string }) {
  let doc: TipTapNode;
  try {
    doc = JSON.parse(contentJson);
  } catch {
    return <p className="text-zinc-400">Unable to display content.</p>;
  }

  return (
    <div className="prose prose-invert max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_p]:text-zinc-300 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_li]:mb-1 [&_li]:text-zinc-300 [&_pre]:bg-zinc-800 [&_pre]:rounded-md [&_pre]:p-4 [&_pre]:mb-3 [&_pre]:overflow-x-auto [&_code]:font-mono [&_code]:text-sm [&_hr]:border-zinc-700 [&_hr]:my-6">
      {renderNodes(doc.content)}
    </div>
  );
}

function renderNodes(nodes?: TipTapNode[]): ReactNode {
  if (!nodes) return null;
  return nodes.map((node, i) => renderNode(node, i));
}

function renderNode(node: TipTapNode, key: number): ReactNode {
  switch (node.type) {
    case "paragraph":
      return <p key={key}>{renderNodes(node.content)}</p>;
    case "heading": {
      const level = (node.attrs?.level as number) || 1;
      const Tag = `h${Math.min(level, 3)}` as "h1" | "h2" | "h3";
      return <Tag key={key}>{renderNodes(node.content)}</Tag>;
    }
    case "bulletList":
      return <ul key={key}>{renderNodes(node.content)}</ul>;
    case "orderedList":
      return <ol key={key}>{renderNodes(node.content)}</ol>;
    case "listItem":
      return <li key={key}>{renderNodes(node.content)}</li>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{renderNodes(node.content)}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} />;
    case "text":
      return applyMarks(node.text ?? "", node.marks);
    default:
      return renderNodes(node.content);
  }
}

function applyMarks(text: string, marks?: { type: string }[]): ReactNode {
  if (!marks || marks.length === 0) return text;

  let node: ReactNode = text;
  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        node = <strong>{node}</strong>;
        break;
      case "italic":
        node = <em>{node}</em>;
        break;
      case "code":
        node = <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm">{node}</code>;
        break;
    }
  }
  return node;
}
