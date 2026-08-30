/**
 * Laeuft einmal beim Hochfahren des Servers, vor der ersten Anfrage.
 *
 * Hier steht absichtlich fast nichts: `register` wird fuer JEDE Laufzeit
 * aufgerufen, also auch fuer die Edge, in der die Middleware sitzt. Alles,
 * was Node braucht (Dateisystem, Pfade), gehoert deshalb in ein eigenes
 * Modul, das nur im Node-Zweig geladen wird. Stuende es hier, buendelte
 * der Packer es auch fuer die Edge und warnte bei jedem Build, dass dort
 * kein `node:fs` existiert.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation-node')
  }
}
