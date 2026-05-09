import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { Categoria } from '../types'
import CategoriaModal from '../components/CategoriaModal'
import Button from '../components/Button'

export default function CategoriasPage() {
  const queryClient = useQueryClient()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)

  const { data: categorias = [], isLoading, isError } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await client.get('/categorias/')
      return res.data as Categoria[]
    },
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => client.delete(`/categorias/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }),
  })

  const abrirModalCrear = () => { setEditando(null); setModalAbierto(true) }
  const abrirModalEditar = (cat: Categoria) => { setEditando(cat); setModalAbierto(true) }
  const cerrarModal = () => { setModalAbierto(false); setEditando(null) }

  if (isLoading) return <p className="text-gray-500">Cargando...</p>
  if (isError) return <p className="text-red-500">Error al cargar categorías</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        <Button onClick={abrirModalCrear}>+ Nueva Categoría</Button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Descripción</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categorias.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500">{cat.id}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{cat.nombre}</td>
                <td className="px-6 py-4 text-gray-500">{cat.descripcion ?? '-'}</td>
                <td className="px-6 py-4 flex gap-2">
                  <Button variant="ghost" onClick={() => abrirModalEditar(cat)}>Editar</Button>
                  <Button variant="danger" onClick={() => eliminar.mutate(cat.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No hay categorías todavía</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && <CategoriaModal editando={editando} onClose={cerrarModal} />}
    </div>
  )
}