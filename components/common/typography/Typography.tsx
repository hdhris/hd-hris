import * as React from "react";
import {cn} from "@nextui-org/react";
import {ReactNode} from "react";

interface TextProps<T extends React.ElementType> {
    as?: T;
    children?: React.ReactNode;
    className?: string;
}

type HeadingElements = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export default function Typography<T extends React.ElementType = "p">({
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

type TitleProps = {
    children?: React.ReactNode;
    heading: ReactNode;
    subHeading: ReactNode;
    className?: string;
    classNames?: {
        base?: string;
        heading?: string;
        subHeading?: string;
    }
}

interface SectionProps {
    title: ReactNode;
    subtitle: ReactNode;
    children?: React.ReactNode;
    className?: string
    classNames?: TitleProps['classNames']
}
export const Section: React.FC<SectionProps> = ({title, subtitle, children, classNames, className}) => (
    <div className={cn('ms-10 space-y-5', className)}>
    <Title heading={title} subHeading={subtitle} classNames={classNames}>
        {children}
    </Title>
</div>);
export function Title({heading, subHeading, className, classNames, children}: TitleProps) {
    return (
        <div className={cn('flex justify-between items-center', className)}>
            <div className={cn(classNames?.base)}>
                <Heading as='h2' className={cn('text-medium', classNames?.heading)}>
                    {heading}
                </Heading>
                <Typography className={cn('text-sm', classNames?.subHeading)}>
                    {subHeading}
                </Typography>
            </div>

            <div>
                {children}
            </div>
        </div>
    );
}

interface TextWithBoldProps {
    text: string;
}

export function boldSurroundedText(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Use <strong> for better semantics
}