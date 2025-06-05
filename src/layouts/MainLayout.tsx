import Header from '../components/Header'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'
import '../styles/layout.css'

export default function MainLayout() {
	return (
		<div className='main-layout'>
			<Header />
			<main className='content'>
				<Outlet />
			</main>
			<Footer />
		</div>
	)
}
