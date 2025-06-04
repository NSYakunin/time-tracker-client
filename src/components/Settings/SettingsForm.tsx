import { useState, useEffect } from 'react'
import axiosClient from '../../api/axiosClient'
import { useNavigate } from 'react-router-dom'
import '../../styles/forms.css'

export default function SettingsForm() {
	const [email, setEmail] = useState('')
	const [newEmail, setNewEmail] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const navigate = useNavigate()

	// Загрузим текущего пользователя (email) для отображения
	useEffect(() => {
		const loadUser = async () => {
			try {
				const res = await axiosClient.get('/auth/me')
				setEmail(res.data.email)
			} catch (err) {
				// Если не авторизован, выкидываем на логин
				navigate('/')
			}
		}
		loadUser()
	}, [navigate])

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			// Отправляем новые данные на сервер
			const response = await axiosClient.put('/user/update', {
				newEmail,
				newPassword,
			})

			// Сервер вернёт новый токен, если email был обновлён
			if (response.data.token) {
				localStorage.setItem('token', response.data.token)
			}

			alert('Данные успешно обновлены!')
			// Сбросим поля
			setNewEmail('')
			setNewPassword('')
			// Перезагрузим страницу или заново запросим email
			const res = await axiosClient.get('/auth/me')
			setEmail(res.data.email)
		} catch (error: any) {
			alert(error.response?.data || 'Ошибка при обновлении данных')
		}
	}

	return (
		<form className='form-container' onSubmit={handleUpdate}>
			<h2>Настройки пользователя</h2>
			<p>
				Текущий email: <strong>{email}</strong>
			</p>

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
