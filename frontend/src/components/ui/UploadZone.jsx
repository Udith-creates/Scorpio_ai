import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function UploadZone({ id, accept, emoji, placeholder, onFileChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const shouldReduce = useReducedMotion();

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    onFileChange?.(file);
    /* Sync to hidden input via DataTransfer */
    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) inputRef.current.files = dt.files;
  };

  return (
    <motion.div
      className={`upload-zone p-8 text-center cursor-pointer select-none ${dragging ? 'drag-over' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
      whileHover={shouldReduce ? {} : { scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <div className="text-4xl mb-2 select-none">{emoji}</div>
      <div className="text-sm text-slate-400">
        {fileName ?? placeholder}
      </div>
      {!fileName && (
        <div className="text-xs text-slate-600 mt-1">{accept}</div>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </motion.div>
  );
}
