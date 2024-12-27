"use client";

import React, { useState, useCallback } from "react";
import { Textarea } from "@nextui-org/react";

interface BulletedTextAreaProps {
    value?: string;
    onValueChange?: (value: string) => void;
    classNames?: {
        input?: string;
        inputWrapper?: string;
    };
}

export default function BulletedTextArea({
    value: initialValue = "• ",
    onValueChange,
    classNames,
}: BulletedTextAreaProps) {
    const [content, setContent] = useState(initialValue);

    const handleChange = useCallback(
        (value: string) => {
            const lines = value.split("\n");

            const processedLines = lines.map((line, index) => {
                if (line.startsWith("• ")) return line;
                return index === lines.length - 1 && line === "" ? "" : `• ${line}`;
            });

            const newContent = processedLines.join("\n");
            setContent(newContent);
            if (onValueChange) {
                onValueChange(newContent);
            }
        },
        [onValueChange]
    );

    const handleKeyDown = useCallback(
        (e: any) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const newContent = content + "\n• ";
                setContent(newContent);
                if (onValueChange) {
                    onValueChange(newContent);
                }
            } else if (e.key === "Backspace" && content.endsWith("\n• ")) {
                e.preventDefault();
                const newContent = content.slice(0, -3);
                setContent(newContent);
                if (onValueChange) {
                    onValueChange(newContent);
                }
            }
        },
        [content, onValueChange]
    );

    return (
        <Textarea
            value={content}
            onValueChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="• Enter a list here"
            minRows={5}
            classNames={{
                input: classNames?.input ?? undefined,
                inputWrapper: classNames?.inputWrapper ?? undefined,
            }}
        />
    );
}
