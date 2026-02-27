<script lang="ts">
  import type { PageData } from './$types'
  export let data: PageData

  $: ({ incidencias, total, user } = data)

  const estadoLabel: Record<string, string> = {
    ABIERTA: 'Abierta', EN_PROCESO: 'En proceso', RESUELTA: 'Resuelta', CERRADA: 'Cerrada'
  }
  const prioridadLabel: Record<string, string> = {
    BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', URGENTE: 'Urgente'
  }
</script>

<svelte:head>
  <title>Incidencias TIC — Intranet IES Félix de Azara</title>
</svelte:head>

<div class="page">
  <header class="page-header">
    <div>
      <h1>🔧 Incidencias TIC</h1>
      <p class="subtitle">{total} incidencia{total !== 1 ? 's' : ''} en total</p>
    </div>
    <a href="/incidencias/nueva" class="btn btn-primary">+ Nueva incidencia</a>
  </header>

  <form method="GET" class="filters">
    <select name="estado" on:change={e => (e.target as HTMLFormElement).form?.submit()}>
      <option value="">Todos los estados</option>
      {#each Object.entries(estadoLabel) as [val, label]}
        <option value={val} selected={data.filtros?.estado === val}>{label}</option>
      {/each}
    </select>
    {#if user.role === 'ADMIN'}
      <select name="prioridad" on:change={e => (e.target as HTMLFormElement).form?.submit()}>
        <option value="">Todas las prioridades</option>
        {#each Object.entries(prioridadLabel) as [val, label]}
          <option value={val} selected={data.filtros?.prioridad === val}>{label}</option>
        {/each}
      </select>
    {/if}
    <button type="submit" class="btn btn-outline">Filtrar</button>
    <a href="/incidencias" class="btn btn-outline">Limpiar</a>
  </form>

  {#if incidencias.length === 0}
    <div class="empty">
      <span>📭</span>
      <p>No hay incidencias con los filtros seleccionados.</p>
      <a href="/incidencias/nueva" class="btn btn-primary">Crear la primera</a>
    </div>
  {:else}
    <div class="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Espacio</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Fecha</th>
            {#if user.role === 'ADMIN'}<th>Autor</th>{/if}
          </tr>
        </thead>
        <tbody>
          {#each incidencias as inc}
            <tr on:click={() => window.location.href = `/incidencias/${inc.id}`} class="row-link">
              <td>
                <span class="titulo">{inc.titulo}</span>
                {#if inc.equipo}
                  <small class="equipo-tag">🖥 {inc.equipo.nombre}</small>
                {/if}
              </td>
              <td>
                <span class="espacio">{inc.espacio.nombre}</span>
                {#if inc.espacio.planta !== null}
                  <small>Planta {inc.espacio.planta}</small>
                {/if}
              </td>
              <td><span class="badge estado-{inc.estado.toLowerCase()}">{estadoLabel[inc.estado]}</span></td>
              <td><span class="badge prioridad-{inc.prioridad.toLowerCase()}">{prioridadLabel[inc.prioridad]}</span></td>
              <td class="fecha">{new Date(inc.createdAt).toLocaleDateString('es-ES')}</td>
              {#if user.role === 'ADMIN'}
                <td class="autor">
                  {#if inc.autor.avatar}
                    <img src={inc.autor.avatar} alt={inc.autor.name} class="avatar-xs" referrerpolicy="no-referrer"/>
                  {/if}
                  {inc.autor.name.split(' ')[0]}
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .page { padding: 2rem; max-width: 1100px; }
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
  .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--color-primary); }
  .subtitle { color: var(--color-text-soft); font-size: 0.9rem; margin-top: 0.2rem; }
  .filters { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; align-items: center; }
  .filters select { padding: 0.5rem 0.75rem; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit; font-size: 0.875rem; background: white; color: var(--color-text); }
  .table-wrap { padding: 0; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  thead th { background: var(--color-bg); padding: 0.75rem 1rem; text-align: left; font-size: 0.78rem; text-transform: uppercase; letter-spacing: .05em; color: var(--color-text-soft); border-bottom: 1px solid var(--color-border); }
  tbody td { padding: 0.875rem 1rem; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
  tbody tr:last-child td { border-bottom: none; }
  .row-link { cursor: pointer; transition: background var(--transition); }
  .row-link:hover { background: var(--color-accent); }
  .titulo { font-weight: 500; display: block; }
  .equipo-tag, .espacio small { display: block; font-size: 0.75rem; color: var(--color-text-soft); margin-top: 0.15rem; }
  .espacio { font-weight: 500; }
  .fecha { color: var(--color-text-soft); white-space: nowrap; }
  .autor { display: flex; align-items: center; gap: 0.5rem; }
  .avatar-xs { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
  .badge { display: inline-block; padding: 0.2rem 0.65rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
  .estado-abierta     { background: #fee2e2; color: #991b1b; }
  .estado-en_proceso  { background: #fef3c7; color: #92400e; }
  .estado-resuelta    { background: #d1fae5; color: #065f46; }
  .estado-cerrada     { background: #f1f5f9; color: #475569; }
  .prioridad-baja    { background: #f0fdf4; color: #166534; }
  .prioridad-media   { background: #eff6ff; color: #1d4ed8; }
  .prioridad-alta    { background: #fff7ed; color: #c2410c; }
  .prioridad-urgente { background: #fef2f2; color: #b91c1c; font-weight: 700; }
  .empty { text-align: center; padding: 4rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .empty span { font-size: 3rem; }
  .empty p { color: var(--color-text-soft); }
</style>
