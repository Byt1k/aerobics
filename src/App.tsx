import { Route, Routes } from 'react-router-dom'
import { routes } from '@/kernel/routes'
import { SignInPage } from '@/pages/sign-in'
import { UsersPage } from '@/pages/users'
import { CompetitionsListPage } from '@/pages/competitions'
import { ToastContainer } from 'react-toastify'
import { useEffect, useState } from 'react'
import { getMe } from '@/entities/user'
import { UserContext, UserType } from '@/entities/user'
import { CompetitionPage } from '@/pages/competition'
import { RootLayout } from './features/layout'

function App() {
    const [user, setUser] = useState<UserType | null>(null)
    const [isFetching, setIsFetching] = useState(true)

    useEffect(() => {
       getMe()
           .then(res => setUser(res))
           .catch(() => setUser(null))
           .finally(() => setIsFetching(false))
    }, [])

    if (isFetching) {
        return 'Загрузка...'
    }

    return (
        <>
            <UserContext.Provider value={user}>
                <Routes>
                    <Route path="/" element={<RootLayout />}>
                        <Route path={routes.users()} element={<UsersPage />} />
                        <Route path={routes.competitionsList()} element={<CompetitionsListPage />} />
                        <Route path={routes.competition()} element={<CompetitionPage />} />
                    </Route>
                    <Route path={routes.signIn()} element={<SignInPage />} />
                    <Route path={'/*'} element={'404'} />
                </Routes>
            <ToastContainer position="top-right" />
            </UserContext.Provider>
        </>
    )
}

export default App
