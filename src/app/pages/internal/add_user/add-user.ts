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
  private readonly cdr = inject(ChangeDetectorRef);

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

      this.internalService
        .createInternalUser(this.add_user_form.value, localStorage.getItem('internal_user_token')!)
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

              if (response.statusCode === 200) {
                Toastify({
                  text: response.message,
                  duration: 5000,
                  position: 'center',
                  style: {
                    background: '#4FCBB5',
                  },
                }).showToast(); //Consulted (12-2023) in: https://apvarun.github.io/toastify-js/, https://github.com/apvarun/toastify-js/blob/master/README.md
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

              Toastify({
                text: 'Error: ' + error.message,
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
