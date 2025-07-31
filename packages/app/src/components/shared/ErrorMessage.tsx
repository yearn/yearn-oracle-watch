import { cn } from '@/utils/cn'
import { FC } from 'react'

interface ErrorMessageProps {
  className?: string
  message: string
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ message, className }) => {
  return <div className={cn('text-red-500 text-sm', className)}>{message}</div>
}
