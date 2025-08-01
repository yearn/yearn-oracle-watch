import { FC, PropsWithChildren, useEffect } from 'react'
import { useModal } from 'react-modal-hook'
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string | ReactNode
  hasHeader?: boolean
}

export const SlidingModal: FC<PropsWithChildren<Props>> = ({
  open,
  onClose,
  title,
  children,
  hasHeader = true,
}) => {
  const [showModal, hideModal] = useModal(
    () => (
      <>
        {/* Sliding Modal - No backdrop to allow page interaction */}
        <div
          className={`
            fixed z-[9999] bg-white shadow-xl pointer-events-auto
            transition-transform duration-300 ease-out
            
            /* Desktop: slide from left, positioned below header, constrained height */
            md:left-0 md:top-16 md:w-96 md:h-[calc(100vh-4rem)]
            ${open ? 'md:translate-x-0' : 'md:-translate-x-full'}
            
            /* Mobile: slide from bottom, justified to bottom */
            left-0 right-0 bottom-0 w-full h-auto max-h-[80vh] rounded-t-2xl
            ${open ? 'translate-y-0' : 'translate-y-full'}
            md:rounded-t-none
            
            /* Flex layout for proper content sizing */
            flex flex-col
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {hasHeader && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
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
                <svg
                  className="w-6 h-6"
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
              </button>
            </div>
          )}

          {/* Content - scrollable area */}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </>
    ),
    [onClose, title, children, open]
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
