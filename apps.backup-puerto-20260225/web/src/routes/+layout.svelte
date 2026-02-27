<script lang="ts">
  import '../app.css'
  import { page } from '$app/stores'
  import type { LayoutData } from './$types'

  export let data: LayoutData
  $: user = data.user
  $: isLoginPage = $page.url.pathname === '/login' || $page.url.pathname === '/'
</script>

{#if isLoginPage || !user}
  <slot />
{:else}
  <div class="layout">
    <!-- Barra lateral de navegación -->
    <nav class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">🏫</span>
          <div class="logo-text">
            <strong>IES Félix de Azara</strong>
            <small>Intranet</small>
          </div>
        </div>
      </div>

      <ul class="nav-links">
        <li>
          <a href="/dashboard" class:active={$page.url.pathname === '/dashboard'}>
            <span class="icon">⊞</span> Dashboard
          </a>
        </li>
        <li>
          <a href="/incidencias" class:active={$page.url.pathname.startsWith('/incidencias')}>
            <span class="icon">🔧</span> Incidencias TIC
          </a>
        </li>
        <li>
          <a href="/ausencias" class:active={$page.url.pathname.startsWith('/ausencias')}>
            <span class="icon">📅</span> Ausencias
          </a>
        </li>
        {#if user.role === 'ADMIN'}
          <li class="nav-section">Administración</li>
          <li>
            <a href="/admin/usuarios" class:active={$page.url.pathname.startsWith('/admin')}>
              <span class="icon">👥</span> Usuarios
            </a>
          </li>
        {/if}
      </ul>

      <!-- Perfil del usuario -->
      <div class="sidebar-footer">
        <div class="user-info">
          {#if user.avatar}
            <img src={user.avatar} alt={user.name} class="avatar" referrerpolicy="no-referrer" />
          {:else}
            <div class="avatar avatar-placeholder">{user.name[0]}</div>
          {/if}
          <div class="user-details">
            <span class="user-name">{user.name}</span>
            <span class="badge badge-{user.role.toLowerCase()}">{user.role}</span>
          </div>
        </div>
        <form method="POST" action="/logout">
          <button class="btn-logout" type="submit" title="Cerrar sesión">⏻</button>
        </form>
      </div>
    </nav>

    <!-- Contenido principal -->
    <main class="main-content">
      <slot />
    </main>
  </div>
{/if}

<style>
  .layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    min-height: 100vh;
  }

  /* Sidebar */
  .sidebar {
    background: var(--color-primary);
    color: white;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .sidebar-header { padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,.12); }

  .logo { display: flex; align-items: center; gap: 0.75rem; }
  .logo-icon { font-size: 1.8rem; }
  .logo-text { display: flex; flex-direction: column; }
  .logo-text strong { font-size: 0.9rem; line-height: 1.2; }
  .logo-text small { font-size: 0.7rem; opacity: 0.7; text-transform: uppercase; letter-spacing: .05em; }

  .nav-links {
    list-style: none;
    padding: 1rem 0;
    flex: 1;
    overflow-y: auto;
  }

  .nav-links li a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    color: rgba(255,255,255,.8);
    font-size: 0.9rem;
    transition: all var(--transition);
    text-decoration: none;
  }
  .nav-links li a:hover,
  .nav-links li a.active {
    background: rgba(255,255,255,.12);
    color: white;
  }
  .nav-links li a.active { border-left: 3px solid white; }
  .icon { font-size: 1rem; width: 20px; text-align: center; }

  .nav-section {
    padding: 1rem 1.5rem 0.25rem;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: rgba(255,255,255,.45);
  }

  /* Footer del sidebar */
  .sidebar-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(255,255,255,.12);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .user-info { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
  .avatar {
    width: 36px; height: 36px; border-radius: 50%;
    object-fit: cover; flex-shrink: 0;
    border: 2px solid rgba(255,255,255,.3);
  }
  .avatar-placeholder {
    background: rgba(255,255,255,.2);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; color: white; font-size: 1rem;
  }
  .user-details { display: flex; flex-direction: column; min-width: 0; }
  .user-name { font-size: 0.8rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: white; }

  .btn-logout {
    background: rgba(255,255,255,.1);
    color: white;
    border: none;
    padding: 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 1rem;
    flex-shrink: 0;
    transition: background var(--transition);
  }
  .btn-logout:hover { background: rgba(255,255,255,.2); }

  /* Contenido */
  .main-content { overflow-y: auto; }
</style>
