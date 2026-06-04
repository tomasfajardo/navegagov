'use client'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

const API_KEY = process.env.NEXT_PUBLIC_TOMTOM_API_KEY

const CIDADES = [
  { lat: 38.7169, lon: -9.1399 },  // Lisboa
  { lat: 41.1579, lon: -8.6291 },  // Porto
  { lat: 40.2033, lon: -8.4103 },  // Coimbra
  { lat: 41.5454, lon: -8.4265 },  // Braga
  { lat: 37.0193, lon: -7.9304 },  // Faro
  { lat: 40.6405, lon: -8.6538 },  // Aveiro
  { lat: 38.5244, lon: -8.8882 },  // Setúbal
  { lat: 38.5714, lon: -7.9065 },  // Évora
  { lat: 39.7437, lon: -8.8071 },  // Leiria
  { lat: 40.6566, lon: -7.9122 },  // Viseu
  { lat: 41.6918, lon: -8.8307 },  // Viana do Castelo
  { lat: 41.3006, lon: -7.7457 },  // Vila Real
  { lat: 41.8061, lon: -6.7589 },  // Bragança
  { lat: 39.2369, lon: -8.6881 },  // Santarém
  { lat: 39.8236, lon: -7.4958 },  // Castelo Branco
  { lat: 39.2968, lon: -7.4294 },  // Portalegre
  { lat: 38.0150, lon: -7.8653 },  // Beja
  { lat: 40.5376, lon: -7.2661 },  // Guarda
]

const CATEGORIAS = [
  { label: 'AIMA',            query: 'Agência para a Integração Migrações e Asilo', cor: '#3B82F6' },
  { label: 'Loja do Cidadão', query: 'Loja do Cidadão',                             cor: '#10B981' },
  { label: 'Centro de Saúde', query: 'Centro de Saúde',                             cor: '#EF4444' },
  { label: 'Finanças',        query: 'Serviço de Finanças',                         cor: '#F59E0B' },
]

type MarkerEntry = { id: string; categoria: string; nome: string; marker: any }

