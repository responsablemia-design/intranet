<script lang="ts">
  import { page } from '$app/stores'

  const errorMessages: Record<string, string> = {
    domain_not_allowed: 'Solo se permiten cuentas @iesfelixdeazara.com.',
    account_disabled: 'Tu cuenta ha sido desactivada. Contacta con el administrador.',
    token_error: 'Error al conectar con Google. Inténtalo de nuevo.',
    server_error: 'Error interno del servidor. Inténtalo más tarde.',
  }

  $: errorKey = $page.url.searchParams.get('error') ?? ''
  $: errorMsg = errorMessages[errorKey] ?? ''
</script>

<svelte:head>
  <title>Acceso — Intranet IES Félix de Azara</title>
</svelte:head>

<div class="login-page">
  <div class="login-card">
    <div class="login-header">
      <span class="school-icon">🏫</span>
      <h1>IES Félix de Azara</h1>
      <p class="subtitle">Portal Intranet del Centro</p>
    </div>

    {#if errorMsg}
      <div class="error-box" role="alert">
        ⚠️ {errorMsg}
      </div>
    {/if}

    <div class="login-body">
      <p class="login-desc">
        Accede con tu cuenta institucional <strong>@iesfelixdeazara.com</strong>
        de Google Workspace.
      </p>

      <a href="http://172.30.200.240:3000/auth/demo-login" class="btn-google">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22" height="22">
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.14z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.16C6.51 42.62 14.62 48 24 48z"/>
          <path fill="#FBBC05" d="M10.53 28.64A14.95 14.95 0 0 1 9.5 24c0-1.62.28-3.19.77-4.64l-7.98-6.16A23.93 23.93 0 0 0 0 24c0 3.77.9 7.34 2.46 10.51l8.07-5.87z"/>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.46 13.49l7.98 6.16C12.43 13.72 17.74 9.5 24 9.5z"/>
        </svg>
        Entrar como Demo
      </a>
    </div>

    <footer class="login-footer">
      <p>Solo usuarios del dominio <strong>@iesfelixdeazara.com</strong></p>
      <p>Zaragoza, Aragón · <a href="https://iesfelixdeazara.com" target="_blank" rel="noreferrer">iesfelixdeazara.com</a></p>
    </footer>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-mid) 100%);
    padding: 1rem;
  }

  .login-card {
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-width: 420px;
    overflow: hidden;
  }

  .login-header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-mid) 100%);
    color: white;
    text-align: center;
    padding: 2.5rem 2rem 2rem;
  }
  .school-icon { font-size: 3rem; display: block; margin-bottom: 0.75rem; }
  .login-header h1 { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.25rem; }
  .subtitle { font-size: 0.85rem; opacity: 0.8; }

  .login-body { padding: 2rem; }

  .login-desc {
    color: var(--color-text-soft);
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 1.75rem;
    line-height: 1.6;
  }

  .btn-google {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.85rem;
    background: white;
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-text);
    transition: all var(--transition);
    box-shadow: var(--shadow-sm);
    text-decoration: none;
  }
  .btn-google:hover {
    border-color: var(--color-primary-mid);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
    text-decoration: none;
  }

  .error-box {
    margin: 0 2rem;
    margin-top: 1rem;
    padding: 0.85rem 1rem;
    background: #fef2f2;
    border: 1px solid #fca5a5;
    border-radius: var(--radius-sm);
    color: #b91c1c;
    font-size: 0.85rem;
  }

  .login-footer {
    padding: 1rem 2rem 1.5rem;
    text-align: center;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-soft);
    font-size: 0.78rem;
    line-height: 1.8;
  }
  .login-footer a { color: var(--color-primary-mid); }
</style>
