"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type NoteEditorProps = {
  hiddenInputRef: React.RefObject<HTMLInputElement | null>;
};

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [] });

export default function NoteEditor({ hiddenInputRef }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    content: { type: "doc", content: [] },
    editorProps: {
      attributes: {
        class: "tiptap outline-none min-h-[200px] p-3",
      },
    },
    onUpdate({ editor }) {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = JSON.stringify(editor.getJSON());
      }
    },
    immediatelyRender: false,
  });

  return (
    <div className="rounded-md bg-zinc-800 border border-zinc-700 focus-within:ring-2 focus-within:ring-blue-500">
      <EditorContent editor={editor} />
    </div>
  );
}
