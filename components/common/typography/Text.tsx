import * as React from "react";

interface TextProps<T extends React.ElementType> {
    as?: T;
    children?: React.ReactNode;
    className?: string;
}

type HeadingElements = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export default function Text<T extends React.ElementType = "p">({
                                                                    as, className, ...props
                                                                }: TextProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof TextProps<T>>) {
    const Component = as || "p";
    return <Component className={`text-primary ${className}`} {...props} />;
}

interface HeadingProps<T extends React.ElementType> {
    as?: T;
    children?: React.ReactNode;
    className?: string;
}

export function Heading<T extends HeadingElements = "h1">({
                                                              as,
                                                              className,
                                                              ...props
                                                          }: HeadingProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof HeadingProps<T>>) {
    const Component = as || "h1";
    return <Component className={`text-primary font-bold text-2xl ${className}`} {...props} />;
}

