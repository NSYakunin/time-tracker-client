import { useState } from 'react'
import axiosClient from '../../api/axiosClient'
import { Link, useNavigate } from 'react-router-dom'
import '../../styles/forms.css'

export default function RegisterForm() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [login, setLogin] = useState('')
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const navigate = useNavigate()

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			await axiosClient.post('/auth/register', {
				email,
				password,
				login,
				firstName,
				lastName,
			})
			alert('Регистрация успешна! Теперь вы можете войти.')
			navigate('/')
		} catch (error: any) {
			alert(error.response?.data || 'Ошибка при регистрации')
		}
	}

	return (
		<form className='form-container' onSubmit={handleRegister}>
			<h2>Регистрация</h2>
			<input
				type='email'
				placeholder='Email'
				required
				value={email}
				onChange={e => setEmail(e.target.value)}
			/>
			<input
				type='text'
				placeholder='Логин'
				required
				value={login}
				onChange={e => setLogin(e.target.value)}
			/>
			<input
				type='text'
				placeholder='Имя'
				required
				value={firstName}
				onChange={e => setFirstName(e.target.value)}
			/>
			<input
				type='text'
				placeholder='Фамилия'
				required
				value={lastName}
				onChange={e => setLastName(e.target.value)}
			/>
			<input
				type='password'
				placeholder='Пароль'
				required
				value={password}
				onChange={e => setPassword(e.target.value)}
			/>
			<button type='submit'>Зарегистрироваться</button>
			<p>
				Уже есть аккаунт? <Link to='/'>Войти</Link>
			</p>
		</form>
	)
}
