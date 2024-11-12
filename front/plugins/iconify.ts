// plugins/iconify.ts
import { addCollection } from '@iconify/vue';
import mdiIcons from '@iconify-json/mdi/icons.json';

export default defineNuxtPlugin((nuxtApp) => {
    // 加载本地 mdi 图标集
    addCollection(mdiIcons);
});
