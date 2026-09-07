'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ChatMessage, TripPlan } from '@/types/trip';

interface TripChatbotProps {
  plan: TripPlan;
  onModifyItinerary?: (actionKey: string, promptText: string) => void;
  onUpdatePlan?: (updatedPlan: TripPlan) => void;
  onNavigateToTimeline?: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    timestamp: 'Baru saja',
    text: 'Halo! Aku TripCraft, pemandu wisata lokalmu. Rencana perjalananmu sudah siap dan dioptimasi searah. Mau tambah tempat makan seafood, bikin jadwal lebih santai, atau kurangi budget hotel? Tinggal ketik atau klik rekomendasi cepat di bawah!',
  },
];

const SUGGESTION_CHIPS = [
  {
    id: 'seafood',
    label: '🍜 Tambah Seafood Malam',
    prompt: 'Tolong tambahkan rekomendasi makan malam seafood lokal yang searah rute.',
  },
  {
    id: 'cheaper_hotel',
    label: '🏨 Turunkan Kelas Hotel',
    prompt: 'Hotelnya kemahalan, coba turunkan kelas hotel biar lebih hemat.',
  },
  {
    id: 'relaxed',
    label: '🌿 Buat Lebih Santai',
    prompt: 'Buat jadwal lebih santai dan kurangi aktivitas yang bikin terburu-buru.',
  },
  {
    id: 'rain_indoor',
    label: '🌧️ Opsi Indoor Kalau Hujan',
    prompt: 'Kalau hari kedua hujan lebat, apa alternatif tempat indoor-nya?',
  },
  {
    id: 'coffee',
    label: '☕ Rekomendasi Cafe Senja',
    prompt: 'Rekomendasikan coffee shop estetik buat santai pas senja hari.',
  },
];

const createMessageId = (prefix: 'user' | 'bot') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const TripChatbot: React.FC<TripChatbotProps> = ({
  plan,
  onModifyItinerary,
  onUpdatePlan,
  onNavigateToTimeline,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chipsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const checkScrollability = () => {
    const el = chipsScrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 && chipsScrollRef.current) {
      chipsScrollRef.current.scrollLeft += e.deltaY;
      checkScrollability();
    }
  };

  const scrollChips = (direction: 'left' | 'right') => {
    if (chipsScrollRef.current) {
      const amount = direction === 'left' ? -180 : 180;
      chipsScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = chipsScrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !chipsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - chipsScrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    chipsScrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    checkScrollability();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleSendMessage = async (text: string, actionKey?: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: createMessageId('user'),
      sender: 'user',
      timestamp: 'Baru saja',
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: plan.id,
          currentPlan: plan,
          message: text.trim(),
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const { replyText, actionApplied, updatedPlan } = json.data;

        const botMsg: ChatMessage = {
          id: createMessageId('bot'),
          sender: 'assistant',
          timestamp: 'Baru saja',
          text: replyText,
          actionApplied: actionApplied || actionKey || 'custom',
        };

        setMessages((prev) => [...prev, botMsg]);

        // Prioritize server updatedPlan if returned
        if (updatedPlan) {
          onUpdatePlan?.(updatedPlan);
        } else if (actionApplied) {
          onModifyItinerary?.(actionApplied, text);
        }
      } else {
        throw new Error(json.error || 'Gagal memproses pesan');
      }
    } catch {
      // Local fallback response
      let replyText = `Siap! Catatanmu "${text}" sudah dicatat dan disesuaikan ke rute ${plan.destination}.`;
      let fallbackAction = actionKey || 'custom';

      if (actionKey === 'seafood' || text.toLowerCase().includes('seafood')) {
        replyText =
          'Bisa banget! Rekomendasi kuliner seafood lokal sudah ditambahkan ke jadwal makan malam yang searah rute.';
        fallbackAction = 'seafood';
      } else if (actionKey === 'coffee' || text.toLowerCase().includes('kopi') || text.toLowerCase().includes('cafe')) {
        replyText =
          'Siap! Rekomendasi coffee shop senja sudah ditambahkan ke jadwal santai sore.';
        fallbackAction = 'coffee';
      } else if (actionKey === 'cheaper_hotel' || text.toLowerCase().includes('hotel')) {
        replyText =
          'Siap! Kelas hotel dialihkan ke Boutique Guesthouse terkurasi agar anggaran lebih hemat.';
        fallbackAction = 'cheaper_hotel';
      } else if (actionKey === 'relaxed' || text.toLowerCase().includes('santai')) {
        replyText =
          'Beres! Jadwal dibuat lebih santai dengan jeda istirahat diperpanjang agar tidak terburu-buru.';
        fallbackAction = 'relaxed';
      } else if (actionKey === 'rain_indoor' || text.toLowerCase().includes('hujan') || text.toLowerCase().includes('indoor')) {
        replyText =
          'Beres! Opsi tempat wisata indoor edukatif sudah disiapkan untuk antisipasi hujan lebat.';
        fallbackAction = 'rain_indoor';
      }

      // Trigger itinerary modification on fallback
      onModifyItinerary?.(fallbackAction, text);

      const botMsg: ChatMessage = {
        id: createMessageId('bot'),
        sender: 'assistant',
        timestamp: 'Baru saja',
        text: replyText,
        actionApplied: fallbackAction,
      };

      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="flex flex-col h-[650px] bg-card/85 backdrop-blur-xl border border-border/80 shadow-xl rounded-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-border/60 bg-muted/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-600/15 text-emerald-600 flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground">Pemandu Lokal TripCraft AI</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-muted-foreground">Aktif · Menyesuaikan rute {plan.destination}</p>
          </div>
        </div>

        <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          Mode Interaktif
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isBot = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="h-7 w-7 rounded-lg bg-emerald-600/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                  isBot
                    ? 'bg-muted/70 text-foreground border border-border/50 rounded-tl-xs'
                    : 'bg-emerald-600 text-white rounded-tr-xs shadow-xs'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                {msg.actionApplied && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-border/40 mt-1 gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      <span>Rencana perjalanan diperbarui</span>
                    </div>
                    {onNavigateToTimeline && (
                      <button
                        type="button"
                        onClick={onNavigateToTimeline}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
                      >
                        Lihat Itinerary →
                      </button>
                    )}
                  </div>
                )}
                <p
                  className={`text-[9px] text-right font-mono ${
                    isBot ? 'text-muted-foreground' : 'text-emerald-100'
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>

              {!isBot && (
                <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-7 w-7 rounded-lg bg-emerald-600/15 text-emerald-600 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-2.5 rounded-xl bg-muted/60 text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Chips (PRD Section 18) */}
      <div className="px-4 py-2 bg-muted/20 border-t border-border/50 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-600" /> Aksi Cepat Modifikasi:
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollChips('left')}
              disabled={!canScrollLeft}
              className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors cursor-pointer"
              title="Scroll kiri"
              aria-label="Scroll kiri"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollChips('right')}
              disabled={!canScrollRight}
              className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors cursor-pointer"
              title="Scroll kanan"
              aria-label="Scroll kanan"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div
          ref={chipsScrollRef}
          onWheel={handleWheel}
          onScroll={checkScrollability}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar select-none cursor-grab active:cursor-grabbing scroll-smooth min-w-0"
        >
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => {
                if (!hasDraggedRef.current) {
                  handleSendMessage(chip.prompt, chip.id);
                }
              }}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-border/80 bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-500/40 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border/60 bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tanya rekomendasi atau ubah itinerary..."
            className="h-10 text-xs bg-muted/30 focus-visible:ring-emerald-500"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!inputValue.trim() || isTyping}
            className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
