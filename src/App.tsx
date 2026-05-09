import { Link } from 'react-router-dom'
import AppRouter from './router/AppRouter'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-6">
          <span className="font-bold text-lg text-indigo-600">🍽 Food Store</span>
          <Link to="/categorias" className="text-gray-600 hover:text-indigo-600 font-medium">Categorías</Link>
          <Link to="/ingredientes" className="text-gray-600 hover:text-indigo-600 font-medium">Ingredientes</Link>
          <Link to="/productos" className="text-gray-600 hover:text-indigo-600 font-medium">Productos</Link>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <AppRouter />
      </main>
    </div>
  )
}

export default App