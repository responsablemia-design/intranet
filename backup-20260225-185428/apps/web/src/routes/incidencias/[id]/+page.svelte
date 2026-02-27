<script lang="ts">
  import type { PageData, ActionData } from './$types'
  export let data: PageData
  export let form: ActionData

  $: ({ incidencia, user } = data)

  const estadoLabel: Record<string, string> = {
    ABIERTA: 'Abierta', EN_PROCESO: 'En proceso', RESUELTA: 'Resuelta', CERRADA: 'Cerrada'
  }
  const prioridadLabel: Record<string, string> = {
    BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', URGENTE: 'Urgente'
  }
  const tipoLabel: Record<string, string> = {
    AULA_ORDINARIA: 'Aula', AULA_INFORMATICA: 'Aula informática',
    LABORATORIO: 'Laboratorio', SALA_PROFESORES: 'Sala profesores',
    BIBLIOTECA: 'Biblioteca', DEPARTAMENTO: 'Departamento',
    DESPACHO: 'Despacho', CARRO_PORTATILES: 'Carro portátiles', OTRO: 'Otro'
  }

  let comentario = ''
</script>

<svelte:head>
  <title>{incidencia.titulo} — Intranet IES Félix de Azara</title>
</svelte:head>

<div class="page">
  <header class="page-header">
    <a href="/incidencias" class="back-link">← Volver a incidencias</a>
    <div class="header-row">
      <h1>{incidencia.titulo}</h1>
      <span class="badge estado-{incidencia.estado.toLowerCase()}">{estadoLabel[incidencia.estado]}</span>
    </div>
    <div class="meta">
      <span>Registrada por <strong>{incidencia.autor.name}</strong></span>
      <span>·</span>
      <span>{new Date(incidencia.createdAt).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })}</span>
      {#if incidencia.resolvedAt}
        <span>· Resuelta el {new Date(incidencia.resolvedAt).toLocaleDateString('es-ES', { day:'numeric', month:'long' })}</span>
      {/if}
    </div>
  </header>

  <div class="layout">
    <div class="main-col">
      <div class="card section">
        <h2>Descripción</h2>
        <p class="descripcion">{incidencia.descripcion}</p>
      </div>

      <div class="card section">
        <h2>Comentarios ({incidencia.comentarios.length})</h2>

        {#if form?.errorComentario}
          <div class="alert alert-error">{form.errorComentario}</div>
        {/if}

        <div class="comentarios">
          {#each incidencia.comentarios as com}
            <div class="comentario">
              <div class="com-header">
                {#if com.autor.avatar}
                  <img src={com.autor.avatar} alt={com.autor.name} class="avatar-sm" referrerpolicy="no-referrer"/>
                {:else}
                  <div class="avatar-sm avatar-placeholder">{com.autor.name[0]}</div>
                {/if}
                <strong>{com.autor.name}</strong>
                <time>{new Date(com.createdAt).toLocaleDateString('es-ES', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</time>
              </div>
              <p class="com-body">{com.contenido}</p>
            </div>
          {/each}
          {#if incidencia.comentarios.length === 0}
            <p class="sin-comentarios">Sin comentarios aún.</p>
          {/if}
        </div>

        {#if incidencia.estado !== 'CERRADA'}
          <form method="POST" action="?/comentar" class="com-form">
            <textarea name="contenido" rows="3" bind:value={comentario}
              placeholder="Añade un comentario o actualización..." required></textarea>
            <button type="submit" class="btn btn-primary" disabled={!comentario.trim()}>
              Enviar comentario
            </button>
          </form>
        {/if}
      </div>
    </div>

    <aside class="side-col">
      <div class="card section">
        <h3>Ubicación</h3>
        <dl>
          <dt>Espacio</dt>
          <dd>
            <strong>{incidencia.espacio.nombre}</strong>
            {#if incidencia.espacio.planta !== null}
              <small>Planta {incidencia.espacio.planta}</small>
            {/if}
            <small>{tipoLabel[incidencia.espacio.tipo] ?? incidencia.espacio.tipo}</small>
          </dd>
          {#if incidencia.equipo}
            <dt>Equipo</dt>
            <dd><strong>{incidencia.equipo.nombre}</strong><small>{incidencia.equipo.tipo}</small></dd>
          {/if}
        </dl>
      </div>

      <div class="card section">
        <h3>Prioridad</h3>
        <span class="badge prioridad-{incidencia.prioridad.toLowerCase()}">{prioridadLabel[incidencia.prioridad]}</span>
      </div>

      {#if incidencia.asignado}
        <div class="card section">
          <h3>Asignada a</h3>
          <div class="asignado-info">
            {#if incidencia.asignado.avatar}
              <img src={incidencia.asignado.avatar} alt={incidencia.asignado.name} class="avatar-sm" referrerpolicy="no-referrer"/>
            {:else}
              <div class="avatar-sm avatar-placeholder">{incidencia.asignado.name[0]}</div>
            {/if}
            <span>{incidencia.asignado.name}</span>
          </div>
        </div>
      {/if}

      {#if user.role === 'ADMIN'}
        <div class="card section admin-panel">
          <h3>⚙️ Gestión (Admin)</h3>
          {#if form?.errorAdmin}
            <div class="alert alert-error">{form.errorAdmin}</div>
          {/if}
          <form method="POST" action="?/cambiarEstado">
            <div class="form-group">
              <label for="estado">Estado</label>
              <select id="estado" name="estado">
                {#each Object.entries(estadoLabel) as [val, label]}
                  <option value={val} selected={val === incidencia.estado}>{label}</option>
                {/each}
              </select>
            </div>
            <div class="form-group">
              <label for="prioridad">Prioridad</label>
              <select id="prioridad" name="prioridad">
                {#each Object.entries(prioridadLabel) as [val, label]}
                  <option value={val} selected={val === incidencia.prioridad}>{label}</option>
                {/each}
              </select>
            </div>
            <button type="submit" class="btn btn-primary w-full">Guardar cambios</button>
          </form>
        </div>
      {/if}
    </aside>
  </div>
</div>

<style>
  .page { padding: 2rem; max-width: 1100px; }
  .back-link { font-size: 0.875rem; color: var(--color-text-soft); display: inline-block; margin-bottom: 0.75rem; }
  .back-link:hover { color: var(--color-primary); }
  .header-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
  .header-row h1 { font-size: 1.5rem; font-weight: 700; color: var(--color-primary); }
  .meta { display: flex; gap: 0.5rem; font-size: 0.85rem; color: var(--color-text-soft); flex-wrap: wrap; margin-bottom: 1.5rem; }
  .layout { display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; align-items: start; }
  @media (max-width: 768px) { .layout { grid-template-columns: 1fr; } }
  .section { margin-bottom: 1rem; }
  .section h2 { font-size: 1rem; font-weight: 600; margin-bottom: 0.875rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--color-border); }
  .section h3 { font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--color-text-soft); margin-bottom: 0.75rem; }
  .descripcion { white-space: pre-wrap; line-height: 1.7; font-size: 0.9rem; }
  .comentarios { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem; }
  .comentario { background: var(--color-bg); border-radius: var(--radius-md); padding: 0.875rem 1rem; }
  .com-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.85rem; }
  .com-header time { color: var(--color-text-soft); margin-left: auto; }
  .com-body { font-size: 0.875rem; line-height: 1.6; white-space: pre-wrap; }
  .sin-comentarios { color: var(--color-text-soft); font-size: 0.875rem; font-style: italic; }
  .com-form { display: flex; flex-direction: column; gap: 0.75rem; border-top: 1px solid var(--color-border); padding-top: 1rem; }
  .com-form textarea { padding: 0.6rem 0.875rem; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit; font-size: 0.9rem; resize: vertical; min-height: 80px; width: 100%; }
  .com-form textarea:focus { outline: none; border-color: var(--color-primary-mid); box-shadow: 0 0 0 3px var(--color-primary-light); }
  dl { display: grid; grid-template-columns: auto 1fr; gap: 0.4rem 0.75rem; font-size: 0.875rem; align-items: start; }
  dt { color: var(--color-text-soft); font-size: 0.78rem; text-transform: uppercase; letter-spacing: .04em; padding-top: 0.1rem; }
  dd { display: flex; flex-direction: column; gap: 0.1rem; }
  dd strong { font-weight: 600; }
  dd small { font-size: 0.75rem; color: var(--color-text-soft); }
  .asignado-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
  .avatar-sm { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
  .avatar-placeholder { background: var(--color-primary-light); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: var(--color-primary); }
  .admin-panel { border: 1.5px solid var(--color-primary-light); }
  .form-group { margin-bottom: 0.875rem; display: flex; flex-direction: column; gap: 0.35rem; }
  .form-group label { font-size: 0.8rem; font-weight: 600; }
  .form-group select { padding: 0.5rem 0.75rem; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit; font-size: 0.875rem; background: white; width: 100%; }
  .w-full { width: 100%; justify-content: center; }
  .alert { padding: 0.75rem 0.875rem; border-radius: var(--radius-sm); margin-bottom: 0.875rem; font-size: 0.85rem; }
  .alert-error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
  .badge { display: inline-block; padding: 0.2rem 0.65rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
  .estado-abierta     { background: #fee2e2; color: #991b1b; }
  .estado-en_proceso  { background: #fef3c7; color: #92400e; }
  .estado-resuelta    { background: #d1fae5; color: #065f46; }
  .estado-cerrada     { background: #f1f5f9; color: #475569; }
  .prioridad-baja    { background: #f0fdf4; color: #166534; }
  .prioridad-media   { background: #eff6ff; color: #1d4ed8; }
  .prioridad-alta    { background: #fff7ed; color: #c2410c; }
  .prioridad-urgente { background: #fef2f2; color: #b91c1c; font-weight: 700; }
</style>
