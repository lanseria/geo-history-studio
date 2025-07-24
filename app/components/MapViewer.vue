<script setup lang="ts">
import { useViewerStore } from '~/stores/viewer'
// 引入 MapLibre 的 CSS
import 'maplibre-gl/dist/maplibre-gl.css'

const viewerStore = useViewerStore()
const mapContainer = ref<HTMLDivElement>()

onMounted(async () => {
  await nextTick()
  if (mapContainer.value)
    viewerStore.initMap(mapContainer.value)
})

onUnmounted(() => {
  viewerStore.destroyMap()
})
</script>

<template>
  <div id="map-container" ref="mapContainer" class="h-full w-full" />
</template>

<style>
/* MapLibre 的 UI 元素样式覆盖 */
.maplibregl-ctrl-group button {
  background-color: var(--color-surface-muted) !important;
  border-radius: 8px !important;
}
.maplibregl-ctrl-group button .maplibregl-ctrl-icon {
  filter: invert(var(--maplibre-icon-invert, 0));
}
html.dark .maplibregl-ctrl-group button .maplibregl-ctrl-icon {
  filter: invert(var(--maplibre-icon-invert, 1));
}

.maplibregl-popup-content {
  background: var(--color-surface-muted) !important;
  color: var(--color-prose-base) !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.maplibregl-popup-close-button {
  color: var(--color-prose-base) !important;
}
</style>
