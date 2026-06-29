'use client';

import React from 'react';
import { Book } from '../types/index';

interface BookCardProps {
  book: Book;
  onDelete?: (bookId: string) => void;
  onSelect?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onDelete, onSelect }) => {
  return (
    <div
      className="bg-dark-bg-secondary/40 border border-warm-beige/10 rounded-2xl overflow-hidden hover:border-warm-beige/30 transition-all duration-300 group cursor-pointer backdrop-blur-md shadow-lg hover:shadow-warm-beige/5"
      onClick={() => onSelect?.(book)}
    >
      {/* Book Cover */}
      <div className="h-48 bg-gradient-to-br from-dark-bg-secondary to-dark-bg-primary flex items-center justify-center relative overflow-hidden">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="text-center px-4 flex flex-col items-center">
            <div className="w-12 h-16 border-2 border-warm-beige/20 rounded flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-warm-beige/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-[10px] text-warm-beige/40 uppercase tracking-widest font-medium line-clamp-1">{book.title}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white text-xs font-medium">Detayları Gör</span>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-5">
        <h3 className="font-bold text-warm-light line-clamp-1 mb-1 group-hover:text-warm-beige transition-colors">{book.title}</h3>
        <p className="text-xs text-warm-beige/60 mb-4 italic">{book.author}</p>

        {/* Progress Bar */}
        {book.totalPages && book.currentPage !== undefined && (
          <div className="mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-warm-beige/40 uppercase tracking-wider font-semibold">İlerleme</span>
              <span className="text-[10px] text-warm-beige/70 font-bold">
                %{Math.round((book.currentPage / book.totalPages) * 100)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-dark-bg-primary rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-warm-beige/60 to-warm-beige transition-all duration-1000"
                style={{
                  width: `${(book.currentPage / book.totalPages) * 100}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-warm-beige/30 mt-1 text-right">{book.currentPage} / {book.totalPages} sayfa</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(book);
            }}
            className="flex-1 px-4 py-2 rounded-xl bg-dark-bg-primary hover:bg-warm-beige/10 border border-warm-beige/20 text-xs font-bold text-warm-beige transition-all active:scale-95"
          >
            Düzenle
          </button>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(book.id);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-bg-primary hover:bg-red-900/20 border border-warm-beige/10 hover:border-red-900/40 text-warm-beige/40 hover:text-warm-orange transition-all active:scale-95 text-sm"
              aria-label="Sil"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
