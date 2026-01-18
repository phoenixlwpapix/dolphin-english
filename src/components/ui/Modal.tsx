'use client'

import { type ReactNode, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showCloseButton?: boolean
}

const sizeMaxWidths = {
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '42rem',
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
}: ModalProps) {
    // Handle escape key
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        },
        [onClose]
    )

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, handleEscape])

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                style={{ animation: 'fadeIn 0.2s ease-out' }}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal content */}
            <div
                className={`
          relative flex flex-col overflow-hidden
          bg-background rounded-2xl shadow-2xl
          max-h-[90vh]
        `}
                style={{
                    width: '100%',
                    maxWidth: sizeMaxWidths[size],
                    animation: 'modalIn 0.2s ease-out'
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        {title && (
                            <h2 id="modal-title" className="text-xl font-semibold text-foreground">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="ml-auto -mr-2"
                                aria-label="Close"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </Button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="p-4 overflow-y-auto flex-1">{children}</div>
            </div>
        </div>,
        document.body
    )
}
