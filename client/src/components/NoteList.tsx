'use client';

import React from 'react';
import { Note } from '../types/index';

interface NoteListProps {
  notes: Note[];
  onDelete?: (noteId: string) => void;
  onEdit?: (note: Note) => void;
}

export const NoteList: React.FC<NoteListProps> = ({ notes, onDelete, onEdit }) => {
  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>📝 Henüz not yok</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition"
        >
          {note.pageNumber && (
            <p className="text-xs text-slate-400 mb-2">Sayfa {note.pageNumber}</p>
          )}

          {(note as any).highlight && (
            <blockquote className="border-l-4 border-blue-500 pl-3 mb-2 italic text-slate-300">
              "{(note as any).highlight}"
            </blockquote>
          )}

          <p className="text-slate-100 mb-2">{note.content}</p>

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              {new Date(note.createdAt).toLocaleDateString('tr-TR')}
            </span>
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(note)}
                  className="px-3 py-1 rounded text-xs bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white transition"
                >
                  Düzenle
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(note.id)}
                  className="px-3 py-1 rounded text-xs bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white transition"
                >
                  Sil
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
