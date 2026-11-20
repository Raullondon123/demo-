#!/usr/bin/env python3
"""Adapt a working copy of Cartographer for Spanish turn-based voice."""
from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text()
def once(old, new):
    global s
    if s.count(old) != 1:
        raise RuntimeError('La versión upstream cambió; marcador ambiguo: ' + old[:70])
    s = s.replace(old, new, 1)

once('    continuous: true,\n    silenceTimeoutMs:', '    continuous: true,\n    language: "es-PE",\n    silenceTimeoutMs:')
once('Start the interview by asking me one focused question.', 'Comienza nuestra exploración de ideas en español. Pregúntame qué concepto o desarrollo de producto quiero investigar. Una pregunta breve.')
old = '''  // Q&A mode: auto-start mic after LLM finishes responding.
  // Uses speechRef instead of speech in deps to avoid the timer being
  // cleared on every render (speech is a new object each render).
  useEffect(() => {
    if (isStreaming) {
      wasStreamingRef.current = true;
    } else if (wasStreamingRef.current && interviewMode === "qa") {
      wasStreamingRef.current = false;
      // Small delay so the user hears the transition
      const timer = setTimeout(() => {
        const s = speechRef.current;
        if (s.isSupported && !s.isListening) {
          s.resetTranscript();
          s.start();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, interviewMode]);'''
new = '''  // NEURAL: finish spoken answer before listening again, avoiding feedback.
  useEffect(() => {
    if (isStreaming) {
      wasStreamingRef.current = true;
    } else if (wasStreamingRef.current && interviewMode === "qa") {
      wasStreamingRef.current = false;
      const resume = () => {
        if (useInterviewStore.getState().interviewMode !== "qa") return;
        const s = speechRef.current;
        if (s.isSupported && !s.isListening) {
          s.resetTranscript();
          void s.start();
        }
      };
      const assistant = [...useInterviewStore.getState().messages]
        .reverse().find(m => m.role === "assistant" && m.content.trim());
      const content = assistant?.content.trim();
      if (!content || typeof window === "undefined" || !("speechSynthesis" in window)) {
        resume();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(content.slice(0, 2500));
      utterance.lang = "es-PE";
      utterance.rate = 1.05;
      const spanishVoice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith("es"));
      if (spanishVoice) utterance.voice = spanishVoice;
      utterance.onend = resume;
      utterance.onerror = resume;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, [isStreaming, interviewMode]);

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);'''
once(old,new)
p.write_text(s)
print('Adaptación NEURAL en español aplicada a',p)
