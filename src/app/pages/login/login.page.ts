import {Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {ToasterService} from '../../services/toaster.service';
import {lastValueFrom} from 'rxjs';
import {HabituaryButtonComponent} from '../../components/habituary-button/habituary-button.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [HabituaryButtonComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
})
export class LoginPageComponent implements OnInit {
  loading = signal(false);
  private router = inject(Router);
  private dataService = inject(DataService);
  private toaster = inject(ToasterService);
  private readonly oauthEndpoint = 'https://localhost:5001/api/googleAuth/login';

  ngOnInit() {
    this.checkExistingSession();
  }

  async googleLogin() {
    if (this.loading()) return;
    this.loading.set(true);
    // Abrir flujo OAuth mediante redirección completa para evitar CORS en XHR
    window.location.href = this.oauthEndpoint;
  }

  private async checkExistingSession() {
    try {
      await lastValueFrom(this.dataService.ping());
      this.toaster.info('Sesión activa detectada');
      await this.router.navigateByUrl('/home');
    } catch (e) {
      // Ignorar error: sesión no válida; permitir flujo normal de login
    }
  }
}
