import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Mic, Volume2, VolumeX, Loader2, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';

const ChatBotWidget = () => {
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'welcome', textKey: 'cb_welcome', sender: 'bot', lang: 'System' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [micLang, setMicLang] = useState('hi-IN'); 
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const voiceEnabledRef = useRef(true); 
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    window.speechSynthesis.cancel();
    const handleUnload = () => window.speechSynthesis.cancel();
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const cleanTextForSpeech = (rawText) => {
    return rawText.replace(/[*#_`~]/g, '');
  };

  const speakReply = (text, detectedLanguage) => {
    if (!voiceEnabledRef.current) return;
    
    window.speechSynthesis.cancel();
    const cleanText = cleanTextForSpeech(text);
    
    const sentences = cleanText.match(/[^.!?]+[.!?]*/g) || [cleanText];
    const langLower = detectedLanguage?.toLowerCase() || 'english';
    const targetLang = (langLower.includes('hindi') || langLower.includes('marathi')) ? 'hi-IN' : 'en-IN';

    sentences.forEach(sentence => {
      if (!sentence.trim()) return;
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      utterance.lang = targetLang;
      window.speechSynthesis.speak(utterance);
    });
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      window.speechSynthesis.cancel(); 
    } else {
      voiceEnabledRef.current = true; 
      const lastBotMsg = [...messages].reverse().find(msg => msg.sender === 'bot');
      if (lastBotMsg) {
        const textToSpeak = lastBotMsg.textKey ? t(lastBotMsg.textKey) : lastBotMsg.text;
        speakReply(textToSpeak, lastBotMsg.lang);
      }
    }
    setVoiceEnabled(!voiceEnabled);
  };

  // 🚀 FIXED: Added graceful 401 Session Expiry handling
  const handleSendText = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { id: Date.now(), text: userMessage, sender: 'user' }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setMessages(prev => [...prev, { id: Date.now(), text: "⚠️ Authentication Error: Please log out and log back in.", sender: 'bot', lang: 'System' }]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/ChatBot?message=${encodeURIComponent(userMessage)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      // Catch specific 401 Unauthorized errors gracefully
      if (response.status === 401) {
        setMessages(prev => [...prev, { id: Date.now(), text: "⚠️ Your session has expired! Please log out and log back in to use the AI.", sender: 'bot', lang: 'System' }]);
        setIsLoading(false);
        return;
      }

      if (!response.ok) throw new Error("API failed");
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: data.response, 
        sender: 'bot', 
        lang: data.detectedLanguage 
      }]);
      
      speakReply(data.response, data.detectedLanguage);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: Date.now(), textKey: "cb_error", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t("cb_browser_error"));
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = micLang; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = async (event) => {
      setIsListening(false);
      const spokenText = event.results[0][0].transcript;
      
      setMessages(prev => [...prev, { id: Date.now(), text: `🎤 ${spokenText}`, sender: 'user' }]);
      setIsLoading(true);

      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          setMessages(prev => [...prev, { id: Date.now(), text: "⚠️ Authentication Error: Please log out and log back in.", sender: 'bot', lang: 'System' }]);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/ChatBot/voice`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ message: spokenText })
        });
        
        // Catch specific 401 Unauthorized errors gracefully
        if (response.status === 401) {
          setMessages(prev => [...prev, { id: Date.now(), text: "⚠️ Your session has expired! Please log out and log back in to use the AI.", sender: 'bot', lang: 'System' }]);
          setIsLoading(false);
          return;
        }

        if (!response.ok) throw new Error("Voice API failed");
        
        const data = await response.json();
        
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: data.response, 
          sender: 'bot', 
          lang: data.detectedLanguage 
        }]);
        
        speakReply(data.response, data.detectedLanguage);

      } catch (error) {
        console.error("Voice chat error:", error);
        setMessages(prev => [...prev, { id: Date.now(), textKey: "cb_voice_error", sender: 'bot' }]);
      } finally {
        setIsLoading(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-[350px] sm:w-[400px] h-[500px] flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-lg"><MessageSquare size={20} /></div>
              <div>
                <h3 className="font-bold">{t("shikshaSahayak")} AI</h3>
                <p className="text-xs text-indigo-100">{t("cb_subtitle")}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={toggleVoice} 
                className="p-1.5 hover:bg-white/20 rounded-md transition"
                title={voiceEnabled ? t("cb_mute") : t("cb_unmute")}
              >
                {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-md transition">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.textKey ? t(msg.textKey) : msg.text}</p>
                  {msg.lang && msg.sender === 'bot' && (
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{msg.lang}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="text-indigo-500 animate-spin" />
                  <span className="text-xs text-slate-500 font-medium">{t("cb_typing")}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSendText} className="flex items-center gap-2">
              
              <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setMicLang(prev => prev === 'en-IN' ? 'hi-IN' : 'en-IN')}
                  title={t("cb_toggle_mic")}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-full bg-white shadow-sm text-indigo-600 uppercase tracking-wider"
                >
                  <Globe size={12} />
                  {micLang === 'en-IN' ? 'EN' : 'HI/MR'}
                </button>
                
                <button 
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-full flex-shrink-0 transition-all ${
                    isListening 
                      ? 'bg-rose-100 text-rose-600 animate-pulse' 
                      : 'text-slate-500 hover:text-indigo-600'
                  }`}
                >
                  <Mic size={18} />
                </button>
              </div>
              
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t("cb_placeholder")} 
                className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-2.5 text-sm transition-all"
                disabled={isListening}
              />
              
              <button 
                type="submit" 
                disabled={!inputText.trim() || isLoading}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl hover:shadow-indigo-600/30 transition-all transform hover:-translate-y-1 flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

    </div>
  );
};

export default ChatBotWidget;