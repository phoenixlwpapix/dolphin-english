'use client'

import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { AlertTriangleIcon, TrashIcon } from './Icons'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
    isLoading?: boolean
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    isLoading = false,
}: ConfirmModalProps) {
    const isDestructive = variant === 'destructive'

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
            <div className="flex flex-col items-center text-center py-2">
                {/* Icon */}
                <div
                    className={`
                        w-14 h-14 rounded-full flex items-center justify-center mb-5
                        ${isDestructive
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-amber-100 dark:bg-amber-900/30'
                        }
                    `}
                >
                    {isDestructive ? (
                        <TrashIcon className="w-7 h-7 text-red-500 dark:text-red-400" />
                    ) : (
                        <AlertTriangleIcon className="w-7 h-7 text-amber-500 dark:text-amber-400" />
                    )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">
                    {description}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-border/50">
                <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1"
                    size="sm"
                >
                    {cancelText}
                </Button>
                <Button
                    variant={isDestructive ? 'danger' : 'primary'}
                    onClick={onConfirm}
                    isLoading={isLoading}
                    className="flex-1"
                    size="sm"
                >
                    {confirmText}
                </Button>
            </div>
        </Modal>
    )
}
