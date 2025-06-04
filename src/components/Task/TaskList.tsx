import { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient'
import '../../styles/tasks.css'
import { useNavigate } from 'react-router-dom'

// Интерфейс задачи с бэкенда
interface Task {
	id: string
	title: string
	minutesSpent: number
	date: string
	progress: number
}

// Доп. интерфейс для редактирования
interface EditState {
	[taskId: string]: boolean
}

export default function TaskList() {
	const [tasks, setTasks] = useState<Task[]>([])
	const [title, setTitle] = useState('')
	const [hours, setHours] = useState(0)
	const [minutes, setMinutes] = useState(0)
	const [date, setDate] = useState('')

	// Для хранения, какая задача сейчас находится в режиме редактирования
	const [editMode, setEditMode] = useState<EditState>({})
	// Поля для редактирования
	const [editTitle, setEditTitle] = useState('')
	const [editHours, setEditHours] = useState(0)
	const [editMinutes, setEditMinutes] = useState(0)
	const [editDate, setEditDate] = useState('')
	const [editProgress, setEditProgress] = useState(0)

	const [userEmail, setUserEmail] = useState('')
	const navigate = useNavigate()

	// Загрузка задач и информации о пользователе
	const loadTasks = async () => {
		try {
			const tasksRes = await axiosClient.get('/taskentries')
			setTasks(tasksRes.data)

			const userRes = await axiosClient.get('/auth/me')
			setUserEmail(userRes.data.email)
		} catch (err) {
			// Не авторизован - выкидываем на логин
			navigate('/')
		}
	}

	useEffect(() => {
		loadTasks()
	}, [])

	// Добавление новой задачи с сохранением времени в минутах
	const handleAddTask = async () => {
		try {
			const totalMinutes = hours * 60 + minutes
			await axiosClient.post('/taskentries', {
				title,
				minutesSpent: totalMinutes,
				date,
			})
			setTitle('')
			setHours(0)
			setMinutes(0)
			setDate('')
			loadTasks()
		} catch (err) {
			alert('Ошибка при добавлении задачи')
		}
	}

	// Удаление задачи по ID (с подтверждением)
	const handleDeleteTask = async (id: string) => {
		if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
			try {
				await axiosClient.delete(`/taskentries/${id}`)
				loadTasks()
			} catch (err) {
				alert('Ошибка при удалении задачи')
			}
		}
	}

	// Форматирование времени задачи для пользователя
	const formatTime = (minutes: number) => {
		const hrs = Math.floor(minutes / 60)
		const mins = minutes % 60
		return `${hrs > 0 ? `${hrs} ч.` : ''} ${mins} мин.`
	}

	// Включаем режим редактирования для конкретной задачи
	const enableEditMode = (task: Task) => {
		setEditMode({ ...editMode, [task.id]: true })

		// Заполняем поля
		setEditTitle(task.title)
		const hrs = Math.floor(task.minutesSpent / 60)
		const mins = task.minutesSpent % 60
		setEditHours(hrs)
		setEditMinutes(mins)
		setEditDate(task.date.split('T')[0]) // "2023-06-01..."
		setEditProgress(task.progress)
	}

	// Отключаем режим редактирования (без сохранения)
	const disableEditMode = (taskId: string) => {
		setEditMode({ ...editMode, [taskId]: false })
	}

	// Сохраняем изменения задачи
	const handleSaveTask = async (task: Task) => {
		try {
			const totalMinutes = editHours * 60 + editMinutes
			await axiosClient.put(`/taskentries/${task.id}`, {
				title: editTitle,
				minutesSpent: totalMinutes,
				date: editDate,
				progress: editProgress,
			})
			setEditMode({ ...editMode, [task.id]: false })
			loadTasks()
		} catch (err) {
			alert('Ошибка при редактировании задачи')
		}
	}

	// Выход из системы (логин)
	const handleLogout = () => {
		localStorage.removeItem('token')
		navigate('/')
	}

	// Переход на страницу настроек
	const handleSettings = () => {
		navigate('/settings')
	}

	return (
		<div className='tasks-container'>
			<h2>Мои задачи</h2>

			<div className='user-info'>
				<span>
					<strong>Пользователь:</strong> {userEmail}
				</span>
				<span>
					<strong>Всего задач:</strong> {tasks.length}
				</span>
				<div>
					<button onClick={handleSettings} className='settings-button'>
						Настройки
					</button>
					<button onClick={handleLogout} className='logout-button'>
						Выйти
					</button>
				</div>
			</div>

			<div className='task-form'>
				<input
					placeholder='Название задачи'
					value={title}
					onChange={e => setTitle(e.target.value)}
					required
				/>

				<div className='time-inputs'>
					<input
						type='number'
						min={0}
						placeholder='Часы'
						value={hours}
						onChange={e => setHours(Number(e.target.value))}
					/>
					<input
						type='number'
						min={0}
						max={59}
						placeholder='Минуты'
						value={minutes}
						onChange={e => setMinutes(Number(e.target.value))}
					/>
				</div>

				<input
					type='date'
					value={date}
					onChange={e => setDate(e.target.value)}
					required
				/>

				<button onClick={handleAddTask}>Добавить задачу</button>
			</div>

			<table className='task-table'>
				<thead>
					<tr>
						<th>№</th>
						<th>Название задачи</th>
						<th>Затрачено времени</th>
						<th>Дата</th>
						<th>Прогресс</th>
						<th>Действия</th>
					</tr>
				</thead>
				<tbody>
					{tasks.map((task, index) => {
						const isEditing = editMode[task.id] || false

						// Анимация полосы прогресса (частично закрытая задача)
						const progressWidth = `${task.progress}%`

						return (
							<tr key={task.id} className='task-row'>
								<td>{index + 1}</td>

								{/* Если режим редактирования, показываем поля ввода */}
								{!isEditing ? (
									<>
										<td>{task.title}</td>
										<td>{formatTime(task.minutesSpent)}</td>
										<td>{new Date(task.date).toLocaleDateString()}</td>
										<td>
											{/* Прогресс с визуальной полосой */}
											<div className='progress-container'>
												<div
													className='progress-bar'
													style={{ width: progressWidth }}
												>
													{task.progress}%
												</div>
											</div>
										</td>
									</>
								) : (
									<>
										<td>
											<input
												value={editTitle}
												onChange={e => setEditTitle(e.target.value)}
											/>
										</td>
										<td>
											<input
												type='number'
												min={0}
												placeholder='Часы'
												value={editHours}
												onChange={e => setEditHours(Number(e.target.value))}
											/>
											<input
												type='number'
												min={0}
												max={59}
												placeholder='Минуты'
												value={editMinutes}
												onChange={e => setEditMinutes(Number(e.target.value))}
											/>
										</td>
										<td>
											<input
												type='date'
												value={editDate}
												onChange={e => setEditDate(e.target.value)}
											/>
										</td>
										<td>
											<input
												type='number'
												min={0}
												max={100}
												value={editProgress}
												onChange={e => setEditProgress(Number(e.target.value))}
											/>
										</td>
									</>
								)}

								<td>
									{/* Если режим редактирования, показываем кнопки Сохранить/Отменить */}
									{!isEditing ? (
										<>
											<button
												onClick={() => enableEditMode(task)}
												className='edit-button'
											>
												✏️
											</button>
											<button
												onClick={() => handleDeleteTask(task.id)}
												className='delete-button'
											>
												🗑️
											</button>
										</>
									) : (
										<>
											<button
												onClick={() => handleSaveTask(task)}
												className='save-button'
											>
												Сохранить
											</button>
											<button
												onClick={() => disableEditMode(task.id)}
												className='cancel-button'
											>
												Отменить
											</button>
										</>
									)}
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}
