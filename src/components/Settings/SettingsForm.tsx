import { useState, useEffect } from 'react'
import axiosClient from '../../api/axiosClient'
import { useNavigate } from 'react-router-dom'
import '../../styles/forms.css'

export default function SettingsForm() {
	const [login, setLogin] = useState('')
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [newEmail, setNewEmail] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [newLogin, setNewLogin] = useState('')
	const [newFirstName, setNewFirstName] = useState('')
	const [newLastName, setNewLastName] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		const loadUser = async () => {
			try {
				const res = await axiosClient.get('/auth/me')
				setLogin(res.data.login)
				setFirstName(res.data.firstName)
				setLastName(res.data.lastName)
			} catch (err) {
				navigate('/')
			}
		}
		loadUser()
	}, [navigate])

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const response = await axiosClient.put('/user/update', {
				newEmail,
				newPassword,
				newLogin,
				newFirstName,
				newLastName,
			})

			if (response.data.token) {
				localStorage.setItem('token', response.data.token)
			}

			alert('Данные успешно обновлены!')
			navigate('/tasks') // После обновления сразу на задачи
		} catch (error: any) {
			alert(error.response?.data || 'Ошибка при обновлении данных')
		}
	}

	return (
		<form className='form-container' onSubmit={handleUpdate}>
			<h2>Настройки пользователя</h2>
			<p>
				Логин: <strong>{login}</strong>
			</p>
			<p>
				Имя: <strong>{firstName}</strong>
			</p>
			<p>
				Фамилия: <strong>{lastName}</strong>
			</p>

			<input
				type='text'
				placeholder='Новый логин'
				value={newLogin}
				onChange={e => setNewLogin(e.target.value)}
			/>
			<input
				type='text'
				placeholder='Новое имя'
				value={newFirstName}
				onChange={e => setNewFirstName(e.target.value)}
			/>
			<input
				type='text'
				placeholder='Новая фамилия'
				value={newLastName}
				onChange={e => setNewLastName(e.target.value)}
			/>
			<input
				type='email'
				placeholder='Новый Email'
				value={newEmail}
				onChange={e => setNewEmail(e.target.value)}
			/>
			<input
				type='password'
				placeholder='Новый пароль'
				value={newPassword}
				onChange={e => setNewPassword(e.target.value)}
			/>

			<button type='submit'>Обновить</button>
		</form>
	)
}
