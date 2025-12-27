import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import router from './router'
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import BadgeDirective from 'primevue/badgedirective';

const app = createApp(App);

app.use(router);
app.use(ToastService);
app.directive('tooltip', Tooltip);
app.directive('badge', BadgeDirective);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.app-dark',
            cssLayer: false
        }
    }
});

app.mount('#app');
