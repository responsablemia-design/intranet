<script lang="ts">
  import type { PageData } from './$types'
  export let data: PageData
  $: user = data.user!

  const modules = [
    {
      id: 'incidencias',
      title: 'Incidencias TIC',
      description: 'Registra y gestiona incidencias informáticas y de equipamiento del centro.',
      icon: '🔧',
      href: '/incidencias',
      color: '#3b82f6',
      roles: ['ADMIN', 'PROFESOR', 'ALUMNO'],
    },
    {
      id: 'ausencias',
      title: 'Ausencias',
      description: 'Gestiona ausencias del profesorado, sustituciones y registro histórico.',
      icon: '📅',
      href: '/ausencias',
      color: '#8b5cf6',
      roles: ['ADMIN', 'PROFESOR'],
    },
    {
      id: 'aulas',
      title: 'Incidencias de Aulas',
      description: 'Notifica problemas de mobiliario, climatización e instalaciones.',
      icon: '🏛️',
      href: '/aulas',
      color: '#f59e0b',
      roles: ['ADMIN', 'PROFESOR'],
    },
  ]

  $: availableModules = modules.filter(m => m.roles.includes(user.role))
</script>

<svelte:head>
  <title>Dashboard — Intranet IES Félix de Azara</title>
</svelte:head>

<div class="dashboard">
  <header class="page-header">
    <div>
      <h1>Bienvenido, {user.name.split(' ')[0]} 👋</h1>
      <p class="subtitle">Panel principal de la Intranet del IES Félix de Azara</p>
    </div>
    <div class="header-meta">
      <span class="badge badge-{user.role.toLowerCase()}">{user.role}</span>
      <time>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</time>
    </div>
  </header>

  <!-- Módulos disponibles -->
  <section class="section">
    <h2 class="section-title">Módulos disponibles</h2>
    <div class="modules-grid">
      {#each availableModules as mod}
        <a href={mod.href} class="module-card" style="--accent: {mod.color}">
          <div class="module-icon" style="background: {mod.color}15; color: {mod.color}">
            {mod.icon}
          </div>
          <div class="module-content">
            <h3>{mod.title}</h3>
            <p>{mod.description}</p>
          </div>
          <span class="module-arrow">→</span>
        </a>
      {/each}
    </div>
  </section>

  <!-- Panel de info rápida -->
  <section class="section">
    <h2 class="section-title">Información rápida</h2>
    <div class="info-grid">
      <div class="info-card">
        <span class="info-icon">🌐</span>
        <div>
          <strong>Dominio</strong>
          <span>iesfelixdeazara.com</span>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">✉️</span>
        <div>
          <strong>Tu correo</strong>
          <span>{user.email}</span>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">🔐</span>
        <div>
          <strong>Sesión</strong>
          <span>Google OAuth2 · Activa</span>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .dashboard { padding: 2rem; max-width: 1100px; }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2.5rem;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .page-header h1 { font-size: 1.75rem; font-weight: 700; color: var(--color-primary); }
  .subtitle { color: var(--color-text-soft); margin-top: 0.25rem; font-size: 0.9rem; }
  .header-meta {
    display: flex; flex-direction: column; align-items: flex-end;
    gap: 0.5rem; color: var(--color-text-soft); font-size: 0.85rem;
  }

  .section { margin-bottom: 2.5rem; }
  .section-title {
    font-size: 1rem; font-weight: 600; color: var(--color-text-soft);
    text-transform: uppercase; letter-spacing: .06em;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  /* Módulos */
  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .module-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: white;
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    text-decoration: none;
    color: var(--color-text);
    transition: all var(--transition);
    box-shadow: var(--shadow-sm);
  }
  .module-card:hover {
    border-color: var(--accent);
    box-shadow: 0 4px 20px color-mix(in srgb, var(--accent) 20%, transparent);
    transform: translateY(-2px);
    text-decoration: none;
  }

  .module-icon {
    font-size: 1.75rem;
    width: 56px; height: 56px;
    border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .module-content { flex: 1; min-width: 0; }
  .module-content h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }
  .module-content p { font-size: 0.82rem; color: var(--color-text-soft); line-height: 1.4; }

  .module-arrow { color: var(--color-text-soft); font-size: 1.1rem; flex-shrink: 0; }

  /* Info rápida */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
  .info-card {
    background: white;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    box-shadow: var(--shadow-sm);
  }
  .info-icon { font-size: 1.5rem; }
  .info-card div { display: flex; flex-direction: column; min-width: 0; }
  .info-card strong { font-size: 0.78rem; text-transform: uppercase; letter-spacing: .04em; color: var(--color-text-soft); }
  .info-card span { font-size: 0.88rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
