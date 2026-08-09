import { useState, useEffect, useCallback } from 'react';
import { FileText, MessageSquare, Upload, Sparkles, Trash2, Plus, Send, BookOpen, Loader2, FileSearch, X, Quote, ChevronRight, Zap, Shield, TrendingUp } from 'lucide-react';
import {
  uploadDocument,
  fetchDocuments,
  deleteDocument,
  fetchConversations,
  createConversation,
  deleteConversation,
  fetchMessages,
  sendChatMessage,
  generateTitle,
} from './lib/api';
import { hasSupabaseEnv, supabaseConfigError } from './lib/supabase';
import type { DocumentRecord, Conversation, CitationSource } from './lib/supabase';

type View = 'landing' | 'app';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: CitationSource[];
  created_at: string;
}

function App() {
  const [view, setView] = useState<View>('landing');
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'documents'>('chat');
  const [expandedCitations, setExpandedCitations] = useState<string | null>(null);

  const configError = supabaseConfigError;

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const convs = await fetchConversations();
      setConversations(convs);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const msgs = await fetchMessages(conversationId);
      setMessages(msgs.map((m) => ({ ...m, sources: m.sources ?? [] })));
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  useEffect(() => {
    if (configError) return;
    loadDocuments();
    loadConversations();
  }, [loadDocuments, loadConversations, configError]);

  // Poll for document status updates
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === 'processing' || d.status === 'uploading');
    if (!hasProcessing) return;
    const interval = setInterval(() => loadDocuments(), 2000);
    return () => clearInterval(interval);
  }, [documents, loadDocuments]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        await uploadDocument(file);
      }
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      setSelectedDocIds((prev) => prev.filter((d) => d !== id));
      await loadDocuments();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleNewConversation = async () => {
    try {
      const conv = await createConversation();
      setConversations((prev) => [conv, ...prev]);
      setActiveConversation(conv);
      setMessages([]);
      setActiveTab('chat');
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setActiveConversation(conv);
    await loadMessages(conv.id);
    setActiveTab('chat');
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversation?.id === id) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    let conversation = activeConversation;
    if (!conversation) {
      try {
        conversation = await createConversation(input.slice(0, 60));
        setConversations((prev) => [conversation!, ...prev]);
        setActiveConversation(conversation);
      } catch (err) {
        setError('Failed to create conversation');
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input,
      sources: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      if (messages.length === 0) {
        await generateTitle(conversation.id, input);
        await loadConversations();
      }

      const result = await sendChatMessage(
        conversation.id,
        input,
        selectedDocIds.length > 0 ? selectedDocIds : documents.filter((d) => d.status === 'ready').map((d) => d.id)
      );

      const assistantMessage: ChatMessage = {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        sources: result.sources,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const toggleDocumentSelection = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const readyDocCount = documents.filter((d) => d.status === 'ready').length;
  const totalChunks = documents.reduce((sum, d) => sum + (d.chunk_count || 0), 0);

  // Landing page
  if (view === 'landing') {
    return <LandingPage onStart={() => setView('app')} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } transition-all duration-300 border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">FinVista Intelligence</h1>
              <p className="text-xs text-slate-400">Enterprise Document RAG</p>
            </div>
          </div>
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex gap-1 mb-3 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'chat' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chats
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'documents' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Documents
            </button>
          </div>

          {activeTab === 'chat' ? (
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      activeConversation?.id === conv.id
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-xs truncate flex-1">{conv.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-slate-500" />
                )}
                <span className="text-xs text-slate-400 text-center">
                  {uploading ? 'Processing...' : 'Upload PDF documents'}
                </span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.md,.csv"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </label>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`group p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedDocIds.includes(doc.id)
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-800 bg-slate-800/30 hover:border-slate-700'
                  }`}
                  onClick={() => toggleDocumentSelection(doc.id)}
                >
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {doc.status === 'ready' ? (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {doc.chunk_count} chunks
                          </span>
                        ) : doc.status === 'processing' || doc.status === 'uploading' ? (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            Processing
                          </span>
                        ) : doc.status === 'error' ? (
                          <span className="text-[10px] text-red-400">Error</span>
                        ) : null}
                        <span className="text-[10px] text-slate-500">
                          {(doc.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/50 rounded-lg p-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Documents</p>
              <p className="text-lg font-bold text-white">{readyDocCount}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Chunks</p>
              <p className="text-lg font-bold text-white">{totalChunks}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {activeConversation?.title ?? 'FinVista Intelligence Assistant'}
              </h2>
              <p className="text-xs text-slate-500">
                {selectedDocIds.length > 0
                  ? `Searching ${selectedDocIds.length} selected document${selectedDocIds.length > 1 ? 's' : ''}`
                  : `Searching all ${readyDocCount} document${readyDocCount !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-300 font-medium">RAG Active</span>
            </div>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <EmptyState
              hasDocuments={readyDocCount > 0}
              onUpload={() => setActiveTab('documents')}
              onSuggestion={(q) => setInput(q)}
            />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  expandedCitations={expandedCitations}
                  setExpandedCitations={setExpandedCitations}
                />
              ))}
              {loading && (
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Searching documents and generating answer...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          {(configError || error) && (
            <div className="max-w-3xl mx-auto mb-3 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
              <X className="w-3.5 h-3.5" />
              {configError || error}
              {!configError && (
                <button onClick={() => setError(null)} className="ml-auto">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about your enterprise documents..."
                rows={1}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="max-w-3xl mx-auto mt-2 text-[10px] text-slate-600 text-center">
            Answers are generated from your uploaded documents. Always verify critical financial decisions.
          </p>
        </div>
      </main>
    </div>
  );
}

function EmptyState({
  hasDocuments,
  onUpload,
  onSuggestion,
}: {
  hasDocuments: boolean;
  onUpload: () => void;
  onSuggestion: (q: string) => void;
}) {
  const suggestions = [
    'Summarize the key financial metrics in the latest report',
    'What are the main risk factors identified?',
    'Compare revenue growth across quarters',
    'What strategic initiatives are highlighted?',
  ];

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-6">
        <BookOpen className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Enterprise Document Intelligence</h2>
      <p className="text-sm text-slate-400 mb-8 max-w-md">
        {hasDocuments
          ? 'Ask questions about your uploaded documents. I\'ll search through them and provide answers with citations.'
          : 'Upload your enterprise documents to start asking questions with grounded, cited answers.'}
      </p>
      {!hasDocuments && (
        <button
          onClick={onUpload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors mb-8"
        >
          <Upload className="w-4 h-4" />
          Upload Documents
        </button>
      )}
      {hasDocuments && (
        <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestion(s)}
              className="text-left p-3 rounded-lg border border-slate-800 bg-slate-800/30 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-colors text-xs text-slate-300"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  expandedCitations,
  setExpandedCitations,
}: {
  message: ChatMessage;
  expandedCitations: string | null;
  setExpandedCitations: (id: string | null) => void;
}) {
  const isUser = message.role === 'user';
  const isExpanded = expandedCitations === message.id;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-slate-700'
            : 'bg-gradient-to-br from-emerald-400 to-teal-600'
        }`}
      >
        {isUser ? (
          <span className="text-xs font-bold text-slate-300">You</span>
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>
      <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
        <div
          className={`inline-block max-w-full ${
            isUser
              ? 'bg-slate-800 rounded-2xl rounded-tr-sm px-4 py-3'
              : 'bg-slate-800/50 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-800'
          }`}
        >
          <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{message.content}</p>

          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <button
                onClick={() => setExpandedCitations(isExpanded ? null : message.id)}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Quote className="w-3 h-3" />
                {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
                <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {message.sources.map((src, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/50 border border-slate-800"
                    >
                      <FileSearch className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-200 truncate">
                          {src.document_name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Page {src.page} · {(src.similarity * 100).toFixed(0)}% match
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">FinVista</span>
          </div>
          <button
            onClick={onStart}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-300 font-medium">RAG-Powered Enterprise Intelligence</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Chat with your{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              enterprise documents
            </span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your financial reports, contracts, and enterprise documents. Ask questions in natural
            language and get answers grounded in your data — with precise citations to the source.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              Get Started
            </button>
            <button
              onClick={onStart}
              className="px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-200 font-medium transition-colors"
            >
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<FileSearch className="w-6 h-6" />}
              title="Semantic Search"
              description="Vector embeddings with pgvector find relevant passages even without exact keyword matches."
            />
            <FeatureCard
              icon={<Quote className="w-6 h-6" />}
              title="Cited Answers"
              description="Every answer includes citations to the exact document and page, so you can verify sources."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Secure & Private"
              description="Your documents stay in your Supabase database with row-level security and encrypted storage."
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">1536-dim</p>
            <p className="text-sm text-slate-500">Vector Embeddings</p>
          </div>
          <div>
            <FileText className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">Multi-doc</p>
            <p className="text-sm text-slate-500">Batch Processing</p>
          </div>
          <div>
            <Sparkles className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">Real-time</p>
            <p className="text-sm text-slate-500">AI Responses</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your document workflow?</h2>
          <p className="text-slate-400 mb-8">
            Start uploading documents and asking questions in seconds.
          </p>
          <button
            onClick={onStart}
            className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-colors"
          >
            Launch FinVista Intelligence
          </button>
        </div>
      </section>

      <footer className="px-6 py-8 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto text-center text-xs text-slate-600">
          FinVista Intelligence · Enterprise Document RAG · Built with Supabase, pgvector & React
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

export default App;
