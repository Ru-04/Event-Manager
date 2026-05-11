import { Routes } from '@angular/router';
import { GuestFormComponent } from './components/guest-form/guest-form';
import { CalendarComponent } from './calendar/calendar';

export const routes: Routes = [
  { path: '', redirectTo: '/calendar', pathMatch: 'full' },
  { path: 'calendar', component: CalendarComponent },
  { path: 'guests', component: GuestFormComponent }
  
];
