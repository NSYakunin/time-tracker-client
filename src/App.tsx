import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TasksPage from './pages/TasksPage'
import SettingsPage from './pages/SettingsPage'
import MainLayout from './layouts/MainLayout'

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<LoginPage />} />
				<Route path='/register' element={<RegisterPage />} />
				<Route element={<MainLayout />}>
					<Route path='/tasks' element={<TasksPage />} />
					<Route path='/settings' element={<SettingsPage />} />
				</Route>
			</Routes>
		</Router>
	)
}
