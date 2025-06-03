import { useState } from 'react'
import axiosClient from '../../api/axiosClient'
import { useNavigate, Link } from 'react-router-dom'
import '../../styles/forms.css'

export default function LoginForm() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const navigate = useNavigate()

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		const response = await axiosClient.post('/auth/login', { email, password })
		localStorage.setItem('token', response.data.token)
		navigate('/tasks')
	}

	return (
		<form className='form-container' onSubmit={handleLogin}>
			<h2>Вход</h2>
			<input
				type='email'
				placeholder='Email'
				required
				value={email}
				onChange={e => setEmail(e.target.value)}
			/>
			<input
				type='password'
				placeholder='Пароль'
				required
				value={password}
				onChange={e => setPassword(e.target.value)}
			/>
			<button type='submit'>Войти</button>
			<p>
				Нет аккаунта? <Link to='/register'>Регистрация</Link>
			</p>
		</form>
	)
}
