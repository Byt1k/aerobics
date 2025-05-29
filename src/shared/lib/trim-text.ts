export const trimText = (text: string, limit: number): string => {
    if (text.length > limit) {
        const res = text.split('').splice(0, limit)
        return [...res, '...'].join('')
    } else {
        return text
    }
}
