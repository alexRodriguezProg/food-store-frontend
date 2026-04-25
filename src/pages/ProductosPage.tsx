import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  disponible: boolean
}

interface ProductoForm {
  nombre: string
  descripcion: string
  precio: number
  disponible: boolean
}

export default function ProductosPage() {
  const queryClient = useQueryClient()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [form, setForm] = useState<ProductoForm>({ nombre: '', descripcion: '', precio: 0, disponible: true })
  const [error, setError] = useState('')

  const { data: productos = [], isLoading, isError } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const res = await client.get('/productos/')
      return res.data as Producto[]
    },
  })

  const crear = useMutation({
    mutationFn: (datos: ProductoForm) => client.post('/productos/', datos),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['productos'] }); cerrarModal() },
    onError: () => setError('Error al crear el producto'),
  })

  const editar = useMutation({
    mutationFn: (datos: ProductoForm) => client.patch(`/productos/${editando!.id}`, datos),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['productos'] }); cerrarModal() },
    onError: () => setError('Error al editar el producto'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => client.delete(`/productos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  })

  const abrirModalCrear = () => {
    setEditando(null)
    setForm({ nombre: '', descripcion: '', precio: 0, disponible: true })
    setError('')
    setModalAbierto(true)
  }

  const abrirModalEditar = (prod: Producto) => {
    setEditando(prod)
    setForm({ nombre: prod.nombre, descripcion: prod.descripcion ?? '', precio: prod.precio, disponible: prod.disponible })
    setError('')
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setEditando(null)
    setForm({ nombre: '', descripcion: '', precio: 0, disponible: true })
    setError('')
  }

  const handleSubmit = () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (form.precio <= 0) { setError('El precio debe ser mayor a 0'); return }
    if (editando) editar.mutate(form)
    else crear.mutate(form)
  }

  if (isLoading) return <p className="text-gray-500">Cargando...</p>
  if (isError) return <p className="text-red-500">Error al cargar productos</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <button
          onClick={abrirModalCrear}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Nuevo Producto
        </button>
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
                  <button onClick={() => abrirModalEditar(prod)} className="text-indigo-600 hover:underline">Editar</button>
                  <button onClick={() => eliminar.mutate(prod.id)} className="text-red-500 hover:underline">Eliminar</button>
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

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">{editando ? 'Editar Producto' : 'Nuevo Producto'}</h2>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Pizza Margherita"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Precio *</label>
                <input
                  type="number"
                  value={form.precio}
                  onChange={e => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min={0}
                  step={0.01}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={form.disponible}
                  onChange={e => setForm({ ...form, disponible: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600"
                />
                <label htmlFor="disponible" className="text-sm font-medium text-gray-700">Disponible</label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={cerrarModal} className="px-4 py-2 text-sm text-gray-600 hover:underline">Cancelar</button>
              <button
                onClick={handleSubmit}
                disabled={crear.isPending || editar.isPending}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {crear.isPending || editar.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}