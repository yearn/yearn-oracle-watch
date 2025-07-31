import { type SnackbarKey } from 'notistack'
import { type FC, type ReactElement } from 'react'
import { useChains } from 'wagmi'
import { cn } from '../../utils/cn'

type NotificationType = 'success' | 'error' | 'pending' | 'confirmed' | 'failed' | 'viewTransaction'

type ToastNotification = {
  id: string
  submittedAt: number
  type: NotificationType
  title?: string
  hash?: string
}

type ToastProps = {
  chainId: number
  notification: ToastNotification
  onClose?: (key: SnackbarKey) => void
}

const getStatusIcon = (type: NotificationType): ReactElement => {
  switch (type) {
    case 'success':
    case 'confirmed':
    case 'viewTransaction':
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 10L9.16667 11.6667L12.5 8.33333M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'error':
    case 'failed':
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.5 7.5L7.5 12.5M7.5 7.5L12.5 12.5M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'pending':
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin"
        >
          <path
            d="M10 2.5V5M10 15V17.5M17.5 10H15M5 10H2.5M15.3033 4.69667L13.5355 6.46445M6.46445 13.5355L4.69667 15.3033M15.3033 15.3033L13.5355 13.5355M6.46445 6.46445L4.69667 4.69667"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    default:
      return <div />
  }
}

const getStatusColor = (type: NotificationType): string => {
  switch (type) {
    case 'success':
    case 'confirmed':
    case 'viewTransaction':
      return 'text-green-500 border-green-500/20'
    case 'error':
    case 'failed':
      return 'text-red-500 border-red-500/20'
    case 'pending':
      return 'text-blue-500 border-blue-500/20'
    default:
      return 'text-gray-500 border-gray-500/20'
  }
}

export const Toast: FC<ToastProps> = ({ chainId, notification, onClose }) => {
  const { type, title, hash, id } = notification
  const chains = useChains()
  const statusColor = getStatusColor(type)
  const statusIcon = getStatusIcon(type)
  const chain = chains.find((c) => c.id === chainId)

  const handleClose = () => {
    if (onClose) {
      onClose(id)
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm',
        'min-w-[300px] max-w-[400px]',
        statusColor,
      )}
    >
      <div className="flex-shrink-0">{statusIcon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title || 'Transaction'}</p>
        {hash && (
          <a
            href={`${chain?.blockExplorers?.default.url}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs opacity-70 hover:opacity-100 transition-opacity underline"
          >
            View on Explorer
          </a>
        )}
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity cursor-pointer"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
