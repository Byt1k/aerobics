import React from 'react'
import s from './index.module.scss'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import classNames from 'classnames'
import { routes } from '@/kernel/routes'
import { useCurrentUser } from '@/entities/user'
import Cookies from 'js-cookie'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/kernel/instance'

const navigation = [
    { name: 'Соревнования', link: routes.competitionsList() },
    { name: 'Пользователи', link: routes.users() },
]

export const RootLayout: React.FC = () => {
    const { pathname } = useLocation()
    const user = useCurrentUser()

    const logout = () => {
        Cookies.remove(ACCESS_TOKEN_KEY)
        Cookies.remove(REFRESH_TOKEN_KEY)
        window.location.href = routes.signIn()
    }

    if (!user) {
        return <Navigate to={routes.signIn()} />
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className={s.header}>
                <div className={classNames('container', s.wrapper)}>
                    <Link to={routes.competitionsList()} className={s.logo}>
                        <img src="/logo.png" alt="logo" />
                    </Link>
                    {user.is_admin && (
                        <nav className={s.menu}>
                            {navigation.map(item => (
                                <Link
                                    to={item.link}
                                    key={item.name}
                                    className={classNames(s.item, { [s.selected]: pathname.includes(item.link) })}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    )}
                    <div className={s.profile}>
                        <p>{user.username}</p>
                        <button className="text-red-400 text-sm" onClick={logout}>
                            Выйти
                        </button>
                        {/*<span>Секретарь</span>*/}
                    </div>
                </div>
            </header>

            <main className="grow py-10 container">
                <Outlet />
            </main>

            {/*<footer className="mt-auto">2</footer>*/}
        </div>
    )
}
