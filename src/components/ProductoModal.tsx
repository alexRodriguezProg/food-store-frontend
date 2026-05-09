import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { Producto, ProductoForm } from '../types'
import Modal from './Modal'
import Input from './Input'
import Button from './Button'

interface Props {
  editando: Producto | null
  onClose: () => void
}

export default function ProductoModal({ editando, onClose }: Props) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ProductoForm>({
    nombre: editando?.nombre ?? '',
    descripcion: editando?.descripcion ?? '',
    precio: editando?.precio ?? 0,
    disponible: editando?.disponible ?? true,
  })
  const [error, setError] = useState('')

  const crear = useMutation({
    mutationFn: (datos: ProductoForm) => client.post('/productos/', datos),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['productos'] }); onClose() },
    onError: () => setError('Error al crear el producto'),
  })

  const editar = useMutation({
    mutationFn: (datos: ProductoForm) => client.patch(`/productos/${editando!.id}`, datos),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['productos'] }); onClose() },
    onError: () => setError('Error al editar el producto'),
  })

  const handleSubmit = () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (form.precio <= 0) { setError('El precio debe ser mayor a 0'); return }
    if (editando) editar.mutate(form)
    else crear.mutate(form)
  }

  return (
    <Modal titulo={editando ? 'Editar Producto' : 'Nuevo Producto'} onClose={onClose}>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <div className="flex flex-col gap-3">
        <Input label="Nombre" value={form.nombre} onChange={v => setForm({ ...form, nombre: v })} required placeholder="Ej: Pizza Margherita" />
        <Input label="Descripción" value={form.descripcion} onChange={v => setForm({ ...form, descripcion: v })} placeholder="Opcional" />
        <Input label="Precio" value={form.precio} onChange={v => setForm({ ...form, precio: parseFloat(v) || 0 })} type="number" min={0} step={0.01} required />
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
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={crear.isPending || editar.isPending}>
          {crear.isPending || editar.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </Modal>
  )
}