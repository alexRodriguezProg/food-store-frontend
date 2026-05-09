import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { Producto } from '../types'
import ProductoModal from '../components/ProductoModal'
import Button from '../components/Button'

export default function ProductosPage() {
  const queryClient = useQueryClient()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)

  const { data: productos = [], isLoading, isError } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const res = await client.get('/productos/')
      return res.data as Producto[]
    },
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => client.delete(`/productos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  })

  const abrirModalCrear = () => { setEditando(null); setModalAbierto(true) }
  const abrirModalEditar = (prod: Producto) => { setEditando(prod); setModalAbierto(true) }
  const cerrarModal = () => { setModalAbierto(false); setEditando(null) }

  if (isLoading) return <p className="text-gray-500">Cargando...</p>
  if (isError) return <p className="text-red-500">Error al cargar productos</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <Button onClick={abrirModalCrear}>+ Nuevo Producto</Button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Descripción</th>
              <th className="px-6 py-3 text-left">Precio</th>
              <th className="px-6 py-3 text-left">Disponible</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productos.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500">{prod.id}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{prod.nombre}</td>
                <td className="px-6 py-4 text-gray-500">{prod.descripcion ?? '-'}</td>
                <td className="px-6 py-4 text-gray-500">${prod.precio.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${prod.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {prod.disponible ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <Button variant="ghost" onClick={() => abrirModalEditar(prod)}>Editar</Button>
                  <Button variant="danger" onClick={() => eliminar.mutate(prod.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No hay productos todavía</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && <ProductoModal editando={editando} onClose={cerrarModal} />}
    </div>
  )
}