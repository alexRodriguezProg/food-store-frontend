export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
}

export interface CategoriaForm {
  nombre: string
  descripcion: string
}

export interface Ingrediente {
  id: number
  nombre: string
  unidad_medida: string
  stock: number
}

export interface IngredienteForm {
  nombre: string
  unidad_medida: string
  stock: number
}

export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  disponible: boolean
}

export interface ProductoForm {
  nombre: string
  descripcion: string
  precio: number
  disponible: boolean
}