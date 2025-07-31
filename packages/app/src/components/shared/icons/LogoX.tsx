import type { ReactElement } from 'react'

export function LogoX(props: React.SVGProps<SVGSVGElement>): ReactElement {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5 align-middle"
    >
      <path d="M17.53 3H21.5l-7.19 8.21L22.75 21h-6.56l-5.18-6.16L4.47 21H0.5l7.67-8.76L1.25 3h6.69l4.67 5.55L17.53 3zm-1.15 15.19h1.82L6.62 4.62H4.68l11.7 13.57z" />
    </svg>
  )
}
