import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  informationCircleOutline,
  businessOutline,
  peopleOutline,
  cartOutline,
  createOutline,
  logInOutline,
  personCircleOutline,
  logOutOutline,
  speedometerOutline,
  receiptOutline,
  pricetagsOutline,
  statsChartOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  arrowBackOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

// Register the icons used by the app to avoid runtime URL resolution of SVGs
addIcons({
  'home-outline': homeOutline,
  'information-circle-outline': informationCircleOutline,
  'business-outline': businessOutline,
  'people-outline': peopleOutline,
  'cart-outline': cartOutline,
  'create-outline': createOutline,
  'log-in-outline': logInOutline,
  'person-circle-outline': personCircleOutline,
  'log-out-outline': logOutOutline,
  'speedometer-outline': speedometerOutline,
  'receipt-outline': receiptOutline,
  'pricetags-outline': pricetagsOutline,
  'stats-chart-outline': statsChartOutline,
  'mail-outline': mailOutline,
  'lock-closed-outline': lockClosedOutline,
  'eye-outline': eyeOutline,
  'arrow-back-outline': arrowBackOutline,
  'chevron-back-outline': chevronBackOutline,
  'chevron-forward-outline': chevronForwardOutline,
});

// Force initial load to Home if current URL is /login (e.g., stale tab)
try {
  const path = window.location.pathname + window.location.hash;
  if (path.includes('/login')) {
    const base = (document.getElementsByTagName('base')[0]?.getAttribute('href')) || '/';
    const normalizedBase = base.endsWith('/') ? base : base + '/';
    history.replaceState(null, '', normalizedBase + 'home');
  }
} catch {}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withEnabledBlockingInitialNavigation()
    ),
  ],
});
