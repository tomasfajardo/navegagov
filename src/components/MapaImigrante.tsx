'use client'
import { useEffect, useRef, useState } from 'react'

export default function MapaImigrante() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  const [filtrosAtivos, setFiltrosAtivos] = useState<{ [key: string]: boolean }>({
    'AIMA': true,
    'Loja do Cidadão': true,
    'Centro de Saúde': true,
    'Finanças': true,
  })

  const marcadoresRef = useRef<{ [key: string]: any[] }>({
    'AIMA': [],
    'Loja do Cidadão': [],
    'Centro de Saúde': [],
    'Finanças': [],
  })

  useEffect(() => {
    // Carregar CSS do TomTom
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css'
    document.head.appendChild(link)

    // Carregar JS do TomTom
    const script = document.createElement('script')
    script.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js'
    script.onload = () => initMap()
    document.head.appendChild(script)

    // Carregar SDK de serviços
    const scriptServices = document.createElement('script')
    scriptServices.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/services/services-web.min.js'
    document.head.appendChild(scriptServices)

    return () => {
      if (mapInstanceRef.current) mapInstanceRef.current.remove()
    }
  }, [])

  function initMap() {
    if (!mapRef.current || !(window as any).tt) return
    const tt = (window as any).tt

    const map = tt.map({
      key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY,
      container: mapRef.current,
      center: [-8.2245, 39.3999], // centro geográfico de Portugal
      zoom: 6,
      language: 'pt-PT'
    })

    mapInstanceRef.current = map

    map.addControl(new tt.NavigationControl())

    // Pesquisar locais úteis para imigrantes
    map.on('load', () => {
      const categorias = [
        { query: 'AIMA migrações asilo', cor: '#3B82F6', label: 'AIMA' },
        { query: 'Loja do Cidadão', cor: '#10B981', label: 'Loja do Cidadão' },
        { query: 'Centro de Saúde', cor: '#EF4444', label: 'Centro de Saúde' },
        { query: 'Serviço de Finanças', cor: '#F59E0B', label: 'Finanças' },
      ]

      categorias.forEach(cat => {
        fetch(`https://api.tomtom.com/search/2/search/${encodeURIComponent(cat.query)}.json?key=${process.env.NEXT_PUBLIC_TOMTOM_API_KEY}&countrySet=PT&limit=50&language=pt-PT`)
          .then(r => r.json())
          .then(data => {
            data.results?.forEach((result: any) => {
              const el = document.createElement('div')
              el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${cat.cor};border:2px solid white;cursor:pointer;`

              const marker = new tt.Marker({ element: el })
                .setLngLat([result.position.lon, result.position.lat])
                .setPopup(new tt.Popup({ offset: 20 }).setHTML(`
                  <div style='font-family:sans-serif;padding:4px'>
                    <strong>${result.poi?.name || cat.label}</strong><br/>
                    <span style='font-size:12px;color:#666'>${result.address?.freeformAddress || ''}</span><br/>
                    <a href='https://www.google.com/maps/dir/?api=1&destination=${result.position.lat},${result.position.lon}' target='_blank' style='color:#3B82F6;font-size:12px'>Como chegar →</a>
                  </div>
                `))
              
              marcadoresRef.current[cat.label].push(marker)
              marker.addTo(map)
            })
          })
      })
    })
  }

  function toggleFiltro(categoria: string) {
    setFiltrosAtivos(prev => {
      const novoEstado = { ...prev, [categoria]: !prev[categoria] }
      const marcadores = marcadoresRef.current[categoria] || []
      if (novoEstado[categoria]) {
        marcadores.forEach(m => m.addTo(mapInstanceRef.current))
      } else {
        marcadores.forEach(m => m.remove())
      }
      return novoEstado
    })
  }

  const todosAtivos = Object.values(filtrosAtivos).every(v => v)
  
  function toggleTodos() {
    const novoEstado = !todosAtivos
    const estadoTemp: { [key: string]: boolean } = {}
    
    Object.keys(filtrosAtivos).forEach(cat => {
      estadoTemp[cat] = novoEstado
      const marcadores = marcadoresRef.current[cat] || []
      if (novoEstado) {
        marcadores.forEach(m => m.addTo(mapInstanceRef.current))
      } else {
        marcadores.forEach(m => m.remove())
      }
    })
    
    setFiltrosAtivos(estadoTemp)
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '12px' }} />
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px', alignItems: 'center' }}>
        {[
          { cor: '#3B82F6', label: 'AIMA' },
          { cor: '#10B981', label: 'Loja do Cidadão' },
          { cor: '#EF4444', label: 'Centro de Saúde' },
          { cor: '#F59E0B', label: 'Finanças' },
        ].map(cat => (
          <div
            key={cat.label}
            onClick={() => toggleFiltro(cat.label)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: filtrosAtivos[cat.label] ? 'white' : '#F3F4F6',
              border: `2px solid ${filtrosAtivos[cat.label] ? cat.cor : '#D1D5DB'}`,
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 500,
              color: filtrosAtivos[cat.label] ? '#374151' : '#9CA3AF',
              cursor: 'pointer',
              opacity: filtrosAtivos[cat.label] ? 1 : 0.6,
              transition: 'all 0.2s ease',
              userSelect: 'none',
            }}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: filtrosAtivos[cat.label] ? cat.cor : '#9CA3AF' }} />
            {cat.label}
            <span style={{ fontSize: '11px', color: filtrosAtivos[cat.label] ? cat.cor : '#9CA3AF', marginLeft: '2px' }}>
              {filtrosAtivos[cat.label] ? '✓' : '✕'}
            </span>
          </div>
        ))}
        
        <button
          onClick={toggleTodos}
          style={{
            background: 'none',
            border: 'none',
            color: '#6B7280',
            fontSize: '13px',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginLeft: '8px'
          }}
        >
          {todosAtivos ? 'Esconder todos' : 'Mostrar todos'}
        </button>
      </div>
    </div>
  )
}
