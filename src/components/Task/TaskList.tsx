import { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient'

interface Task {
	id: string
	title: string
	hoursSpent: number
	date: string
}

export default function TaskList() {
	const [tasks, setTasks] = useState<Task[]>([])

	useEffect(() => {
		axiosClient.get('/taskentries').then(response => setTasks(response.data))
	}, [])

	return (
		<div style={{ padding: '20px' }}>
			<h2>Мои задачи</h2>
			<ul>
				{tasks.map(task => (
					<li key={task.id}>
						{task.title} - {task.hoursSpent} ч. (
						{new Date(task.date).toLocaleDateString()})
					</li>
				))}
			</ul>
		</div>
	)
}
