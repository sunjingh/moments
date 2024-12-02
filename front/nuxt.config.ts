// https://nuxt.com/docs/api/configuration/nuxt-config

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver';
import Components from 'unplugin-vue-components/vite';

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: {enabled: false},
    modules: ["@nuxt/ui", '@vueuse/nuxt', 'dayjs-nuxt'],
    ssr: false,
    dayjs: {
        locales: ['zh'],
        defaultLocale: 'zh'
    },
    ui: {
        button: {
            default: {
                loadingIcon: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1em\' height=\'1em\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23000\' d=\'M6 15h1.5V9H5v1.5h1zm3.5 0H12q.425 0 .713-.288T13 14v-4q0-.425-.288-.712T12 9H9.5q-.425 0-.712.288T8.5 10v4q0 .425.288.713T9.5 15m.5-1.5v-3h1.5v3zm3.925 1.5h1.5v-2.25l1.75 2.25H19l-2.325-3L19 9h-1.825l-1.75 2.25V9h-1.5zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zM5 5v14z\'/%3E%3C/svg%3E")'
            }
        }
    },
    tailwindcss: {
        safelist: [
            'grid-cols-1',
            'grid-cols-3',
        ]
    },
    vue: {
        compilerOptions: {
            isCustomElement: (tag: string) => ['meting-js'].includes(tag),
        },
    },
    app: {
        head: {
            meta: [
                {name: "viewport", content: "width=device-width, initial-scale=1, user-scalable=no"},
                {charset: "utf-8"},
            ],
            link: [
                {href: `/css/APlayer.min.css`, rel: 'stylesheet'},
            ],
            script: [
                {src: `/js/APlayer.min.js`, type: 'text/javascript', async: true, defer: true},
                {src: `/js/Meting.min.js`, type: 'text/javascript', async: true, defer: true},
                {src: `/js/main.js`, type: 'text/javascript', async: true, defer: true},
            ]
        }
    },
    vite: {
        plugins: [
            Components({
                resolvers: [
                    IconsResolver({
                        prefix: 'Icon', // 这个前缀可以自定义
                    }),
                ],
            }),
            Icons({
                autoInstall: true, // 自动安装缺失的图标集
            }),
        ],
        server: {
            proxy: {
                "/api": {
                    target: "http://localhost:37892",
                    changeOrigin: true,
                    // rewrite: (path) => path.replace(/^\/api/, ""),
                },
                "/upload": {
                    target: "http://localhost:37892",
                    changeOrigin: true,
                }
            },
        },
        build: {
            rollupOptions: {
                output: {
                    hashCharacters: 'base36'
                }
            }
        }
    }
})