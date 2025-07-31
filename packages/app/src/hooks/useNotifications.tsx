import { useSnackbar } from 'notistack'
import { useCallback } from 'react'
import { useChainId } from 'wagmi'
import { Toast } from '../components/shared/Toast'

type NotificationType = 'success' | 'error' | 'pending'

export const useNotifications = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const chainId = useChainId()

  const addNotification = useCallback(
    (type: NotificationType, hash?: string, text?: string) => {
      const id = `${type}-${hash ?? Date.now()}`

      return enqueueSnackbar(
        <Toast
          chainId={chainId}
          onClose={() => closeSnackbar(id)}
          notification={{
            id,
            submittedAt: Date.now(),
            type,
            title: text,
            hash,
          }}
        />,
        {
          key: id,
        },
      )
    },
    [enqueueSnackbar, closeSnackbar, chainId],
  )

  const dismissNotification = useCallback(
    (key: string) => {
      closeSnackbar(key)
    },
    [closeSnackbar],
  )

  return {
    addNotification,
    dismissNotification,
  }
}
