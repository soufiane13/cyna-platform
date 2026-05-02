import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
};

// ─── Composant individuel ────────────────────────────────────────────────────
const Toast = ({ id, type, title, message, duration, onRemove }) => {
    const [progress, setProgress] = useState(100);
    const startTime = useRef(Date.now());

    useEffect(() => {
        const tick = setInterval(() => {
            const elapsed = Date.now() - startTime.current;
            const pct = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(pct);
        }, 30);
        return () => clearInterval(tick);
    }, [duration]);

    const config = {
        success: {
            icon: <CheckCircle size={20} />,
            iconColor: 'text-[#00FF94]',
            barColor: 'bg-[#00FF94]',
            borderColor: 'border-l-[#00FF94]',
        },
        error: {
            icon: <XCircle size={20} />,
            iconColor: 'text-[#FF3B3B]',
            barColor: 'bg-[#FF3B3B]',
            borderColor: 'border-l-[#FF3B3B]',
        },
        warning: {
            icon: <AlertTriangle size={20} />,
            iconColor: 'text-[#FF9900]',
            barColor: 'bg-[#FF9900]',
            borderColor: 'border-l-[#FF9900]',
        },
        info: {
            icon: <Info size={20} />,
            iconColor: 'text-[#00F0FF]',
            barColor: 'bg-[#00F0FF]',
            borderColor: 'border-l-[#00F0FF]',
        },
    };

    const c = config[type] || config.info;

    return (
        <div className={`toast-enter relative overflow-hidden w-[360px] max-w-[calc(100vw-48px)] bg-[#1C2128] border border-white/10 border-l-4 ${c.borderColor} rounded-xl shadow-2xl`}>
            <div className="p-4 flex items-start gap-3">
                <span className={`flex-shrink-0 mt-0.5 ${c.iconColor}`}>{c.icon}</span>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm leading-snug">{title}</p>
                    {message && (
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{message}</p>
                    )}
                </div>
                <button
                    onClick={() => onRemove(id)}
                    className="flex-shrink-0 text-gray-600 hover:text-white transition-colors p-0.5 mt-0.5"
                    aria-label="Fermer"
                >
                    <X size={15} />
                </button>
            </div>

            {/* Barre de progression */}
            <div className="h-[3px] bg-white/5">
                <div
                    className={`h-full ${c.barColor} transition-none`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

// ─── Conteneur flottant ──────────────────────────────────────────────────────
const ToastContainer = ({ toasts, removeToast }) => (
    <div
        className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
    >
        {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
                <Toast {...t} onRemove={removeToast} />
            </div>
        ))}
    </div>
);

// ─── Provider ────────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback(({ type, title, message, duration = 4500 }) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev.slice(-4), { id, type, title, message, duration }]);
        setTimeout(() => removeToast(id), duration);
    }, [removeToast]);

    const toast = {
        success: (title, message) => addToast({ type: 'success', title, message }),
        error:   (title, message) => addToast({ type: 'error',   title, message }),
        warning: (title, message) => addToast({ type: 'warning', title, message }),
        info:    (title, message) => addToast({ type: 'info',    title, message }),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};
