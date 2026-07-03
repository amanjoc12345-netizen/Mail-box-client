import React, { useRef, useEffect } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { FiBold, FiItalic, FiUnderline, FiEdit3 } from 'react-icons/fi';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);

  // Sync value changes to the editor's inner HTML (only when it is not in sync)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleCommand = (command, argument = null) => {
    // Focus first
    editorRef.current.focus();
    // Execute rich text formatting
    document.execCommand(command, false, argument);
    // Notify parent component of content change
    onChange(editorRef.current.innerHTML);
  };

  const handleInput = (e) => {
    onChange(e.currentTarget.innerHTML);
  };

  return (
    <div className="wysiwyg-editor-wrapper">
      {/* Rich Text Toolbar */}
      <div className="wysiwyg-editor-toolbar d-flex align-items-center gap-1 p-2 bg-light border-bottom">
        <ButtonGroup size="sm">
          {/* Bold Text */}
          <Button 
            type="button"
            variant="outline-secondary" 
            onClick={() => handleCommand('bold')}
            title="Bold"
            className="border-0 px-2.5 py-1"
          >
            <FiBold size={16} />
          </Button>

          {/* Italic Text */}
          <Button 
            type="button"
            variant="outline-secondary" 
            onClick={() => handleCommand('italic')}
            title="Italic"
            className="border-0 px-2.5 py-1"
          >
            <FiItalic size={16} />
          </Button>

          {/* Underline Text */}
          <Button 
            type="button"
            variant="outline-secondary" 
            onClick={() => handleCommand('underline')}
            title="Underline"
            className="border-0 px-2.5 py-1"
          >
            <FiUnderline size={16} />
          </Button>
        </ButtonGroup>

        <span className="text-secondary mx-1">|</span>

        {/* Text Highlighter */}
        <Button 
          type="button"
          variant="outline-secondary" 
          size="sm"
          onClick={() => handleCommand('hiliteColor', '#fde047')}
          title="Highlight Text (Yellow)"
          className="border-0 px-2 py-1 d-flex align-items-center gap-1"
        >
          <FiEdit3 size={15} />
          <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Highlight</span>
        </Button>

        {/* Clear formatting */}
        <Button 
          type="button"
          variant="outline-secondary" 
          size="sm"
          onClick={() => handleCommand('removeFormat')}
          title="Clear Formatting"
          className="border-0 px-2 py-1 ms-auto"
          style={{ fontSize: '0.8rem' }}
        >
          Clear
        </Button>
      </div>

      {/* Editable Text Area */}
      <div
        ref={editorRef}
        className="wysiwyg-editor-content p-3 text-start"
        contentEditable
        onInput={handleInput}
        style={{ 
          minHeight: '220px', 
          maxHeight: '400px', 
          outline: 'none', 
          overflowY: 'auto' 
        }}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
