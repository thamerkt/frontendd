import React, { useCallback, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaHeading,
  FaListUl,
  FaListOl,
  FaTable,
  FaImage,
  FaLink,
  FaUndo,
  FaRedo,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaCode
} from 'react-icons/fa';
import { BiTable } from 'react-icons/bi';

const MyEditor = forwardRef(({ content, onChange }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
        lastColumnResizable: false,
        cellMinWidth: 100,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: content || '<p>Start writing your content here...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    },
  });

  const addImage = useCallback(() => {
    if (!editor) return;
    
    const url = window.prompt('Enter the URL of the image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  // Expose editor methods via ref
  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() || '',
    getJSON: () => editor?.getJSON() || null,
    isEmpty: () => editor?.isEmpty || true,
    clearContent: () => editor?.commands.clearContent(),
    setContent: (content) => editor?.commands.setContent(content),
  }));

  if (!editor) return <div className="border p-4 rounded-md min-h-[200px]">Loading editor...</div>;

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Enhanced Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}
          title="Bold"
        >
          <FaBold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}
          title="Italic"
        >
          <FaItalic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}
          title="Underline"
        >
          <FaUnderline className="w-4 h-4" />
        </button>

        {/* Headings */}
        <div className="relative group">
          <button
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading') ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}
            title="Headings"
          >
            <FaHeading className="w-4 h-4" />
          </button>
          <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`block w-full text-left px-4 py-2 text-sm ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Heading 1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`block w-full text-left px-4 py-2 text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Heading 2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`block w-full text-left px-4 py-2 text-sm ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Heading 3
            </button>
          </div>
        </div>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}
          title="Bullet List"
        >
          <FaListUl className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}
          title="Numbered List"
        >
          <FaListOl className="w-4 h-4" />
        </button>

        {/* Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}
          title="Align Left"
        >
          <FaAlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}
          title="Align Center"
        >
          <FaAlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}
          title="Align Right"
        >
          <FaAlignRight className="w-4 h-4" />
        </button>

        {/* Tables */}
        <div className="relative group">
          <button
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('table') ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}
            title="Table"
          >
            <BiTable className="w-4 h-4" />
          </button>
          <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
            <button
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Insert Table
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              disabled={!editor.can().addColumnAfter()}
              className={`block w-full text-left px-4 py-2 text-sm ${!editor.can().addColumnAfter() ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Add Column
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              disabled={!editor.can().addRowAfter()}
              className={`block w-full text-left px-4 py-2 text-sm ${!editor.can().addRowAfter() ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Add Row
            </button>
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              disabled={!editor.can().deleteTable()}
              className={`block w-full text-left px-4 py-2 text-sm ${!editor.can().deleteTable() ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Delete Table
            </button>
          </div>
        </div>

        {/* Media */}
        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200 text-gray-700"
          title="Insert Image"
        >
          <FaImage className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href;
            const url = window.prompt('URL', previousUrl);
            if (url === null) return;
            if (url === '') {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().setLink({ href: url }).run();
          }}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}
          title="Link"
        >
          <FaLink className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('code') ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}
          title="Code"
        >
          <FaCode className="w-4 h-4" />
        </button>

        {/* History */}
        <div className="flex border-l border-gray-300 pl-2 ml-2">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={`p-2 rounded hover:bg-gray-200 ${!editor.can().undo() ? 'text-gray-400' : 'text-gray-700'}`}
            title="Undo"
          >
            <FaUndo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={`p-2 rounded hover:bg-gray-200 ${!editor.can().redo() ? 'text-gray-400' : 'text-gray-700'}`}
            title="Redo"
          >
            <FaRedo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Format Menu */}
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex bg-white shadow-lg rounded-md border border-gray-200 p-1">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded mx-1 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            >
              <FaBold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded mx-1 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            >
              <FaItalic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded mx-1 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
            >
              <FaUnderline className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('URL', previousUrl);
                if (url === null) return;
                if (url === '') {
                  editor.chain().focus().unsetLink().run();
                  return;
                }
                editor.chain().focus().setLink({ href: url }).run();
              }}
              className={`p-2 rounded mx-1 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
            >
              <FaLink className="w-4 h-4" />
            </button>
          </div>
        </BubbleMenu>
      )}

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[300px] max-h-[500px] overflow-y-auto"
      />
    </div>
  );
});

export default MyEditor;