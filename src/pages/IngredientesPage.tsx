import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

interface Ingrediente {
  id: number
  nombre: string
  unidad_medida: string
  stock: number
}

interface IngredienteForm {
  nombre: string
  unidad_medida: string
  stock: number
}

export default function IngredientesPage() {
  const queryClient = useQueryClient()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Ingrediente | null>(null)
  const [form, setForm] = useState<IngredienteForm>({ nombre: '', unidad_medida: '', stock: 0 })
  const [error, setError] = useState('')

  const { data: ingredientes = [], isLoading, isError } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: async () => {
      const res = await client.get('/ingredientes/')
      return res.data as Ingrediente[]
    },
  })

  const crear = useMutation({
    mutationFn: (datos: IngredienteForm) => client.post('/ingredientes/', datos),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ingredientes'] }); cerrarModal() },
    onError: () => setError('Error al crear el ingrediente'),
  })

  const editar = useMutation({
    mutationFn: (datos: IngredienteForm) => client.patch(`/ingredientes/${editando!.id}`, datos),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ingredientes'] }); cerrarModal() },
    onError: () => setError('Error al editar el ingrediente'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => client.delete(`/ingredientes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredientes'] }),
  })

  const abrirModalCrear = () => {
    setEditando(null)
    setForm({ nombre: '', unidad_medida: '', stock: 0 })
    setError('')
    setModalAbierto(true)
  }

  const abrirModalEditar = (ing: Ingrediente) => {
    setEditando(ing)
    setForm({ nombre: ing.nombre, unidad_medida: ing.unidad_medida, stock: ing.stock })
    setError('')
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setEditando(null)
    setForm({ nombre: '', unidad_medida: '', stock: 0 })
    setError('')
  }

  const handleSubmit = () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.unidad_medida.trim()) { setError('La unidad de medida es obligatoria'); return }
    if (editando) editar.mutate(form)
    else crear.mutate(form)
  }

  if (isLoading) return <p className="text-gray-500">Cargando...</p>
  if (isError) return <p className="text-red-500">Error al cargar ingredientes</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ingredientes</h1>
        <button
          onClick={abrirModalCrear}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Nuevo Ingrediente
        </button>
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
                  <button onClick={() => abrirModalEditar(ing)} className="text-indigo-600 hover:underline">Editar</button>
                  <button onClick={() => eliminar.mutate(ing.id)} className="text-red-500 hover:underline">Eliminar</button>
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

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">{editando ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}</h2>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Harina"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Unidad de medida *</label>
                <input
                  type="text"
                  value={form.unidad_medida}
                  onChange={e => setForm({ ...form, unidad_medida: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: kg, litros, unidad"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Stock inicial</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min={0}
                />
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