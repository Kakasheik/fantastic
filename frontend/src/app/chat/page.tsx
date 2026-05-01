'use client';
import { Plus, Filter, Search } from 'lucide-react';
import { useState } from 'react';

/**
 * /chat — Lista de conversas (estilo Privacy).
 */
export default function ChatPage() {
  const [onlyOnline, setOnlyOnline] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-0 md:px-4 grid md:grid-cols-[360px,1fr] min-h-[calc(100dvh-128px)]">
      {/* Sidebar de conversas */}
      <aside className="border-r border-border bg-surface1 md:rounded-l-2xl">
        <header className="flex items-center justify-between p-4">
          <h1 className="font-semibold text-text">Conversas</h1>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-surface2 rounded-full" aria-label="Nova conversa">
              <Plus className="w-5 h-5 text-text" />
            </button>
            <button className="p-2 hover:bg-surface2 rounded-full" aria-label="Filtros">
              <Filter className="w-5 h-5 text-text" />
            </button>
          </div>
        </header>

        <div className="px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="search"
              placeholder="Pesquisar usuários"
              className="w-full pl-9 pr-3 h-10 rounded-full bg-surface2 border border-border text-sm placeholder:text-muted focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="px-4 mt-4 flex items-center justify-between">
          <span className="text-sm text-text">Exibir apenas usuários online</span>
          <button
            onClick={() => setOnlyOnline((v) => !v)}
            className={`w-10 h-6 rounded-full transition-colors ${onlyOnline ? 'bg-brand' : 'bg-border'} relative`}
            aria-pressed={onlyOnline}
            aria-label="Alternar usuários online"
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                onlyOnline ? 'translate-x-[18px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="mt-12 text-center text-sm italic text-muted px-4">
          Sem conversas
        </div>
      </aside>

      {/* Área central */}
      <section className="hidden md:flex items-center justify-center text-muted">
        Selecione uma conversa para começar
      </section>
    </div>
  );
}
