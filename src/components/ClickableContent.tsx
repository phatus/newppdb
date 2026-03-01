"use client";

import React from "react";

interface ClickableContentProps {
    content: string;
    className?: string;
}

export default function ClickableContent({ content, className }: ClickableContentProps) {
    // Regex to find URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Split content by URLs and map to elements
    const parts = content.split(urlRegex);

    return (
        <div className={className}>
            {parts.map((part, index) => {
                if (part.match(urlRegex)) {
                    return (
                        <a
                            key={index}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline break-all font-medium"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </a>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </div>
    );
}
