import { Routes, Route } from 'react-router-dom'
import CategoriasPage from '../pages/CategoriasPage'
import IngredientesPage from '../pages/IngredientesPage'
import ProductosPage from '../pages/ProductosPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<CategoriasPage />} />
      <Route path="/categorias" element={<CategoriasPage />} />
      <Route path="/ingredientes" element={<IngredientesPage />} />
      <Route path="/productos" element={<ProductosPage />} />
    </Routes>
  )
}