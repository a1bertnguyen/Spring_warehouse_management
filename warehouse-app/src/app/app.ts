import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule],
  template: '<router-outlet></router-outlet>'
})
export class App {
  protected readonly title = signal('warehouse-app');
}
