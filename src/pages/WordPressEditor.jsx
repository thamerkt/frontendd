import React, { useCallback, forwardRef, useImperativeHandle, useState, useEffect } from 'react';
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
  FaCode,
} from 'react-icons/fa';
import { BiTable } from 'react-icons/bi';

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: '100%',
        renderHTML: attributes => ({
          style: `width: ${attributes.width}`,
        }),
      },
      height: {
        default: 'auto',
      },
      'data-id': {
        default: null,
      },
      'data-file': {
        default: null,
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const container = document.createElement('div');
      container.className = 'relative inline-block max-w-full my-2 group';

      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'relative inline-block';
      imgWrapper.style.width = node.attrs.width || '100%';

      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.title = node.attrs.title || '';
      img.className = 'block max-w-full h-auto';
      img.style.width = '100%';
      img.setAttribute('data-id', node.attrs['data-id'] || '');
      img.setAttribute('data-file', node.attrs['data-file'] || '');

      // Resize handle
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-full';

      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10';
      deleteButton.innerHTML = `
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
      `;
      deleteButton.onclick = (e) => {
        e.stopPropagation();
        const pos = getPos();
        editor.commands.deleteRange({ from: pos, to: pos + 1 });
        if (this.options.onImageDelete) {
          this.options.onImageDelete(node.attrs['data-id'], node.attrs.src);
        }
      };

      // Resize functionality
      let isResizing = false;
      let startX, startWidth;

      const startResize = (e) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startWidth = parseInt(imgWrapper.style.width, 10);
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
      };

      const handleResize = (e) => {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const newWidth = startWidth + dx;
        
        if (newWidth > 50) { // Minimum width
          imgWrapper.style.width = `${newWidth}px`;
        }
      };

      const stopResize = () => {
        isResizing = false;
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
        
        const pos = getPos();
        if (pos !== undefined) {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              width: imgWrapper.style.width
            })
          );
        }
      };

      resizeHandle.addEventListener('mousedown', startResize);
      
      imgWrapper.appendChild(img);
      imgWrapper.appendChild(resizeHandle);
      container.appendChild(imgWrapper);
      container.appendChild(deleteButton);

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') return false;
          img.src = updatedNode.attrs.src;
          img.alt = updatedNode.attrs.alt || '';
          img.title = updatedNode.attrs.title || '';
          imgWrapper.style.width = updatedNode.attrs.width || '100%';
          return true;
        }
      };
    };
  }
});

const MyEditor = forwardRef(({ content, onChange, onImageUpload, onImageDelete }, ref) => {
  const [uploadedImages, setUploadedImages] = useState([]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      ResizableImage.configure({
        inline: true,
        allowBase64: true,
        onImageDelete: onImageDelete,
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

  useEffect(() => {
    if (!editor || !content) return;
    editor.commands.setContent(content);
  }, [content, editor]);

  const handleImageUpload = useCallback(async (event) => {
    if (!editor) return;
  
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image');
      return;
    }
  
    const tempId = Math.random().toString(36).substring(2, 9);
    const tempUrl = URL.createObjectURL(file);
  
    // Insert temp image
    editor.chain().focus().setImage({
      src: tempUrl,
      'data-id': tempId,
      alt: file.name,
      title: file.name,
      width: '100%'
    }).run();
  
    try {
      // Upload image
      const uploaded = await onImageUpload(file);
      const filename = uploaded?.filename || file.name;
      const finalUrl = `http://host.docker.internal:8006/equipment_images/${filename}`;
  
      // Replace image node with matching data-id
      const { state, view } = editor;
      const { doc, tr } = state;
      let found = false;
  
      doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs['data-id'] === tempId) {
          const newAttrs = {
            ...node.attrs,
            src: finalUrl,
            'data-src': finalUrl,
          };
          tr.setNodeMarkup(pos, undefined, newAttrs);
          found = true;
          return false;
        }
      });
  
      if (found) {
        view.dispatch(tr);
      }
  
      // Save image to local state
      setUploadedImages(prev => [
        ...prev,
        {
          src: finalUrl,
          file,
          id: tempId,
          alt: file.name,
          title: file.name,
        },
      ]);
  
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image.');
    } finally {
      event.target.value = '';
    }
  }, [editor, onImageUpload]);
  
  const addImage = useCallback(() => {
    if (!editor) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleImageUpload;
    input.click();
  }, [editor, handleImageUpload]);

  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() || '',
    getJSON: () => editor?.getJSON() || null,
    isEmpty: () => editor?.isEmpty || true,
    clearContent: () => editor?.commands.clearContent(),
    setContent: (content) => editor?.commands.setContent(content),
    getUploadedImages: () => uploadedImages.filter(img => img.file),
  }));

  if (!editor) return <div className="border p-4 rounded-md min-h-[200px]">Loading editor...</div>;

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Toolbar */}
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