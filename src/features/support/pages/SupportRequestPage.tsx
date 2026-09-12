import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Edit3, AlertCircle, ArrowRight } from 'lucide-react';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { getTranslations } from '../../../i18n';

interface Props {
  onSubmit: (requestText: string) => void;
}

type VoiceState = 'idle' | 'recording' | 'processing' | 'transcript' | 'unavailable' | 'error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function SupportRequestPage({ onSubmit }: Props) {
  const { language, accessMode, prefs, haptic } = useAccessibility();
  const T = getTranslations(language);

  const [text, setText]               = useState('');
  const [voiceState, setVoiceState]   = useState<VoiceState>('idle');
  const [transcript, setTranscript]   = useState('');
  const [caption, setCaption]         = useState('');
  const [error, setError]             = useState('');
  const recognitionRef                = useRef<InstanceType<typeof SpeechRecognition> | null>(null);
  const textareaRef                   = useRef<HTMLTextAreaElement>(null);

  const showVoice = accessMode === 'VOICE_AUDIO' || accessMode === 'VOICE_TEXT_VISUAL';
  const voiceSupported = !!SpeechRecognition;

  useEffect(() => {
    if (!showVoice || !voiceSupported) {
      if (showVoice && !voiceSupported) setVoiceState('unavailable');
    }
  }, [showVoice, voiceSupported]);

  function startRecording() {
    if (!voiceSupported) { setVoiceState('unavailable'); return; }
    setError('');
    setCaption('');
    setVoiceState('recording');
    haptic('navigation');

    const rec = new SpeechRecognition();
    rec.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (e: { results: { transcript: string; isFinal: boolean }[][] }) => {
      const result = e.results[e.results.length - 1];
      const t = result[0].transcript;
      setCaption(t);
      if (result.isFinal) {
        setTranscript(t);
        setVoiceState('transcript');
        haptic('success');
      }
    };
    rec.onerror = (e: { error: string }) => {
      if (e.error === 'not-allowed') { setVoiceState('unavailable'); setError(T.request.micDenied); }
      else { setVoiceState('error'); setError(T.request.voiceError); }
      haptic('error');
    };
    rec.onend = () => {
      if (voiceState === 'recording') setVoiceState('processing');
    };

    recognitionRef.current = rec;
    rec.start();
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setVoiceState('processing');
  }

  function confirmTranscript() {
    setText(transcript);
    setVoiceState('idle');
    haptic('success');
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  function retryVoice() {
    setVoiceState('idle');
    setError('');
    setCaption('');
    setTranscript('');
  }

  function handleSubmit() {
    const finalText = text.trim();
    if (!finalText) { setError(T.request.required); haptic('error'); return; }
    haptic('success');
    onSubmit(finalText);
  }

  const isVoiceMode = accessMode === 'VOICE_AUDIO';

  return (
    <div className="ics-main">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          {T.request.title}
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--color-text-2)' }}>
          Kingston Engineering College — Campus Support
        </p>

        {/* Voice UI */}
        {showVoice && (
          <div className="ics-card mb-6 text-center">
            <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>{T.request.voiceTitle}</h2>

            {voiceState === 'unavailable' && (
              <div className="flex items-start gap-2 p-3 rounded-lg mb-4" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }} role="alert">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-left">{T.request.voiceFallback}</p>
              </div>
            )}

            {voiceState === 'error' && (
              <div className="flex items-start gap-2 p-3 rounded-lg mb-4" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }} role="alert">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-left">{error}</p>
              </div>
            )}

            {voiceState !== 'unavailable' && (
              <div className="flex flex-col items-center gap-4">
                {voiceState === 'idle' && (
                  <>
                    <button className="ics-mic-btn" onClick={startRecording} aria-label={T.request.voiceInstruction}>
                      <Mic size={28} aria-hidden="true" />
                    </button>
                    <p className="text-sm" style={{ color: 'var(--color-text-2)' }}>{T.request.voiceInstruction}</p>
                  </>
                )}

                {voiceState === 'recording' && (
                  <>
                    <button className="ics-mic-btn recording" onClick={stopRecording} aria-label="Stop recording">
                      <MicOff size={28} aria-hidden="true" />
                    </button>
                    <p className="text-sm font-medium" style={{ color: '#dc2626' }}>{T.request.voiceRecording}</p>
                    {prefs.captions && caption && (
                      <p className="text-sm italic p-2 rounded" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-2)' }}>{caption}</p>
                    )}
                  </>
                )}

                {voiceState === 'processing' && (
                  <p className="text-sm" style={{ color: 'var(--color-text-2)' }}>{T.request.voiceProcessing}</p>
                )}

                {voiceState === 'transcript' && (
                  <div className="w-full text-left">
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>{T.request.editTranscript}</p>
                    <textarea
                      className="ics-input mb-3"
                      value={transcript}
                      onChange={e => setTranscript(e.target.value)}
                      rows={3}
                      aria-label={T.request.editTranscript}
                    />
                    <div className="flex gap-2">
                      <button className="ics-btn ics-btn-primary flex-1" onClick={confirmTranscript}>
                        {T.request.confirmTranscript}
                      </button>
                      <button className="ics-btn ics-btn-ghost" onClick={retryVoice}>
                        {T.request.retryVoice}
                      </button>
                    </div>
                  </div>
                )}

                {voiceState === 'error' && (
                  <div className="flex gap-2">
                    <button className="ics-btn ics-btn-secondary" onClick={retryVoice}>{T.request.retryVoice}</button>
                    <button className="ics-btn ics-btn-ghost" onClick={() => setVoiceState('idle')}>{T.request.switchToText}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Text input */}
        {(!isVoiceMode || voiceState === 'idle') && (
          <div className="mb-6">
            {showVoice && <p className="flex items-center gap-1 text-xs mb-2" style={{ color: 'var(--color-text-3)' }}><Edit3 size={12} aria-hidden="true" /> Or type your request</p>}
            <label htmlFor="request-text" className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              {T.request.title} <span aria-hidden="true" style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <textarea
              id="request-text"
              ref={textareaRef}
              className="ics-input"
              rows={5}
              value={text}
              onChange={e => { setText(e.target.value); setError(''); }}
              placeholder={T.request.placeholder}
              aria-required="true"
              aria-describedby={error ? 'request-error' : 'request-hint'}
            />
            <div className="flex justify-between mt-1">
              <span id="request-hint" className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                {T.request.characterCount(text.length)}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div id="request-error" role="alert" className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--color-danger)' }}>
            <AlertCircle size={16} aria-hidden="true" />
            {error}
          </div>
        )}

        <button
          className="ics-btn ics-btn-primary ics-btn-lg w-full"
          onClick={handleSubmit}
          disabled={!text.trim()}
          aria-disabled={!text.trim()}
        >
          {T.request.submit}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
