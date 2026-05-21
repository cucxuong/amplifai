export function useAppBottomDock() {
  const dockHeight = useState('app-bottom-dock-height', () => 0)

  function setDockHeight(height: number) {
    const px = Math.ceil(height)
    dockHeight.value = px

    if (import.meta.client)
      document.documentElement.style.setProperty('--app-bottom-dock-height', `${px}px`)
  }

  function clearDockHeight() {
    dockHeight.value = 0

    if (import.meta.client)
      document.documentElement.style.setProperty('--app-bottom-dock-height', '0px')
  }

  return { dockHeight, setDockHeight, clearDockHeight }
}
