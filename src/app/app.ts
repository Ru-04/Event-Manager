import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent,HttpClientModule],
  template: `
    <div class="container">
      <app-sidebar></app-sidebar>
      <div >
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .container {
      display: flex;      
    }

  `]
})
export class AppComponent {}
