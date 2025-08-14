import {Component, inject, OnInit, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MenuComponent} from '../menu/menu.component';
import {ToasterComponent} from '../toaster/toaster.component';
import {DataService} from '../../services/data.service';
import {lastValueFrom} from 'rxjs';

@Component({
  selector: 'app-wrapper',
  standalone: true,
  imports: [RouterOutlet, MenuComponent, ToasterComponent],
  templateUrl: './app-wrapper.component.html'
})
export class AppWrapperComponent implements OnInit {
  isAuthenticated = signal(false);
  private data = inject(DataService);

  async ngOnInit() {
    try {
      await lastValueFrom(this.data.ping());
      this.isAuthenticated.set(true);
    } catch {
      this.isAuthenticated.set(false);
    }
  }
}