export default function MapaImigrante() {
  const t = useTranslations('ApoioImigrante')
  const mapRef         = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const allMarkersRef  = useRef<MarkerEntry[]>([])
  const mapReadyRef    = useRef(false)

  const [filtros, setFiltros] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORIAS.map(c => [c.label, true]))
  )
  const [erros,     setErros]     = useState<string[]>([])
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    if (mapReadyRef.current) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js'
    script.onload = initMap
    document.head.appendChild(script)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      mapReadyRef.current = false
    }
  }, [])

  async function fetchCategoriaRegional(cat: typeof CATEGORIAS[0]): Promise<any[]> {
    const respostas = await Promise.all(
      CIDADES.map(cidade => {
        const url =
          `https://api.tomtom.com/search/2/search/${encodeURIComponent(cat.query)}.json` +
          `?key=${API_KEY}&countrySet=PT&limit=5&language=pt-PT` +
          `&lat=${cidade.lat}&lon=${cidade.lon}&radius=30000`
        return fetch(url)
          .then(r => r.ok ? r.json() : { results: [] })
          .then(data => (data.results ?? []) as any[])
          .catch(() => [] as any[])
      })
    )
    return respostas.flat()
  }

  function distanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.asin(Math.sqrt(a))
  }

  function deduplicar(results: any[]): any[] {
    const kept: any[] = []
    for (const r of results) {
      const lat = r.position?.lat
      const lon = r.position?.lon
      if (lat == null || lon == null) continue
      const isDup = kept.some(k =>
        distanciaMetros(lat, lon, k.position.lat, k.position.lon) < 500
      )
      if (!isDup) kept.push(r)
    }
    return kept
  }

  function criarMarcador(tt: any, cat: typeof CATEGORIAS[0], result: any): MarkerEntry | null {
    const lat = result.position?.lat
    const lon = result.position?.lon
    if (lat == null || lon == null) return null

    const nome =
      result.poi?.name ||
      result.address?.freeformAddress ||
      cat.label

    const el = document.createElement('div')
    el.style.cssText = [
      'width:13px', 'height:13px', 'border-radius:50%',
      `background:${cat.cor}`, 'border:2px solid white',
      'cursor:pointer', 'box-shadow:0 1px 4px rgba(0,0,0,0.35)',
    ].join(';')

    const popup = new tt.Popup({ offset: 20 }).setHTML(`
      <div style="font-family:sans-serif;padding:4px 2px;min-width:180px">
        <strong style="color:#0D1B4B;font-size:13px">${nome}</strong><br/>
        <span style="font-size:11px;color:#666">${result.address?.freeformAddress ?? ''}</span><br/>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}"
           target="_blank"
           style="color:#3B82F6;font-size:12px;text-decoration:none">
          Como chegar →
        </a>
      </div>
    `)

    const marker = new tt.Marker({ element: el })
      .setLngLat([lon, lat])
      .setPopup(popup)
      .addTo(mapInstanceRef.current)

    return { id: `${cat.label}-${lat}-${lon}`, categoria: cat.label, nome, marker }
  }

  async function carregarMarcadores(tt: any) {
    const novosErros: string[] = []

    const resultados = await Promise.all(
      CATEGORIAS.map(cat =>
        fetchCategoriaRegional(cat)
          .then(results => ({ cat, results: deduplicar(results), ok: true as const }))
          .catch(err => {
            console.error(`[MapaImigrante] Erro ao carregar "${cat.label}":`, err)
            return { cat, results: [] as any[], ok: false as const }
          })
      )
    )

    const entries: MarkerEntry[] = []

    resultados.forEach(({ cat, results, ok }) => {
      if (!ok) {
        novosErros.push(cat.label)
        return
      }
      results.forEach(result => {
        const entry = criarMarcador(tt, cat, result)
        if (entry) entries.push(entry)
      })
      console.log(`[MapaImigrante] "${cat.label}": ${results.length} resultados únicos → ${entries.filter(e => e.categoria === cat.label).length} marcadores`)
    })

    allMarkersRef.current = entries
    if (novosErros.length) setErros(novosErros)
    setCarregado(true)
  }

  function initMap() {
    if (!mapRef.current || !(window as any).tt) return
    if (mapReadyRef.current) return
    mapReadyRef.current = true

    const tt  = (window as any).tt
    const map = tt.map({
      key:       API_KEY,
      container: mapRef.current,
      center:    [-8.2245, 39.3999],
      zoom:      6,
      language:  'pt-PT',
    })

    mapInstanceRef.current = map
    map.addControl(new tt.NavigationControl())
    map.on('load', () => carregarMarcadores(tt))
  }

  function aplicarFiltros(novosFiltros: Record<string, boolean>) {
    allMarkersRef.current.forEach(({ categoria, marker }) => {
      if (novosFiltros[categoria]) {
        marker.addTo(mapInstanceRef.current)
      } else {
        marker.remove()
      }
    })
  }

  function toggleFiltro(label: string) {
    setFiltros(prev => {
      const novo = { ...prev, [label]: !prev[label] }
      aplicarFiltros(novo)
      return novo
    })
  }

  const todosAtivos = CATEGORIAS.every(c => filtros[c.label])

  function toggleTodos() {
    const novo = !todosAtivos
    const novosFiltros = Object.fromEntries(CATEGORIAS.map(c => [c.label, novo]))
    setFiltros(novosFiltros)
    aplicarFiltros(novosFiltros)
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Mapa */}
      <div className="relative">
        <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '12px' }} />

        {/* Loading overlay */}
        {!carregado && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.65)',
            borderRadius: '12px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '10px', zIndex: 10,
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: '3px solid #3B82F6', borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>
              {t('loadingServices')}
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>

      {/* Erros por categoria */}
      {erros.length > 0 && (
        <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center' }}>
          Não foi possível carregar: {erros.join(', ')}
        </p>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        {CATEGORIAS.map(cat => (
          <div
            key={cat.label}
            onClick={() => toggleFiltro(cat.label)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background:   filtros[cat.label] ? 'white' : '#F3F4F6',
              border:       `2px solid ${filtros[cat.label] ? cat.cor : '#D1D5DB'}`,
              borderRadius: '20px',
              padding:      '6px 14px',
              fontSize:     '13px', fontWeight: 500,
              color:        filtros[cat.label] ? '#374151' : '#9CA3AF',
              cursor:       'pointer',
              opacity:      filtros[cat.label] ? 1 : 0.6,
              transition:   'all 0.2s ease',
              userSelect:   'none',
            }}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: filtros[cat.label] ? cat.cor : '#9CA3AF' }} />
            {cat.label}
            <span style={{ fontSize: '11px', color: filtros[cat.label] ? cat.cor : '#9CA3AF', marginLeft: '2px' }}>
              {filtros[cat.label] ? '✓' : '✕'}
            </span>
          </div>
        ))}

        <button
          onClick={toggleTodos}
          style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer', marginLeft: '8px' }}
        >
          {todosAtivos ? 'Esconder todos' : 'Mostrar todos'}
        </button>
      </div>
    </div>
  )
}
