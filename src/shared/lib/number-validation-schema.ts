export const validateNumber = (value: string): string => {
    return value
        .replace(/[^.\d]+/g, "")
        .replace(/^([^\.]*\.)|\./g, '$1')
}