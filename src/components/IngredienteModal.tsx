import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { Ingrediente, IngredienteForm } from '../types'
import Modal from './Modal'
import Input from './Input'
import Button from './Button'

interface Props {
  editando: Ingrediente | null
  onClose: () => void
}

export default function IngredienteModal({ editando, onClose }: Props) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<IngredienteForm>({
    nombre: editando?.nombre ?? '',
    unidad_medida: editando?.unidad_medida ?? '',
    stock: editando?.stock ?? 0,
  })
  const [error, setError] = useState('')

  const crear = useMutation({
    mutationFn: (datos: IngredienteForm) => client.post('/ingredientes/', datos),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ingredientes'] }); onClose() },
    onError: () => setError('Error al crear el ingrediente'),
  })

  const editar = useMutation({
    mutationFn: (datos: IngredienteForm) => client.patch(`/ingredientes/${editando!.id}`, datos),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ingredientes'] }); onClose() },
    onError: () => setError('Error al editar el ingrediente'),
  })

  const handleSubmit = () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.unidad_medida.trim()) { setError('La unidad de medida es obligatoria'); return }
    if (editando) editar.mutate(form)
    else crear.mutate(form)
  }

  return (
    <Modal titulo={editando ? 'Editar Ingrediente' : 'Nuevo Ingrediente'} onClose={onClose}>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <div className="flex flex-col gap-3">
        <Input label="Nombre" value={form.nombre} onChange={v => setForm({ ...form, nombre: v })} required placeholder="Ej: Harina" />
        <Input label="Unidad de medida" value={form.unidad_medida} onChange={v => setForm({ ...form, unidad_medida: v })} required placeholder="Ej: kg, litros" />
        <Input label="Stock" value={form.stock} onChange={v => setForm({ ...form, stock: parseFloat(v) || 0 })} type="number" min={0} />
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