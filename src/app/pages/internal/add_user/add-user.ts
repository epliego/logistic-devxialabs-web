import { Component, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { InternalService } from '../../../services/internal.service';

const $ = (window as any).$;

declare const Toastify: any;

@Component({
  selector: 'add-user-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.css',
})
export class AddUser {
  protected readonly title = signal('Internal - Add User');

  private readonly internalService = inject(InternalService);

  public internal_user_profile_list = signal<any[]>([]);

  add_user_form!: FormGroup;

  constructor(private fb: FormBuilder) {
    // this.initForm();
    this.initializeForm();
  }

  public async ngOnInit(): Promise<void> {
    if (typeof (window as any).$ === 'undefined') {
      console.warn('jQuery not available, skipping DataTable init');

      return;
    }

    this.internalService
      .getInternalUserProfile(localStorage.getItem('internal_user_token')!)
      .subscribe((res: any) => {
        this.internal_user_profile_list.set(res.data[0]);
      });
  }

  /**
   * Initialize Add User Form
   * @private
   */
  private initializeForm() {
    this.add_user_form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      password: ['', [Validators.required]],
      profile_id: ['', [Validators.required]],
    });
  }

  /**
   * Add new User
   */
  onSubmit() {
    if (this.add_user_form.valid) {
      // console.log('Datos enviados:', this.add_user_form.value);

      const profile_id = this.add_user_form.get('profile_id')?.value;
      const body = {
        ...this.add_user_form.value,
        profile_id: Number.parseInt(profile_id),
      };

      this.internalService
        .createInternalUser(body, localStorage.getItem('internal_user_token')!)
        .pipe(
          tap(() => {
            // this.isLoading = true;
            // console.log('beforeSend: Spinner activated, UI disabled.');
            $('.button-add-user').attr('disabled', true);

            $('.text-send').css('display', 'none');

            $('.button-add-user').addClass('btn-load');

            $('.spinner-border').css('display', 'block');
            $('.flex-grow-1').css('display', 'block');
          }),
          tap({
            next: (response: any) => {
              // this.isLoading = false;
              // console.log('Success callback: Data saved!', response);

              if (response.statusCode === 201) {
                Toastify({
                  text: response.system_message.join(',\n'),
                  duration: 5000,
                  position: 'center',
                  style: {
                    background: '#4FCBB5',
                  },
                }).showToast(); //Consulted (12-2023) in: https://apvarun.github.io/toastify-js/, https://github.com/apvarun/toastify-js/blob/master/README.md

                this.add_user_form.reset({
                  profile_id: '',
                });
              } else {
                let message_text;
                if (response.errors !== undefined) {
                  message_text = response.errors.join(',\n');
                } else {
                  message_text = response.message;
                }

                Toastify({
                  text: message_text,
                  duration: 5000,
                  position: 'center',
                  style: {
                    background: '#EF6548',
                  },
                }).showToast(); //Consulted (12-2023) in: https://apvarun.github.io/toastify-js/, https://github.com/apvarun/toastify-js/blob/master/README.md
              }

              $('.button-add-user').attr('disabled', false);

              $('.text-send').css('display', 'block');

              $('.button-add-user').removeClass('btn-load');

              $('.spinner-border').css('display', 'none');
              $('.flex-grow-1').css('display', 'none');
            },
            error: (error: any) => {
              // formularioCrearPaqueteThis.isLoading = false;
              // console.error('Error callback:', error);

              let message_text;
              if (error.error.statusCode === 400) {
                if (error.error.errors !== undefined) {
                  message_text = error.error.errors.join(',\n');
                } else {
                  message_text = error.error.message.join(',\n');
                }
              } else {
                message_text = error.message;
              }

              Toastify({
                text: 'Error:\n' + message_text,
                duration: 5000,
                position: 'center',
                style: {
                  background: '#EF6548',
                },
              }).showToast(); //Consulted (12-2023) in: https://github.com/apvarun/toastify-js/blob/master/README.md

              $('.button-add-user').attr('disabled', false);

              $('.text-send').css('display', 'block');

              $('.button-add-user').removeClass('btn-load');

              $('.spinner-border').css('display', 'none');
              $('.flex-grow-1').css('display', 'none');
            },
          }),
        )
        .subscribe();
    }
  }
}
