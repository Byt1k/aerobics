import { use, useActionState } from 'react'
import s from './index.module.scss'
import Input from '@/shared/ui/input'
import Button from '@/shared/ui/button'
import { signInAction } from '../actions/sign-in'
import { UserContext } from '@/entities/user'
import { startPage } from '@/kernel/routes'
import { Navigate } from 'react-router-dom'

export interface FormState {
    username: string
    password: string
    error: null
}

export const SignInPage = () => {
    const { user } = use(UserContext)

    const initialState: FormState = {
        username: '',
        password: '',
        error: null,
    }

    const [state, action, isPending] = useActionState(
        signInAction,
        initialState,
    )

    if (user) {
        return <Navigate to={startPage()} />
    }


    return (
        <div className={s.wrapper}>
            <img src="/logo.png" alt="logo" />
            <p className={s.title}>
                Федерация спортивной аэробики <br />
                Свердловской области
            </p>
            <form action={action} className={s.form}>
                {/*<p className={s.role}>Роль</p>*/}
                <Input
                    label="ФИО"
                    name="username"
                    defaultValue={state.username}
                    required
                    isError={!!state.error}
                />
                <Input
                    label="Пароль"
                    name="password"
                    isPassword
                    required
                    defaultValue={state.password}
                    errorMessage={state.error}
                />
                <Button disabled={isPending} type="submit">
                    Войти
                </Button>
            </form>
        </div>
    )
}
