import { FC, PropsWithChildren, useEffect } from 'react'
import { useModal } from 'react-modal-hook'

import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string | ReactNode
  maxWidth?: string
  hasHeader?: boolean
}

export const Modal: FC<PropsWithChildren<Props>> = ({
  open,
  onClose,
  title,
  maxWidth = 'max-w-lg',
  children,
  hasHeader = true,
}) => {
  const [showModal, hideModal] = useModal(
    () => (
      <>
        {/* Backdrop with blur effect */}
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] supports-[backdrop-filter]:bg-black/20"
          onClick={() => {
            hideModal()
            onClose()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              hideModal()
              onClose()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close modal"
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
          <div
            className={`bg-white rounded-2xl shadow-xl ${maxWidth} w-full max-h-[80vh] overflow-hidden pointer-events-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {hasHeader && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                {typeof title === 'string' ? (
                  <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                ) : (
                  <div className="flex-1 flex items-center">{title}</div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    hideModal()
                    onClose()
                  }}
                  className="text-gray-400 hover:text-gray-500 transition-colors cursor-pointer ml-2"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Content */}
            {children}
          </div>
        </div>
      </>
    ),
    [onClose, title, maxWidth, children],
  )

  useEffect(() => {
    if (open) {
      showModal()
    } else {
      hideModal()
    }
  }, [open, showModal, hideModal])

  return null
}
