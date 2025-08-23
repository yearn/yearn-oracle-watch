import type React from 'react'
import { forwardRef } from 'react'

import type { ForwardedRef, ReactElement, ReactNode } from 'react'

const classNames = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(' ')

// Loading indicator extracted for reuse
const LoadingIndicator = () => (
  <span className="absolute inset-0 flex items-center justify-center">
    Loading...{' '}
  </span>
)

export type TButtonVariant =
  | 'filled'
  | 'outlined'
  | 'light'
  | 'inherit'
  | 'vault-select'
  | string

type ButtonAsButton = {
  as?: 'button'
  variant?: TButtonVariant
  shouldStopPropagation?: boolean
  isBusy?: boolean
  isDisabled?: boolean
  children?: ReactNode
  overrideStyling?: boolean
} & React.ComponentPropsWithoutRef<'button'>

type ButtonAsAnchor = {
  as: 'a'
  variant?: TButtonVariant
  shouldStopPropagation?: boolean
  isBusy?: boolean
  isDisabled?: boolean
  children?: ReactNode
  overrideStyling?: boolean
} & React.ComponentPropsWithoutRef<'a'>

export type TButton = ButtonAsButton | ButtonAsAnchor

export type TMouseEvent =
  | React.MouseEvent<HTMLButtonElement>
  | React.MouseEvent<HTMLAnchorElement>

// Shared click handler
function handleClick(
  event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  isBusy: boolean,
  shouldStopPropagation: boolean,
  onClick?: React.MouseEventHandler<any>
) {
  if (shouldStopPropagation) {
    event.stopPropagation()
  }
  if (!isBusy && onClick) {
    onClick(event)
  }
}

// eslint-disable-next-line react/display-name
const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, TButton>(
  function Button(
    props: TButton,
    ref: ForwardedRef<HTMLButtonElement | HTMLAnchorElement>
  ): ReactElement {
    const {
      children,
      as = 'button',
      variant = 'filled',
      shouldStopPropagation = false,
      isBusy = false,
      isDisabled = false,
      overrideStyling = false,
      ...rest
    } = props as TButton

    // Anchor element rendered as button for accessibility
    if (as === 'a') {
      const anchorProps = rest as React.ComponentPropsWithoutRef<'a'>
      return (
        <button
          type="button"
          {...anchorProps}
          ref={ref as ForwardedRef<HTMLButtonElement>}
          className={
            overrideStyling
              ? anchorProps.className
              : classNames(
                  'yearn--button flex-center cursor-pointer',
                  anchorProps.className
                )
          }
          aria-busy={isBusy}
          aria-disabled={isDisabled}
          disabled={isDisabled}
          tabIndex={isDisabled ? -1 : 0}
          onClick={(event) => {
            if (isDisabled) {
              event.preventDefault()
              return
            }
            handleClick(
              event,
              isBusy,
              shouldStopPropagation,
              anchorProps.onClick
            )
          }}
        >
          {children}
          {isBusy ? <LoadingIndicator /> : null}
        </button>
      )
    }

    const buttonProps = rest as React.ComponentPropsWithoutRef<'button'>

    return (
      <button
        type="button"
        {...buttonProps}
        ref={ref as ForwardedRef<HTMLButtonElement>}
        data-variant={variant}
        className={
          overrideStyling
            ? buttonProps.className
            : classNames(
                'yearn--button flex-center cursor-pointer',
                buttonProps.className
              )
        }
        aria-busy={isBusy}
        disabled={isDisabled || buttonProps.disabled}
        onClick={(event) => {
          handleClick(event, isBusy, shouldStopPropagation, buttonProps.onClick)
        }}
      >
        {children}
        {isBusy ? <LoadingIndicator /> : null}
      </button>
    )
  }
)

export default Button
