## General Rules

- If you feel that you need more information to do your best work, please ask for it. If you are unsure about the context or the requirements, do not hesitate to request clarification.

## Button Component Architecture

When creating or modifying button components in this project, follow these patterns:

- **Base Button Component**: Use `Button.tsx` as the foundational component for all button functionality
- **Specialized Buttons**: Create wrapper components (like `TxButton.tsx` or `VaultSelectButton.tsx`) that compose the base Button component using `ComponentProps<typeof Button>`
- **Custom Styling**: When a button needs completely custom styling that conflicts with default Button styles, use the `overrideStyling={true}` prop to bypass default Button classes
- **Type Safety**: All specialized buttons should extend Button props using intersection types: `FC<CustomProps & ComponentProps<typeof Button>>`
- **Composition Pattern**: Always wrap the base Button component rather than duplicating button logic or reimplementing core functionality

Example specialized button structure:

```tsx
const CustomButton: FC<CustomProps & ComponentProps<typeof Button>> = ({
  customProp,
  className,
  ...props
}) => {
  return (
    <Button
      className={customClassName}
      overrideStyling={needsCustomStyling}
      {...props}
    >
      {customContent}
    </Button>
  )
}
```

## Installing components and using Bun

When installing components or running commands in this project, please follow these guidelines:

- `"preinstall": "npx only-allow bun",` is set in the package.json under scripts. Please use Bun for all commands that involve a package manager.
- when installing shadcn components, use `bunx shadcn@latest add <component-name>`
- After installing a shadcn component, it is necessary to change the import path for cn from `import { cn } from "@/lib/utils"` to `import { cn } from "@/utils/cn"`
