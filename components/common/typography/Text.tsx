import * as React from "react";

interface TextProps<T extends React.ElementType> {
    as?: T;
    children?: React.ReactNode;
}

export default function Text<T extends React.ElementType = "p">({as, className, ...props}:TextProps<T>& Omit<React.ComponentPropsWithoutRef<T>, keyof TextProps<T>>) {
    const Component = as || "p";
    return <Component className={`text-primary ${className}`} {...props} />
}