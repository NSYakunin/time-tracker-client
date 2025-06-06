import { useEffect, useRef, useState } from 'react'
import axiosClient from '../../api/axiosClient'
import '../../styles/tasks.css'
import { useNavigate } from 'react-router-dom'
import {
	LocalizationProvider,
	TimePicker,
	DatePicker,
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ru'

/* ---------- Интерфейсы ---------- */
interface Task {
	id: string
	title: string
	minutesSpent: number
	date: string
	progress: number
}
interface EditState {
	[taskId: string]: boolean
}

/* ---------- Компонент ---------- */
export default function TaskList() {
	const [tasks, setTasks] = useState<Task[]>([])

	/* поля новой задачи */
	const [title, setTitle] = useState('')
	const [time, setTime] = useState<Dayjs | null>(dayjs().hour(0).minute(0))
	const [date, setDate] = useState<Dayjs | null>(dayjs())

	/* редактирование */
	const [editMode, setEditMode] = useState<EditState>({})
	const [editTitle, setEditTitle] = useState('')
	const [editTime, setEditTime] = useState<Dayjs | null>(
		dayjs().hour(0).minute(0)
	)
	const [editDate, setEditDate] = useState<Dayjs | null>(dayjs())
	const [editProgress, setEditProgress] = useState(0)

	const editTitleRef = useRef<HTMLTextAreaElement | null>(null)

	const [userEmail, setUserEmail] = useState('')
	const navigate = useNavigate()

	/* ---------- API ---------- */
	const loadTasks = async () => {
		try {
			const [taskRes, userRes] = await Promise.all([
				axiosClient.get('/taskentries'),
				axiosClient.get('/auth/me'),
			])
			setTasks(taskRes.data)
			setUserEmail(userRes.data.email)
		} catch {
			navigate('/')
		}
	}
	useEffect(() => {
		loadTasks()
	}, [])

	/* ---------- helpers ---------- */
	const totalMinutes = (d: Dayjs | null) =>
		(d?.hour() ?? 0) * 60 + (d?.minute() ?? 0)

	const formatTime = (m: number) =>
		`${Math.floor(m / 60) ? `${Math.floor(m / 60)} ч.` : ''} ${m % 60} мин.`

	const autoGrow = (el: HTMLTextAreaElement | null) => {
		if (!el) return
		el.style.height = 'auto'
		el.style.height = `${el.scrollHeight}px`
	}

	const enableEditMode = (t: Task) => {
		setEditMode({ [t.id]: true })
		setEditTitle(t.title)
		setEditTime(
			dayjs()
				.hour(Math.floor(t.minutesSpent / 60))
				.minute(t.minutesSpent % 60)
		)
		setEditDate(dayjs(t.date))
		setEditProgress(t.progress)
		/* даём браузеру нарисовать <textarea>, после чего подгоняем высоту */
		setTimeout(() => autoGrow(editTitleRef.current), 0)
	}
	const disableEditMode = () => setEditMode({})

	/* ---------- CRUD ---------- */
	const handleAddTask = async () => {
		try {
			await axiosClient.post('/taskentries', {
				title,
				minutesSpent: totalMinutes(time),
				date: date?.format('YYYY-MM-DD'),
			})
			setTitle('')
			setTime(dayjs().hour(0).minute(0))
			setDate(dayjs())
			loadTasks()
		} catch {
			alert('Ошибка при добавлении задачи')
		}
	}

	const handleDeleteTask = async (id: string) => {
		if (!window.confirm('Удалить задачу?')) return
		try {
			await axiosClient.delete(`/taskentries/${id}`)
			loadTasks()
		} catch {
			alert('Ошибка при удалении')
		}
	}

	const handleSaveTask = async (task: Task) => {
		try {
			await axiosClient.put(`/taskentries/${task.id}`, {
				title: editTitle,
				minutesSpent: totalMinutes(editTime),
				date: editDate?.format('YYYY-MM-DD'),
				progress: editProgress,
			})
			disableEditMode()
			loadTasks()
		} catch {
			alert('Ошибка при редактировании')
		}
	}

	/* ---------- группировка + сортировка ---------- */
	const grouped: Record<string, Task[]> = {}
	tasks.forEach(t => {
		const iso = t.date.split('T')[0] // YYYY-MM-DD
		if (!grouped[iso]) grouped[iso] = []
		grouped[iso].push(t)
	})
	const sortedDays = Object.keys(grouped).sort() // ISO-строки &rarr; возрастание

	/* ---------- UI ---------- */
	return (
		<div className='tasks-container'>
			<h2>Мои задачи</h2>

			{/* панель пользователя */}
			<div className='user-info'>
				<span>
					<strong>Пользователь:</strong> {userEmail}
				</span>
				<span>
					<strong>Всего задач:</strong> {tasks.length}
				</span>
				<div>
					<button
						onClick={() => navigate('/settings')}
						className='settings-button'
					>
						Настройки
					</button>
					<button
						onClick={() => {
							localStorage.removeItem('token')
							navigate('/')
						}}
						className='logout-button'
					>
						Выйти
					</button>
				</div>
			</div>

			{/* форма добавления */}
			<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ru'>
				<div className='task-form'>
					<input
						placeholder='Название задачи'
						value={title}
						onChange={e => setTitle(e.target.value)}
						required
						style={{ flex: 2 }}
					/>

					<TimePicker
						ampm={false}
						value={time}
						onChange={setTime}
						slotProps={{ textField: { variant: 'outlined', size: 'small' } }}
						sx={{ flex: 1, minWidth: 110 }}
					/>

					<DatePicker
						value={date}
						onChange={setDate}
						format='DD.MM.YYYY'
						slotProps={{ textField: { variant: 'outlined', size: 'small' } }}
						sx={{ flex: 1, minWidth: 120 }}
					/>

					<button onClick={handleAddTask}>Добавить задачу</button>
				</div>
			</LocalizationProvider>

			{/* список по дням */}
			{sortedDays.map(iso => {
				const label = dayjs(iso).format('DD.MM.YYYY')
				return (
					<div key={iso} className='task-group'>
						<h3 className='day-heading'>{label}</h3>

						<table className='task-table'>
							<thead>
								<tr>
									<th className='smallHeaderCell fixed-40'>№</th>
									<th className='smallHeaderCell'>Название задачи</th>
									<th className='smallHeaderCell fixed-120'>
										Затрачено времени
									</th>
									<th className='smallHeaderCell fixed-120'>Дата</th>
									<th className='smallHeaderCell fixed-120'>Прогресс</th>
									<th className='smallHeaderCell fixed-160'>Действия</th>
								</tr>
							</thead>

							<tbody>
								{grouped[iso].map((task, idx) => {
									const editing = !!editMode[task.id]
									const barWidth = `${task.progress}%`

									return (
										<tr key={task.id} className='task-row'>
											<td className='fixed-40'>{idx + 1}</td>

											{!editing && (
												<>
													<td className='task-title-cell'>{task.title}</td>
													<td className='fixed-120'>
														{formatTime(task.minutesSpent)}
													</td>
													<td className='fixed-120 small-date'>
														{dayjs(task.date).format('DD.MM.YYYY')}
													</td>
													<td className='fixed-120'>
														<div className='progress-container edit-equal'>
															<div
																className='progress-bar'
																style={{ width: barWidth }}
															>
																{task.progress}%
															</div>
														</div>
													</td>
												</>
											)}

											{editing && (
												<>
													<td>
														<textarea
															ref={editTitleRef}
															className='edit-title'
															value={editTitle}
															rows={1}
															onChange={e => {
																setEditTitle(e.target.value)
																autoGrow(e.target)
															}}
														/>
													</td>
													<td className='fixed-120'>
														<LocalizationProvider
															dateAdapter={AdapterDayjs}
															adapterLocale='ru'
														>
															<TimePicker
																ampm={false}
																value={editTime}
																onChange={setEditTime}
																slotProps={{
																	textField: {
																		variant: 'outlined',
																		size: 'small',
																	},
																}}
															/>
														</LocalizationProvider>
													</td>
													<td className='fixed-120'>
														<LocalizationProvider
															dateAdapter={AdapterDayjs}
															adapterLocale='ru'
														>
															<DatePicker
																value={editDate}
																onChange={setEditDate}
																format='DD.MM.YYYY'
																slotProps={{
																	textField: {
																		variant: 'outlined',
																		size: 'small',
																	},
																}}
															/>
														</LocalizationProvider>
													</td>
													<td className='fixed-120'>
														<div className='progress-container edit-equal'>
															<div
																className='progress-bar'
																style={{ width: `${editProgress}%` }}
															>
																{editProgress}%
															</div>
														</div>
														<input
															type='range'
															min={0}
															max={100}
															value={editProgress}
															onChange={e => setEditProgress(+e.target.value)}
															className='progress-slider'
														/>
													</td>
												</>
											)}

											<td className='fixed-160'>
												{!editing ? (
													<div className='action-group'>
														<button
															onClick={() => enableEditMode(task)}
															className='icon-btn edit'
															title='Редактировать'
														>
															✏️
														</button>
														<button
															onClick={() => handleDeleteTask(task.id)}
															className='icon-btn delete'
															title='Удалить'
														>
															🗑️
														</button>
													</div>
												) : (
													<div className='action-group'>
														<button
															onClick={() => handleSaveTask(task)}
															className='action-btn save'
														>
															💾 Сохранить
														</button>
														<button
															onClick={disableEditMode}
															className='action-btn cancel'
														>
															✖ Отменить
														</button>
													</div>
												)}
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				)
			})}

			{/* запас под фиксированный футер */}
			<div className='tasks-bottom-spacer' />
		</div>
	)
}
