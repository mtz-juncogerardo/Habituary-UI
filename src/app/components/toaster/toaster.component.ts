import {Component, inject} from '@angular/core';
import {NgClass} from '@angular/common';
import {Toast, ToasterService} from '../../services/toaster.service';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toaster.component.html',
  styleUrl: './toaster.component.css'
})
export class ToasterComponent {
  private readonly service = inject(ToasterService);
  toasts = this.service.toasts; // signal<Toast[]>

  trackById(index: number, t: Toast) {
    return t.id;
  }

  dismiss(id: string) {
    this.service.dismiss(id);
  }
}

