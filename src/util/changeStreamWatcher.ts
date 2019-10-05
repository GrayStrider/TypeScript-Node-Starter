export const initializeWatchers = (watchers: (() => unknown)[]) => {
  for (const watcher of watchers) {
    watcher()
  }
}
