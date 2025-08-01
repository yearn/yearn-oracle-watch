## General Rules

- If you feel that you need more information to do your best work, please ask for it. If you are unsure about the context or the requirements, do not hesitate to request clarification.

## Documentation

- **Metadata Component PRD**: See `/docs/PRD_Metadata_Component.md` for comprehensive requirements for the universal metadata component system that displays vault data via middle mouse button clicks.

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

## SDK Development Workflow

When making changes to the SDK (`packages/sdk`), follow these steps in order:

1. Make your changes to the SDK source files
2. Run codegen: `cd packages/sdk && bun run codegen`
3. Build the SDK: `bun run build` (from the SDK directory)
4. Restart the development server to pick up the changes

This ensures that any GraphQL codegen updates are applied and the SDK is properly rebuilt before the app tries to use the new functionality.

## Git Commands for Recent Edits

When I ask you to review recent edits or git commits, you can use the following git commands to inspect changes:

- `git show <hash>`: View the full diff of a specific commit

You will then have access to the full diff.
