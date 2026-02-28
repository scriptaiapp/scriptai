"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Markdown } from 'tiptap-markdown'
import { Button } from "@/components/ui/button"
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Minus, Undo, Redo, Copy, Check,
  AlignLeft, WrapText,
} from "lucide-react"
import { useCallback, useEffect } from 'react'

interface ScriptContentEditorProps {
  title: string
  setTitle: (v: string) => void
  content: string
  setContent: (v: string) => void
  onCopyTitle?: () => void
  onCopyScript?: () => void
  copiedTitle?: boolean
  copiedScript?: boolean
}


function ToolbarButton({
  active = false,
  disabled = false,
  onClick,
  children,
  title,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      className={`
        h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150
        disabled:opacity-30 disabled:cursor-not-allowed
        ${active
          ? 'bg-[#347AF9]/15 text-[#347AF9] shadow-sm'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-300'
        }
      `}
      onMouseDown={(e) => {
        e.preventDefault() // Prevents editor from losing focus
        onClick()
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />
}

const MenuBar = ({ editor }: { editor: ReturnType<typeof useEditor> | null }) => {
  if (!editor) return null

  return (

    <div className="sticky top-4 z-50 flex items-center gap-0.5 p-1.5 mb-6 bg-white/95 dark:bg-[#0E1338]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl flex-wrap shadow-md">

      <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List">
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline Code">
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
        <Minus className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHardBreak().run()} title="Line Break">
        <WrapText className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Shift+Z)">
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </div>
  )
}


export function ScriptContentEditor({
  title,
  setTitle,
  content,
  setContent,
  onCopyTitle,
  onCopyScript,
  copiedTitle = false,
  copiedScript = false,
}: ScriptContentEditorProps) {

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Markdown,
      Placeholder.configure({
        placeholder: 'Start writing your viral script here...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const markdown = (editor.storage as any).markdown.getMarkdown()
      setContent(markdown)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[400px] leading-relaxed text-slate-800 dark:text-slate-200 selection:bg-[#347AF9]/30 selection:text-[#347AF9]',
      },
    },
  })

  useEffect(() => {
    if (editor && content && !editor.isFocused) {
      const currentMarkdown = (editor.storage as any)?.markdown?.getMarkdown?.() ?? ''
      if (currentMarkdown !== content) {
        editor.commands.setContent(content)
      }
    }
  }, [content, editor])

  const wordCount = useCallback(() => {
    if (!editor) return 0
    const text = editor.getText()
    return text.split(/\s+/).filter(Boolean).length
  }, [editor])

  const charCount = useCallback(() => {
    if (!editor) return 0
    return editor.getText().length
  }, [editor])

  return (
    <div className="relative w-full h-full flex flex-col">

      <div className="flex flex-col-reverse md:flex-row md:items-start justify-between gap-4 mb-6">

        <div className="flex-1 w-full min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Script..."
            className="w-full min-w-0 text-3xl sm:text-4xl font-black text-slate-900 dark:text-white bg-transparent border-none outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-0 p-0"
          />
        </div>

        {/* Copy Actions */}
        <div className="flex items-center gap-2 shrink-0 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm p-1.5 rounded-xl self-end md:self-auto">
          {onCopyTitle && (
            <Button variant="ghost" size="sm" className="h-8 px-3 text-slate-500 hover:text-[#347AF9] hover:bg-[#347AF9]/10 rounded-lg text-xs font-semibold" onClick={onCopyTitle}>
              {copiedTitle ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
              <span className="hidden sm:inline">Title</span>
            </Button>
          )}
          {onCopyScript && (
            <Button variant="ghost" size="sm" className="h-8 px-3 text-slate-500 hover:text-[#347AF9] hover:bg-[#347AF9]/10 rounded-lg text-xs font-semibold" onClick={onCopyScript}>
              {copiedScript ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
              <span className="hidden sm:inline">Script</span>
            </Button>
          )}
        </div>

      </div>

      {/* The Formatting Toolbar */}
      <MenuBar editor={editor} />

      {/* The Actual Tiptap Editor */}
      <div className="flex-1 cursor-text bg-transparent rounded-xl" onClick={() => editor?.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>

      {/* Word Count Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span>{wordCount()} words</span>
          <span>{charCount()} characters</span>
        </div>
      </div>
    </div>
  )
}