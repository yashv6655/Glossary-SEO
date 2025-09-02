'use client'

import { useState } from 'react'
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react'

interface TreeNode {
  name: string
  path: string
  type: 'dir' | 'file'
  children?: TreeNode[]
}

interface TreeViewProps {
  data: TreeNode[]
  onSelect: (path: string) => void
  selectedPath: string | null
}

function Node({ node, onSelect, selectedPath }: { node: TreeNode, onSelect: (path: string) => void, selectedPath: string | null }) {
  const [isOpen, setIsOpen] = useState(false)

  const isSelected = selectedPath === node.path

  if (node.type === 'dir') {
    return (
      <div className="ml-4">
        <div 
          className={`flex items-center space-x-2 p-1 rounded-md cursor-pointer ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          onClick={() => onSelect(node.path)}
        >
          {isOpen ? <ChevronDown size={16} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} /> : <ChevronRight size={16} onClick={(e) => { e.stopPropagation(); setIsOpen(true); }} />}
          <Folder size={16} />
          <span>{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div className="ml-4 border-l pl-2">
            {node.children.map(child => <Node key={child.path} node={child} onSelect={onSelect} selectedPath={selectedPath} />)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="ml-4 flex items-center space-x-2 p-1">
      <FileText size={16} />
      <span>{node.name}</span>
    </div>
  )
}

export function TreeView({ data, onSelect, selectedPath }: TreeViewProps) {
  return (
    <div>
      {data.map(node => <Node key={node.path} node={node} onSelect={onSelect} selectedPath={selectedPath} />)}
    </div>
  )
}
