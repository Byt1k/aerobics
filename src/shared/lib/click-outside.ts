import { useEffect, useRef, useState } from 'react'

export const useClickOutside = () => {
    const [active, setActive] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const listener = (e: DocumentEventMap['click']) => {
            if (!ref.current?.contains(e.target as Node)) {
                setActive(false)
            }
        }

        document.addEventListener('click', listener)
        return () => document.removeEventListener('click', listener)
    }, [])

    return { ref, active, setActive }
}
