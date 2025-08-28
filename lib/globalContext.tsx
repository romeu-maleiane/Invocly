'use client'
import { createContext, ReactNode, useState } from "react";

type GlobalContextType = {
    remainingDocs: number | null
    setRemainingDocs: (value: number | null) => void
}
export const GlobalContext = createContext<GlobalContextType>({
    remainingDocs: null,
    setRemainingDocs: () => { },
})

export default function GlobalContextProvider ({children}: {children :ReactNode}) {
    const [remainingDocs, setRemainingDocs] = useState<number | null>(null)

    return (
        <GlobalContext.Provider value={{remainingDocs, setRemainingDocs}}>
            {children}
        </GlobalContext.Provider>
    )
}