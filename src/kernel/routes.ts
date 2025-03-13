export const routes = {
    signIn: () => '/sign-in',
    users: () => '/users',
    competitionsList: () => '/competitions',
    competition: (params?: { id: string }) => routeReplacer('/competitions/:id', params),
}

function routeReplacer(route: string, params?: Record<string, string>): string {
    let result = route

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            result = result.replace(`:${key}`, value)
        })
    }

    return result
}
