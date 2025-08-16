import {Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'habituary-button',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './habituary-button.component.html',
  styleUrl: './habituary-button.component.css'
})
export class HabituaryButtonComponent {
  @Input() color: 'primary' | 'danger' | 'success' | 'warning' | 'neutral' | 'ghost' | 'outline' = 'primary';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @Input() pill = false;
  @Input() outline = false;
  @Input() ghost = false;
  @Input() fullWidth = false;
  @Input() loading = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() routerLink: any;
  @Input() queryParams: any;
  @Input() ariaLabel?: string;
  @Input() extraClasses = '';
}
