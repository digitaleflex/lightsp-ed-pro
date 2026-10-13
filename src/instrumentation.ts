// Point d'entrée Next.js : démarre la surveillance automatique des sites
// indexés dès le lancement du serveur (Node uniquement).
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureScheduler } = await import('./lib/scheduler')
    ensureScheduler()
  }
}
