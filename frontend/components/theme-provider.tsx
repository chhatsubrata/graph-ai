'use client';

import React from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";


const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <NextThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </NextThemeProvider>
    )
}

export default ThemeProvider