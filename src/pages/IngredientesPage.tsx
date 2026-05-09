import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { Ingrediente } from '../types'
import IngredienteModal from '../components/IngredienteModal'
import Button from '../components/Button'

export default function IngredientesPage() {
  const queryClient = useQueryClient()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Ingrediente | null>(null)

  const { data: ingredientes = [], isLoading, isError } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: async () => {
      const res = await client.get('/ingredientes/')
      return res.data as Ingrediente[]
    },
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => client.delete(`/ingredientes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredientes'] }),
  })

  const abrirModalCrear = () => { setEditando(null); setModalAbierto(true) }
  const abrirModalEditar = (ing: Ingrediente) => { setEditando(ing); setModalAbierto(true) }
  const cerrarModal = () => { setModalAbierto(false); setEditando(null) }

  if (isLoading) return <p className="text-gray-500">Cargando...</p>
  if (isError) return <p className="text-red-500">Error al cargar ingredientes</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ingredientes</h1>
        <Button onClick={abrirModalCrear}>+ Nuevo Ingrediente</Button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Unidad</th>
              <th className="px-6 py-3 text-left">Stock</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ingredientes.map((ing) => (
              <tr key={ing.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500">{ing.id}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{ing.nombre}</td>
                <td className="px-6 py-4 text-gray-500">{ing.unidad_medida}</td>
                <td className="px-6 py-4 text-gray-500">{ing.stock}</td>
                <td className="px-6 py-4 flex gap-2">
                  <Button variant="ghost" onClick={() => abrirModalEditar(ing)}>Editar</Button>
                  <Button variant="danger" onClick={() => eliminar.mutate(ing.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
            {ingredientes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No hay ingredientes todavía</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && <IngredienteModal editando={editando} onClose={cerrarModal} />}
    </div>
  )
}