import { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient'
import '../../styles/tasks.css'

// Интерфейс задачи с бэкенда
interface Task {
	id: string
	title: string
	minutesSpent: number
	date: string
}

export default function TaskList() {
	const [tasks, setTasks] = useState<Task[]>([])
	const [title, setTitle] = useState('')
	const [hours, setHours] = useState(0)
	const [minutes, setMinutes] = useState(0)
	const [date, setDate] = useState('')

	const [userEmail, setUserEmail] = useState('')

	// Загрузка задач и информации о пользователе
	const loadTasks = async () => {
		const tasksRes = await axiosClient.get('/taskentries')
		setTasks(tasksRes.data)

		const userRes = await axiosClient.get('/auth/me')
		setUserEmail(userRes.data.email)
	}

	useEffect(() => {
		loadTasks()
	}, [])

	// Добавление новой задачи с сохранением времени в минутах
	const handleAddTask = async () => {
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
	}

	// Удаление задачи по ID
	const handleDeleteTask = async (id: string) => {
		await axiosClient.delete(`/taskentries/${id}`)
		loadTasks()
	}

	// Форматирование времени задачи для пользователя
	const formatTime = (minutes: number) => {
		const hrs = Math.floor(minutes / 60)
		const mins = minutes % 60
		return `${hrs > 0 ? `${hrs} ч.` : ''} ${mins} мин.`
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
						<th>Удалить</th>
					</tr>
				</thead>
				<tbody>
					{tasks.map((task, index) => (
						<tr key={task.id}>
							<td>{index + 1}</td>
							<td>{task.title}</td>
							<td>{formatTime(task.minutesSpent)}</td>
							<td>{new Date(task.date).toLocaleDateString()}</td>
							<td>
								<button
									onClick={() => handleDeleteTask(task.id)}
									className='delete-button'
								>
									🗑️
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
