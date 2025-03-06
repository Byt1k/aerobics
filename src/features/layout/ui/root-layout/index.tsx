import React, { use } from 'react'
import s from './index.module.scss'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import classNames from 'classnames'
import { routes } from '@/kernel/routes'
import { UserContext } from '@/entities/user'

const navigation = [
    { name: 'Пользователи', link: routes.users() },
    { name: 'Соревнования', link: routes.competitionsList() },
]

export const RootLayout: React.FC = () => {
    const { pathname } = useLocation()
    const { user } = use(UserContext)

    if (!user) {
        return <Navigate to={routes.signIn()} />
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className={s.header}>
                <div className={classNames('container', s.wrapper)}>
                    <Link to="/" className={s.logo}>
                        <img src="/logo.png" alt="logo" />
                    </Link>
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
                    <div className={s.profile}>
                        <p>{user.username}</p>
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

interface Props {
    className?: string
}
