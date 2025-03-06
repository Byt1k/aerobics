export const formatQueryParams = (filter?: object) => {
    const query = []

    if (typeof filter == 'object') {
        for (const [key, val] of Object.entries(filter)) {
            if ((typeof val === 'string' || typeof val === 'number') && val) {
                query.push(key + '=' + val)
            }
            if (typeof val === 'boolean') {
                query.push(key + '=' + val)
            }
            if (Array.isArray(val) && val.length > 0) {
                val.map(item => {
                    if (
                        (typeof item === 'string' ||
                            typeof item === 'number') &&
                        item
                    ) {
                        query.push(key + '=' + item)
                    }
                    if (typeof item === 'boolean') {
                        query.push(key + '=' + item)
                    }
                })
            }
        }
    }

    if (query.length > 0) {
        return '?' + query.join('&')
    }

    return ''
}
