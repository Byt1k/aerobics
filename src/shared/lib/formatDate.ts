export const formatDate = (date: string | null) => {
    if (!date) {
        return null
    }

    return new Date(date).toLocaleDateString()
}