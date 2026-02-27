<script lang="ts">
  import type { PageData, ActionData } from './$types'
  export let data: PageData
  export let form: ActionData

  let espacioId = ''
  let equipos: any[] = []
  let cargandoEquipos = false

  async function cargarEquipos(id: string) {
    if (!id) { equipos = []; return }
    cargandoEquipos = true
    try {
      const res = await fetch(`/api/espacios/${id}/equipos`)
      equipos = res.ok ? await res.json() : []
    } finally {
      cargandoEquipos = false
    }
  }

  $: cargarEquipos(espacioId)

  $: espaciosPorPlanta = data.espacios.reduce((acc: any, e: any) => {
    const key = e.planta !== null ? `Planta ${e.planta}` : 'Sin planta'
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})
</script>

<svelte:head>
  <title>Nueva incidencia — Intranet IES Félix de Azara</title>
</svelte:head>

<div class="page">
  <header class="page-header">
    <div>
      <a href="/incidencias" class="back-link">← Volver a incidencias</a>
      <h1>Nueva incidencia</h1>
    </div>
  </header>

  <div class="card form-card">
    {#if form?.error}
      <div class="alert alert-error">{form.error}</div>
    {/if}

    <form method="POST">
      <div class="form-group">
        <label for="titulo">Título <span class="required">*</span></label>
        <input id="titulo" name="titulo" type="text" required
          placeholder="Ej: El proyector del Aula 101 no enciende"
          value={form?.titulo ?? ''}
          class:error={form?.errors?.titulo} />
        {#if form?.errors?.titulo}<span class="field-error">{form.errors.titulo}</span>{/if}
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="espacioId">Espacio afectado <span class="required">*</span></label>
          <select id="espacioId" name="espacioId" required bind:value={espacioId} class:error={form?.errors?.espacioId}>
            <option value="">Selecciona un espacio...</option>
            {#each Object.entries(espaciosPorPlanta) as [planta, lista]}
              <optgroup label={planta}>
                {#each lista as e}
                  <option value={e.id} selected={form?.espacioId === e.id}>{e.nombre}</option>
                {/each}
              </optgroup>
            {/each}
          </select>
          {#if form?.errors?.espacioId}<span class="field-error">{form.errors.espacioId}</span>{/if}
        </div>

        <div class="form-group">
          <label for="equipoId">Equipo afectado <small>(opcional)</small></label>
          <select id="equipoId" name="equipoId" disabled={!espacioId || cargandoEquipos}>
            <option value="">{cargandoEquipos ? 'Cargando...' : 'Ninguno / No aplica'}</option>
            {#each equipos as eq}
              <option value={eq.id} selected={form?.equipoId === eq.id}>{eq.nombre}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Prioridad</label>
        <div class="prioridad-options">
          {#each [['BAJA','Baja','🟢'], ['MEDIA','Media','🟡'], ['ALTA','Alta','🟠'], ['URGENTE','Urgente','🔴']] as [val, label, icon]}
            <label class="radio-card prioridad-{val.toLowerCase()}">
              <input type="radio" name="prioridad" value={val} checked={val === (form?.prioridad ?? 'MEDIA')} />
              <span>{icon} {label}</span>
            </label>
          {/each}
        </div>
      </div>

      <div class="form-group">
        <label for="descripcion">Descripción <span class="required">*</span></label>
        <textarea id="descripcion" name="descripcion" required rows="5"
          placeholder="Describe el problema con el mayor detalle posible: qué ocurre, cuándo empezó, si ya ha pasado antes..."
          class:error={form?.errors?.descripcion}
        >{form?.descripcion ?? ''}</textarea>
        {#if form?.errors?.descripcion}<span class="field-error">{form.errors.descripcion}</span>{/if}
      </div>

      <div class="form-actions">
        <a href="/incidencias" class="btn btn-outline">Cancelar</a>
        <button type="submit" class="btn btn-primary">Registrar incidencia</button>
      </div>
    </form>
  </div>
</div>

<style>
  .page { padding: 2rem; max-width: 780px; }
  .page-header { margin-bottom: 1.5rem; }
  .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--color-primary); margin-top: 0.25rem; }
  .back-link { font-size: 0.875rem; color: var(--color-text-soft); }
  .back-link:hover { color: var(--color-primary); }
  .form-card { max-width: 100%; }
  .form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  label { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }
  label small { font-weight: 400; color: var(--color-text-soft); }
  .required { color: var(--color-danger); }
  input[type="text"], select, textarea { padding: 0.6rem 0.875rem; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit; font-size: 0.9rem; color: var(--color-text); background: white; transition: border-color var(--transition); width: 100%; }
  input:focus, select:focus, textarea:focus { outline: none; border-color: var(--color-primary-mid); box-shadow: 0 0 0 3px var(--color-primary-light); }
  input.error, select.error, textarea.error { border-color: var(--color-danger); }
  textarea { resize: vertical; min-height: 120px; }
  select:disabled { opacity: 0.6; cursor: not-allowed; }
  .field-error { font-size: 0.8rem; color: var(--color-danger); }
  .prioridad-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .radio-card { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all var(--transition); }
  .radio-card input { display: none; }
  .radio-card:has(input:checked) { border-width: 2px; }
  .radio-card.prioridad-baja:has(input:checked)    { border-color: #16a34a; background: #f0fdf4; color: #166534; }
  .radio-card.prioridad-media:has(input:checked)   { border-color: #2563eb; background: #eff6ff; color: #1d4ed8; }
  .radio-card.prioridad-alta:has(input:checked)    { border-color: #ea580c; background: #fff7ed; color: #c2410c; }
  .radio-card.prioridad-urgente:has(input:checked) { border-color: #dc2626; background: #fef2f2; color: #b91c1c; }
  .alert { padding: 0.875rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1.25rem; font-size: 0.9rem; }
  .alert-error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
  .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--color-border); }
</style>
