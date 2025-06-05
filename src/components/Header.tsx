import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'
import '../styles/header.css'

export default function Header() {
	const [login, setLogin] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		const loadUser = async () => {
			try {
				const res = await axiosClient.get('/auth/me')
				setLogin(res.data.login)
			} catch {
				setLogin('')
			}
		}
		loadUser()
	}, [])

	const handleLogout = () => {
		localStorage.removeItem('token')
		navigate('/')
	}

	return (
		<header className='header'>
			<Link className='logo' to='/tasks'>
				Главный экран
			</Link>
			{login && (
				<div className='user-actions'>
					<span className='login'>{login}</span>
					<Link className='settings-btn' to='/settings'>
						Настройки
					</Link>
					<button className='logout-btn' onClick={handleLogout}>
						Выйти
					</button>
				</div>
			)}
		</header>
	)
}
