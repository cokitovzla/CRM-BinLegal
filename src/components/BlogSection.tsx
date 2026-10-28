import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BINLEGAL_BLOG } from '../data/initialData';
import { BlogPost } from '../types';
import { ArrowUpRight, X, CheckCircle2, UserPlus, BookOpen } from 'lucide-react';

interface BlogSectionProps {
  onOpenAuth?: (mode?: 'login' | 'register' | 'newsletter') => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onOpenAuth }) => {
  const { subscribeNewsletter, currentUser } = useAuth();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('Todos');
  const [blogEmail, setBlogEmail] = useState('');
  const [blogSubscribed, setBlogSubscribed] = useState(false);
  const [blogLoading, setBlogLoading] = useState(false);

  const handleQuickSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogEmail.trim() || !blogEmail.includes('@')) return;
    setBlogLoading(true);
    try {
      await subscribeNewsletter(blogEmail);
      setBlogSubscribed(true);
      setBlogEmail('');
    } catch (e) {
      console.error(e);
    } finally {
      setBlogLoading(false);
    }
  };

  const categories = ['Todos', 'Corporativo', 'Propiedad Intelectual', 'Estrategia'];

  const filteredPosts = filterCategory === 'Todos'
    ? BINLEGAL_BLOG
    : BINLEGAL_BLOG.filter(p => p.category === filterCategory);

  return (
    <section id="blog" className="py-10 sm:py-12 lg:py-14 bg-slate-50/70 border-b border-slate-200 scroll-mt-20 sm:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4 sm:gap-6">
          <div className="w-full max-w-3xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#0071ce] uppercase mb-2 bg-blue-50 px-2.5 py-1 rounded-md">
              <BookOpen className="w-3.5 h-3.5 text-[#0071ce]" />
              <span>Criterio Jurídico & Artículos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-950 tracking-tight mb-1">
              Ideas que protegen
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600">
              Análisis pragmático, guías sin lenguaje inaccesible y lecciones reales para fundadores de PYMES.
            </p>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs shrink-0 overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-[#0071ce] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 hover:border-[#0071ce]/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
            >
              <div>
                {/* Clean unboxed metadata with separators (Anti-pill discipline) */}
                <div className="flex items-center gap-2 text-[11px] text-neutral-500 mb-2 font-mono">
                  <span>{post.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.readTime}</span>
                </div>

                <h3 className="text-base sm:text-lg font-display font-bold text-neutral-950 mb-2 group-hover:text-[#0071ce] transition-colors leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-medium text-neutral-700">
                <span className="text-neutral-500">Por {post.author}</span>
                <div className="flex items-center gap-1 text-neutral-900 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Leer artículo</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Dedicated Newsletter Strip - Alleviated, clear & high-contrast */}
        <div className="mt-8 sm:mt-10 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#0071ce] font-bold bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
                Boletín BinLegal
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">
                Publicaciones Jurídicas & Estratégicas
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-extrabold text-slate-950 tracking-tight">
              Recibe nuestras publicaciones y análisis legales en tu correo
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              Modelos de pactos de socios, novedades del SAPI, reformas laborales y criterios para proteger el flujo de caja de tu empresa. Cero spam, 100% criterio legal aplicable a PYMES.
            </p>
          </div>

          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {blogSubscribed ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Suscrito con éxito! Te notificaremos con cada nuevo dictamen o publicación.</span>
              </div>
            ) : (
              <form onSubmit={handleQuickSubscribe} className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full lg:w-auto">
                <input
                  type="email"
                  required
                  value={blogEmail}
                  onChange={(e) => setBlogEmail(e.target.value)}
                  placeholder="tu@correoempresa.com"
                  className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0B192C] focus:bg-white focus:ring-2 focus:ring-[#0B192C]/10 min-w-[220px] transition-all shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={blogLoading}
                  className="px-5 py-2.5 bg-[#0B192C] hover:bg-[#142d4d] text-white font-bold text-xs sm:text-sm rounded-xl transition-colors whitespace-nowrap shadow-xs hover:shadow-md cursor-pointer active:scale-95"
                >
                  {blogLoading ? 'Suscribiendo...' : 'Suscribirme'}
                </button>
              </form>
            )}

            {!currentUser && onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#0071ce] border border-blue-200 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Crear Cuenta PYME</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Article Reader Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-neutral-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-start justify-between bg-neutral-50/60">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono mb-1.5">
                  <span>{selectedPost.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedPost.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedPost.readTime}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-display font-extrabold text-neutral-950 leading-tight">
                  {selectedPost.title}
                </h3>
                <div className="text-xs text-neutral-500 mt-1">
                  Autor: <span className="font-semibold text-neutral-800">{selectedPost.author}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors shrink-0 ml-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              {selectedPost.content.map((paragraph, idx) => (
                <p key={idx} className="text-neutral-800">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                BinLegal · Ideas que protegen
              </span>
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
