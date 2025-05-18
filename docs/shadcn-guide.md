# shadcn/ui Guide: Component Library for Modern React Applications

This document provides guidance on using shadcn/ui in the Ethereum Developer Toolkit, covering the latest features and best practices with React 19 and Tailwind CSS v4.

## What is shadcn/ui?

shadcn/ui is a collection of reusable, accessible components that you can copy and paste into your projects. Unlike traditional component libraries, shadcn/ui is not installed as a dependency—instead, the components become part of your codebase, giving you complete control over their implementation.

Key benefits:
- Complete customization freedom
- No external dependencies to manage
- Accessibility built-in through Radix UI primitives
- Beautiful design with Tailwind CSS
- Fully typed with TypeScript

## Latest Version Features (for React 19 and Tailwind v4)

### React 19 Compatibility

shadcn/ui fully supports React 19 features in its latest version. Key improvements include:

- Removing `forwardRef` in favor of direct ref props
- Support for React Server Components
- Compatible with React 19's new Actions system
- Support for document metadata in components

To use shadcn/ui with React 19:
```bash
npx shadcn@canary init
```

### Tailwind v4 Integration

The latest shadcn/ui works seamlessly with Tailwind v4, leveraging its new features:

- OKLCH color space for more perceptually uniform colors
- Container query support built-in (no plugin needed)
- 3D transform properties support
- Faster rendering through the new Oxide engine

Browser requirements for Tailwind v4:
- Safari 16.4+ (released March 2023)
- Chrome 111+
- Firefox 128+

## Core Component Architecture

shadcn/ui follows several key architectural patterns:

### 1. Root and Sub-Component Pattern

Components are structured as a collection of related sub-components:

```tsx
// Example pattern
<Dialog>
  <DialogTrigger />
  <DialogContent>
    <DialogHeader>
      <DialogTitle />
      <DialogDescription />
    </DialogHeader>
  </DialogContent>
</Dialog>
```

This composition-based pattern provides flexibility and maintainability.

### 2. Variant System

Components use variants to provide different visual styles without requiring custom CSS:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // More variants...
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        // More sizes...
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

This allows for consistent styling and easy customization.

### 3. Slot Pattern

The `Slot` component merges props to children, enabling composition:

```tsx
// Example usage
<Button asChild>
  <Link href="/about">About</Link>
</Button>
```

This pattern allows components to wrap other elements without losing their native behavior.

## Accessibility Features

shadcn/ui prioritizes accessibility through:

1. **ARIA Attributes**: Components automatically apply appropriate ARIA attributes
2. **Keyboard Navigation**: Full keyboard support for interactive elements
3. **Focus Management**: Proper focus handling in dialogs, popovers, etc.
4. **Screen Reader Support**: Semantic elements with appropriate roles and labels
5. **Color Contrast**: Default theme meets WCAG contrast requirements

Example of accessibility implementation:
```tsx
// Form component example with accessibility features
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input placeholder="example@email.com" {...field} />
      </FormControl>
      <FormDescription>
        We'll never share your email.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Component Customization

### Theme Customization

shadcn/ui uses CSS variables for theming with Tailwind:

```css
/* Example of theme customization */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  /* More variables... */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* Dark theme variables... */
}
```

### Component Modification

Since components are part of your codebase, you can modify them directly:

1. Modify the component file directly
2. Change variant styles in the component definition
3. Add new sub-components or props as needed
4. Override default styling with the `className` prop

## Best Practices

### 1. Component Organization

Keep a consistent organization for your shadcn/ui components:

```
components/
  ui/             # shadcn/ui base components
  custom/         # Your custom components
  [feature]/      # Feature-specific components
```

### 2. Component Composition

Build complex UI by composing smaller components:

```tsx
// Example of composition
export function DataCard({ title, data, icon }: DataCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        {icon && <div className="rounded-full p-2 bg-muted">{icon}</div>}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data}
      </CardContent>
    </Card>
  )
}
```

### 3. Form Implementation

Use the Form components with React Hook Form for type-safe forms:

```tsx
// Form setup
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    username: "",
    email: "",
  },
})

// Form submission
function onSubmit(values: z.infer<typeof formSchema>) {
  // Handle submission
}
```

### 4. Handling Dark Mode

Implement dark mode using the built-in support:

```tsx
// Example theme provider setup
<ThemeProvider 
  attribute="class" 
  defaultTheme="system" 
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

## Integration with viem and Web3 Features

Here's how to combine shadcn/ui with viem for web3 functionality:

### 1. Transaction Form Example

```tsx
// Example of Ethereum transaction form with shadcn/ui
export function TransactionForm() {
  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      to: "",
      value: "",
      data: "",
    },
  })

  async function onSubmit(values: z.infer<typeof transactionSchema>) {
    try {
      const walletClient = useWalletClient()
      const hash = await walletClient.sendTransaction({
        to: values.to,
        value: parseEther(values.value),
        data: values.data ? values.data : undefined,
      })
      
      toast({
        title: "Transaction sent",
        description: `Hash: ${hash}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction failed",
        description: error.message,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To Address</FormLabel>
              <FormControl>
                <Input placeholder="0x..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Other form fields */}
        <Button type="submit">Send Transaction</Button>
      </form>
    </Form>
  )
}
```

### 2. Calldata Display Component

```tsx
// Example of Calldata display with shadcn/ui
export function CalldataDisplay({ data }: { data: string }) {
  const { functionName, args } = decodeFunctionData({
    abi: contractAbi,
    data,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{functionName || "Unknown Function"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {args?.map((arg, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <div className="font-medium">Argument {index + 1}</div>
              <div className="font-mono text-sm break-all">
                {typeof arg === 'object' 
                  ? JSON.stringify(arg) 
                  : arg.toString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

## Troubleshooting

### Common Issues

1. **Peer Dependency Issues with React 19**:
   - Use `--legacy-peer-deps` flag with npm
   - Or use `--force` with pnpm/yarn

2. **Styling Inconsistencies**:
   - Check for conflicting Tailwind classes
   - Ensure CSS variables are properly set in your globals.css
   - Check for specificity issues in custom styles

3. **Component Not Working As Expected**:
   - Check for proper component composition
   - Verify all required props are provided
   - Check console for warnings about missing ARIA attributes

## Resources

- [Official shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [React 19 Compatibility](https://ui.shadcn.com/docs/react-19)
- [Tailwind v4 Integration](https://ui.shadcn.com/docs/tailwind-v4)
- [shadcn/ui GitHub Repository](https://github.com/shadcn-ui/ui)
- [Radix UI Documentation](https://www.radix-ui.com/primitives/docs/overview/introduction)

## Conclusion

shadcn/ui provides a powerful foundation for building accessible, customizable interfaces for Ethereum developer tools. By combining it with viem for blockchain interactions, you can create a seamless and user-friendly experience for your Ethereum Developer Toolkit.