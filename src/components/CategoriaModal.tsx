import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import type { Categoria, CategoriaForm } from '../types'
import Modal from './Modal'
import Input from './Input'
import Button from './Button'

interface Props {
  editando: Categoria | null
  onClose: () => void
}

export default function CategoriaModal({ editando, onClose }: Props) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CategoriaForm>({
    nombre: editando?.nombre ?? '',
    descripcion: editando?.descripcion ?? '',
  })
  const [error, setError] = useState('')

  const crear = useMutation({
    mutationFn: (datos: CategoriaForm) => client.post('/categorias/', datos),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categorias'] }); onClose() },
    onError: () => setError('Error al crear la categoría'),
  })

  const editar = useMutation({
    mutationFn: (datos: CategoriaForm) => client.patch(`/categorias/${editando!.id}`, datos),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categorias'] }); onClose() },
    onError: () => setError('Error al editar la categoría'),
  })

  const handleSubmit = () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (editando) editar.mutate(form)
    else crear.mutate(form)
  }

  return (
    <Modal titulo={editando ? 'Editar Categoría' : 'Nueva Categoría'} onClose={onClose}>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <div className="flex flex-col gap-3">
        <Input label="Nombre" value={form.nombre} onChange={v => setForm({ ...form, nombre: v })} required placeholder="Ej: Bebidas" />
        <Input label="Descripción" value={form.descripcion} onChange={v => setForm({ ...form, descripcion: v })} placeholder="Opcional" />
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