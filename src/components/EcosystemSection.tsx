import React, { useState } from 'react';
import { EcosystemStartup, ForumPost } from '../types';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Plus, 
  Search, 
  Filter, 
  ShieldCheck, 
  MessageCircle,
  ExternalLink
} from 'lucide-react';

interface EcosystemSectionProps {
  startups: EcosystemStartup[];
  posts: ForumPost[];
  onAddPost: (post: ForumPost) => void;
  onAddReply: (postId: string, text: string, author: string, company: string) => void;
}

export const EcosystemSection: React.FC<EcosystemSectionProps> = ({
  startups,
  posts,
  onAddPost,
  onAddReply
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'forum'>('directory');
  
  // Directory filter state
  const [sectorFilter, setSectorFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Forum filter & new post state
  const [forumCategory, setForumCategory] = useState<string>('Todos');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCategory, setNewCategory] = useState<ForumPost['category']>('Contratos y Proveedores');

  // Reply state
  const [replyOpenPostId, setReplyOpenPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyCompany, setReplyCompany] = useState('');

  const sectors = ['Todos', 'Logística de última milla', 'Agtech / Tecnología agrícola', 'Alimentos & Bebidas Gourmet', 'HealthTech / Telemedicina', 'Fintech / Cobranza B2B'];

  const filteredStartups = startups.filter(s => {
    const matchesSector = sectorFilter === 'Todos' || s.sector === sectorFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.founder.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const filteredPosts = forumCategory === 'Todos'
    ? posts
    : posts.filter(p => p.category === forumCategory);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newAuthor.trim()) return;

    const post: ForumPost = {
      id: `fp-${Date.now()}`,
      author: newAuthor,
      authorRole: 'Fundador / Líder PYME',
      company: newCompany || 'Emprendimiento Aliado',
      category: newCategory,
      title: newTitle,
      content: newContent,
      createdAt: 'Hace un momento',
      likes: 1,
      replies: []
    };

    onAddPost(post);
    setShowNewPostModal(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleSendReply = (postId: string) => {
    if (!replyText.trim() || !replyAuthor.trim()) return;
    onAddReply(postId, replyText, replyAuthor, replyCompany || 'PYME Aliada');
    setReplyText('');
    setReplyOpenPostId(null);
  };

  return (
    <section id="ecosistema" className="py-10 sm:py-12 lg:py-14 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 sm:mb-8 gap-4 sm:gap-6">
          <div className="max-w-3xl">
            <div className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#0071ce] uppercase mb-1.5 sm:mb-2">
              Catapulta para Emprendedores
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-950 tracking-tight mb-2 text-balance">
              Comunidad & Ecosistema de Clientes BinLegal.
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed">
              No solo blindamos tu empresa: conectamos a nuestros clientes para crear sinergias comerciales, compartir aprendizajes reales y acelerar negocios dentro de una red de confianza mutua.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl shrink-0 border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-[#0071ce] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Directorio ({startups.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('forum')}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'forum'
                  ? 'bg-[#0071ce] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Foro ({posts.length})</span>
            </button>
          </div>
        </div>

        {/* Feature Visual Banner - Synthesized */}
        <div className="mb-6 sm:mb-8 rounded-xl overflow-hidden border border-neutral-200 relative group h-36 sm:h-44 shadow-2xs">
          <img
            src="/src/assets/images/ecosystem_entrepreneurs_hub_1792518327995.jpg"
            alt="Encuentro de fundadores y comunidad de PYMES BinLegal"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-950/50 to-transparent flex items-center p-4 sm:p-6 lg:p-8">
            <div className="max-w-xl text-white">
              <span className="text-[10px] sm:text-xs font-mono uppercase text-neutral-300">
                Red de Confianza BinLegal
              </span>
              <h3 className="text-base sm:text-lg lg:text-xl font-display font-extrabold mt-0.5 mb-1">
                Más que asesoría: Un ecosistema colaborativo
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-300 line-clamp-2">
                Cada empresa asesorada por José Rafael Vásquez y su equipo tiene acceso a la red de fundadores, proveedores confiables y alianzas estratégicas.
              </p>
            </div>
          </div>
        </div>

        {/* TAB 1: DIRECTORY OF CLIENT PYMES */}
        {activeTab === 'directory' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in">
            {/* Search and filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por empresa, fundador o descripción..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto max-w-full">
                <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="text-xs text-neutral-500 whitespace-nowrap">Sector:</span>
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-xs text-neutral-800 focus:outline-none"
                >
                  {sectors.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Startups Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
              {filteredStartups.map((startup) => (
                <div
                  key={startup.id}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 hover:border-[#0071ce]/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-neutral-400">
                        {startup.city} · {startup.stage}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-neutral-800">
                        <ShieldCheck className="w-3 h-3 text-[#0071ce]" />
                        <span>Verificado</span>
                      </div>
                    </div>

                    <h4 className="text-base font-display font-bold text-neutral-950 mb-0.5">
                      {startup.name}
                    </h4>

                    <div className="text-[11px] text-neutral-500 font-medium mb-2">
                      Fundado por {startup.founder}
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed mb-3 line-clamp-2">
                      {startup.description}
                    </p>

                    {/* Synergies sought */}
                    <div className="pt-2.5 border-t border-neutral-100">
                      <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Sinergias buscadas:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {startup.synergies.map((syn, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-medium">
                    <span className="text-neutral-500 font-mono text-[11px]">{startup.sector}</span>
                    <a
                      href="#contacto"
                      className="text-[#0071ce] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Conectar</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {filteredStartups.length === 0 && (
              <div className="text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                <p className="text-xs text-neutral-500">
                  No se encontraron empresas con esos criterios de búsqueda.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SPECIALIZED DISCUSSION FORUM */}
        {activeTab === 'forum' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in">
            
            {/* Forum Control Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['Todos', 'Rondas de Inversión', 'Contratos y Proveedores', 'Permisología y Marcas', 'Alianzas Comerciales'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setForumCategory(cat)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      forumCategory === cat
                        ? 'bg-neutral-900 text-white'
                        : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowNewPostModal(true)}
                className="px-3.5 py-1.5 bg-[#0071ce] hover:bg-[#0060b0] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Preguntar al Foro</span>
              </button>
            </div>

            {/* Forum Threads List */}
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 sm:p-5 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                      <span className="font-semibold text-neutral-900">{post.category}</span>
                      <span>·</span>
                      <span>{post.createdAt}</span>
                    </div>
                    <div className="text-xs text-neutral-600">
                      Por <strong className="text-neutral-900">{post.author}</strong> ({post.company})
                    </div>
                  </div>

                  <h4 className="text-sm sm:text-base font-display font-bold text-neutral-950">
                    {post.title}
                  </h4>

                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Actions & Replies Accordion */}
                  <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-neutral-600">
                      <button 
                        onClick={() => {
                          post.likes += 1;
                          setActiveTab('forum');
                        }}
                        className="flex items-center gap-1 hover:text-neutral-950 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3 text-[#0071ce]" />
                        <span>{post.likes}</span>
                      </button>

                      <div className="flex items-center gap-1 text-neutral-500">
                        <MessageCircle className="w-3 h-3" />
                        <span>{post.replies.length} respuestas</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setReplyOpenPostId(replyOpenPostId === post.id ? null : post.id);
                      }}
                      className="text-xs font-semibold text-[#0071ce] hover:underline cursor-pointer"
                    >
                      {replyOpenPostId === post.id ? 'Ocultar respuestas' : 'Ver respuestas'}
                    </button>
                  </div>

                  {/* Replies Thread */}
                  {replyOpenPostId === post.id && (
                    <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2 bg-neutral-50/70 p-3 rounded-lg">
                      <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                        Respuestas ({post.replies.length})
                      </div>

                      {post.replies.map((reply) => {
                        const isBinLegalTeam = reply.company === 'BinLegal';
                        return (
                          <div 
                            key={reply.id} 
                            className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                              isBinLegalTeam 
                                ? 'bg-white border-neutral-900 ring-1 ring-neutral-900' 
                                : 'bg-white border-neutral-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-neutral-900">{reply.author}</span>
                                {isBinLegalTeam && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-neutral-900 text-white rounded">
                                    Legal
                                  </span>
                                )}
                                <span className="text-neutral-400">·</span>
                                <span className="text-neutral-500 text-[11px]">{reply.company}</span>
                              </div>
                              <span className="text-neutral-400 font-mono text-[10px]">{reply.createdAt}</span>
                            </div>
                            <p className="text-neutral-700 leading-relaxed text-xs">
                              {reply.content}
                            </p>
                          </div>
                        );
                      })}

                      {/* Reply Form */}
                      <div className="pt-2 border-t border-neutral-200 space-y-1.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            placeholder="Tu nombre"
                            value={replyAuthor}
                            onChange={(e) => setReplyAuthor(e.target.value)}
                            className="px-2.5 py-1 bg-white border border-neutral-300 rounded text-xs text-neutral-900 focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Tu empresa o rol"
                            value={replyCompany}
                            onChange={(e) => setReplyCompany(e.target.value)}
                            className="px-2.5 py-1 bg-white border border-neutral-300 rounded text-xs text-neutral-900 focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Escribe tu respuesta..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-900 focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendReply(post.id);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSendReply(post.id)}
                            className="px-3 py-1.5 bg-neutral-900 text-white rounded text-xs font-semibold hover:bg-neutral-800 transition-colors shrink-0"
                          >
                            Enviar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-lg rounded-xl border border-neutral-200 shadow-xl p-4 sm:p-6">
            <h3 className="text-lg font-display font-extrabold text-neutral-950 mb-0.5">
              Publicar en el Foro de PYMES
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Comparte una duda sobre estructuración, contratos o alianzas con la comunidad.
            </p>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Tu nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Ej. Roberto Díaz"
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Tu empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Ej. BioAgro Solutions"
                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Categoría especializada *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:bg-white"
                >
                  <option value="Rondas de Inversión">Rondas de Inversión</option>
                  <option value="Contratos y Proveedores">Contratos y Proveedores</option>
                  <option value="Permisología y Marcas">Permisología y Marcas</option>
                  <option value="Alianzas Comerciales">Alianzas Comerciales</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Título de la consulta *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Cláusula de no competencia en contrataciones"
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Detalle de la consulta *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Explica el contexto y tu duda concreta..."
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                >
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
