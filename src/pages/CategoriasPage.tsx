import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'

interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
}

interface CategoriaForm {
  nombre: string
  descripcion: string
}

export default function CategoriasPage() {
  const queryClient = useQueryClient()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [form, setForm] = useState<CategoriaForm>({ nombre: '', descripcion: '' })
  const [error, setError] = useState('')

  // ── useQuery: trae la lista de categorías ──
  const { data: categorias = [], isLoading, isError } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await client.get('/categorias/')
      return res.data as Categoria[]
    },
  })

  // ── useMutation: crear ──
  const crear = useMutation({
    mutationFn: (datos: CategoriaForm) => client.post('/categorias/', datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      cerrarModal()
    },
    onError: () => setError('Error al crear la categoría'),
  })

  // ── useMutation: editar ──
  const editar = useMutation({
    mutationFn: (datos: CategoriaForm) =>
      client.patch(`/categorias/${editando!.id}`, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      cerrarModal()
    },
    onError: () => setError('Error al editar la categoría'),
  })

  // ── useMutation: eliminar ──
  const eliminar = useMutation({
    mutationFn: (id: number) => client.delete(`/categorias/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }),
  })

  const abrirModalCrear = () => {
    setEditando(null)
    setForm({ nombre: '', descripcion: '' })
    setError('')
    setModalAbierto(true)
  }

  const abrirModalEditar = (cat: Categoria) => {
    setEditando(cat)
    setForm({ nombre: cat.nombre, descripcion: cat.descripcion ?? '' })
    setError('')
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setEditando(null)
    setForm({ nombre: '', descripcion: '' })
    setError('')
  }

  const handleSubmit = () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (editando) editar.mutate(form)
    else crear.mutate(form)
  }

  if (isLoading) return <p className="text-gray-500">Cargando...</p>
  if (isError) return <p className="text-red-500">Error al cargar categorías</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        <button
          onClick={abrirModalCrear}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Nueva Categoría
        </button>
      </div>

      {/* Tabla */}
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
                  <button
                    onClick={() => abrirModalEditar(cat)}
                    className="text-indigo-600 hover:underline"
                  >Editar</button>
                  <button
                    onClick={() => eliminar.mutate(cat.id)}
                    className="text-red-500 hover:underline"
                  >Eliminar</button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No hay categorías todavía
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">
              {editando ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Bebidas"
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
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={cerrarModal} className="px-4 py-2 text-sm text-gray-600 hover:underline">
                Cancelar
              </button>
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