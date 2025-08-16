import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {DataService} from '../../services/data.service';
import {ToasterService} from '../../services/toaster.service';
import {IUser} from '../../../core/entities/IUser';
import {lastValueFrom} from 'rxjs';
import {HabituaryButtonComponent} from '../../components/habituary-button/habituary-button.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HabituaryButtonComponent],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css'
})
export class ProfilePageComponent implements OnInit {
  loadingFlag = signal(true);
  savingFlag = signal(false);
  currentUser = signal<IUser>({} as IUser);
  profileFormGroup: FormGroup = new FormGroup({
    emailForm: new FormControl({value: '', disabled: true}),
    usernameForm: new FormControl('')
  });
  private dataService = inject(DataService);
  private toasterService = inject(ToasterService);
  private formBuilder = inject(FormBuilder);

  get canSaveChangesFlag(): boolean {
    if (!this.profileFormGroup) return false;
    const currentUserValue = this.currentUser();
    if (!currentUserValue) return false;

    const usernameValue: string = this.profileFormGroup.get('usernameForm')?.value?.trim();
    const unchangedFlag = usernameValue === currentUserValue.username;

    return this.profileFormGroup.valid && !this.savingFlag() && !unchangedFlag;
  }

  async ngOnInit() {
    await this.loadCurrentUser();
  }

  async save() {
    if (!this.canSaveChangesFlag) {
      return;
    }
    this.savingFlag.set(true);
    const usernameValue: string = this.profileFormGroup.get('usernameForm')!.value.trim();
    const updatePayload: IUser = {
      irn: this.currentUser().irn,
      email: this.currentUser().email,
      username: usernameValue
    };
    try {
      const updatedUser = await lastValueFrom(this.dataService.update<IUser>('user', this.currentUser()?.irn ?? '', {userEntity: updatePayload}));
      this.currentUser.set(updatedUser);
      this.profileFormGroup.get('usernameForm')!.setValue(updatedUser.username, {emitEvent: false});
      this.toasterService.success('Perfil actualizado');
    } finally {
      this.savingFlag.set(false);
    }
  }

  private buildForm(user: IUser) {
    this.profileFormGroup = this.formBuilder.group({
      emailForm: [{value: user.email, disabled: true}],
      usernameForm: [{
        value: user.username,
        disabled: this.savingFlag()
      }, [Validators.required, Validators.minLength(3), Validators.maxLength(40)]]
    });
  }

  private async loadCurrentUser() {
    try {
      const userResponse = await lastValueFrom(this.dataService.getAll<IUser>('user')) as unknown as IUser;
      this.currentUser.set(userResponse);
      this.buildForm(userResponse);
    } finally {
      this.loadingFlag.set(false);
    }
  }
}
