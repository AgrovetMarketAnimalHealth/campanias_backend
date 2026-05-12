import axios from 'axios'
import type { CampaniaImagen, Filtros, PaginadoResponse } from '../types/index'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BASE_HEADERS = {
  Accept: 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
} as const

const api = axios.create({ headers: BASE_HEADERS })

function buildUrl(campaniaId: string, params: Partial<Filtros>): string {
  const q = new URLSearchParams()
  if (params.seccion)  q.set('seccion',  params.seccion)
  if (params.activa)   q.set('activa',   params.activa)
  if (params.per_page) q.set('per_page', String(params.per_page))
  if (params.page)     q.set('page',     String(params.page))
  return `/promo-concierto/backoffice/campania/${campaniaId}/imagene?${q.toString()}`
}

// ─── API requests ─────────────────────────────────────────────────────────────
export async function fetchImagenes(
  campaniaId: string,
  params: Partial<Filtros>,
): Promise<PaginadoResponse> {
  const { data } = await api.get<PaginadoResponse>(buildUrl(campaniaId, params))
  return data
}

export async function createImagen(
  campaniaId: string,
  body: FormData,
): Promise<CampaniaImagen> {
  const { data } = await api.post<CampaniaImagen>(
    `/promo-concierto/backoffice/campania/${campaniaId}/imagene`,
    body,
  )
  return data
}

export async function updateImagen(
  campaniaId: string,
  imagenId: string,
  body: FormData,
): Promise<CampaniaImagen> {
  // Laravel requiere POST + _method para FormData con archivos
  body.append('_method', 'POST')
  const { data } = await api.post<CampaniaImagen>(
    `/promo-concierto/backoffice/campania/${campaniaId}/imagene/${imagenId}`,
    body,
  )
  return data
}

export async function toggleActiva(
  campaniaId: string,
  imagenId: string,
): Promise<CampaniaImagen> {
  const { data } = await api.patch<CampaniaImagen>(
    `/promo-concierto/backoffice/campania/${campaniaId}/imagene/${imagenId}/toggle-activa`,
  )
  return data
}

export async function deleteImagen(
  campaniaId: string,
  imagenId: string,
): Promise<void> {
  await api.delete(
    `/promo-concierto/backoffice/campania/${campaniaId}/imagene/${imagenId}`,
  )
}

export async function deleteImagenCampo(
  campaniaId: string,
  imagenId: string,
  campo: string,
): Promise<CampaniaImagen> {
  const { data } = await api.delete<CampaniaImagen>(
    `/promo-concierto/backoffice/campania/${campaniaId}/imagene/${imagenId}/campo/${campo}`,
  )
  return data
}

export async function reordenarImagenes(
  campaniaId: string,
  orden: { id: string; orden: number }[],
): Promise<void> {
  await api.patch(
    `/promo-concierto/backoffice/campania/${campaniaId}/imagene/reordenar`,
    { orden },
  )
}