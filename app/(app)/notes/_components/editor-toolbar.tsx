"use client";

import type { Editor } from "@tiptap/react";

type EditorToolbarProps = {
  editor: Editor | null;
};

const btnBase =
  "px-2 py-1 rounded text-sm font-medium transition-colors cursor-pointer";
const active = "bg-zinc-600 text-white";
const inactive = "text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200";
const divider = "w-px bg-zinc-600 self-stretch";

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const btn = (label: string, isActive: boolean, onClick: () => void) => (
    <button
      type="button"
      className={`${btnBase} ${isActive ? active : inactive}`}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-1 border-b border-zinc-700 px-2 py-1">
      {btn("B", editor.isActive("bold"), () =>
        editor.chain().focus().toggleBold().run(),
      )}
      {btn("I", editor.isActive("italic"), () =>
        editor.chain().focus().toggleItalic().run(),
      )}

      <div className={divider} />

      {btn("H1", editor.isActive("heading", { level: 1 }), () =>
        editor.chain().focus().toggleHeading({ level: 1 }).run(),
      )}
      {btn("H2", editor.isActive("heading", { level: 2 }), () =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
      )}
      {btn("H3", editor.isActive("heading", { level: 3 }), () =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
      )}
      {btn("P", editor.isActive("paragraph"), () =>
        editor.chain().focus().setParagraph().run(),
      )}

      <div className={divider} />

      {btn("List", editor.isActive("bulletList"), () =>
        editor.chain().focus().toggleBulletList().run(),
      )}

      <div className={divider} />

      {btn("Code", editor.isActive("code"), () =>
        editor.chain().focus().toggleCode().run(),
      )}
      {btn("Block", editor.isActive("codeBlock"), () =>
        editor.chain().focus().toggleCodeBlock().run(),
      )}

      <div className={divider} />

      {btn("HR", false, () =>
        editor.chain().focus().setHorizontalRule().run(),
      )}
    </div>
  );
}
