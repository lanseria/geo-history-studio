import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  // [核心修改] 更新 shortcuts 以使用新的语义化颜色名称
  shortcuts: [
    ['btn', 'px-4 py-1 rounded inline-block bg-brand-primary text-white cursor-pointer hover:bg-brand-primary/90 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
    ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-brand-primary'],
    ['card', 'bg-surface-muted rounded-lg shadow-md p-4'],
    ['input-base', 'w-full px-4 py-2 border border-border-base rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary transition'],
  ],
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
      processors: createLocalFontProcessor(),
    }),
  ],
  // [核心修改] 采用嵌套对象来定义主题颜色，生成更优雅的类名
  theme: {
    colors: {
      brand: {
        primary: 'var(--color-brand-primary)',
        secondary: 'var(--color-brand-secondary)',
      },
      surface: {
        base: 'var(--color-surface-base)',
        muted: 'var(--color-surface-muted)',
      },
      prose: {
        base: 'var(--color-prose-base)',
        muted: 'var(--color-prose-muted)',
      },
      border: {
        base: 'var(--color-border-base)',
      },
    },
  },
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
