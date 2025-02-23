// src/components/ui/alert.tsx
import * as React from "react"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className = "", variant = "default", ...props }, ref) => {
        const baseStyles = "relative w-full rounded-lg border p-4"
        const variantStyles = {
            default: "bg-white text-gray-900",
            destructive: "border-red-500/50 text-red-600 dark:border-red-500 [&>svg]:text-red-600"
        }

        return (
            <div
                ref={ref}
                role="alert"
                className={`${baseStyles} ${variantStyles[variant]} ${className}`}
                {...props}
            />
        )
    }
)
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
    <p
        ref={ref}
        className={`mt-1 text-sm [&_p]:leading-relaxed ${className}`}
        {...props}
    />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }