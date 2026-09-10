import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { InternalUserService } from '../../../services/internal-user.service';

const $ = (window as any).$;

declare const Toastify: any;

@Component({
  selector: 'iniciar-sesion-root',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  protected readonly title = signal('Internal User');

  private readonly router = inject(Router);

  formInternalUserLogin!: FormGroup;

  private readonly internalUserService = inject(InternalUserService);

  constructor(private fb: FormBuilder) {
    this.initializeInternalUserLoginForm();
  }

  /**
   * Initialize login form with validations
   * @private
   */
  private initializeInternalUserLoginForm() {
    this.formInternalUserLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  public async ngOnInit(): Promise<void> {
    localStorage.clear();
  }

  /**
   * Enviar los datos para actualizar los datos del paquete
   */
  onSubmit() {
    const ngOnSubmitThis = this;

    if (this.formInternalUserLogin.valid) {
      // console.log('Sent data:', this.formInternalUserLogin.value);

      this.internalUserService
        .internalUserLogin(
          this.formInternalUserLogin.value,
        )
        .pipe(
          tap(() => {
            // this.isLoading = true;
            // console.log('beforeSend: Spinner activated, UI disabled.');
            $('.btn-success').attr('disabled', true);

            $('.text-send').css('display', 'none');

            $('.btn-success').addClass('btn-load');

            $('.spinner-border').css('display', 'block');
            $('.flex-grow-1').css('display', 'block');
          }),
          tap({
            next: (response: any) => {
              // this.isLoading = false;
              // console.log(response);

              if (response.statusCode === 200) {
                Toastify({
                  // text: response.message,
                  text: 'Bienvenido',
                  duration: 5000,
                  position: 'center',
                  style: {
                    background: '#4FCBB5',
                  },
                }).showToast(); //Consulted (12-2023) in: https://apvarun.github.io/toastify-js/, https://github.com/apvarun/toastify-js/blob/master/README.md

                ngOnSubmitThis.router.navigate(['/internal/shipments']);

                localStorage.setItem('internal_user_token', response.data[0].access_token);
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

              $('.btn-success').attr('disabled', false);

              $('.text-send').css('display', 'block');

              $('.btn-success').removeClass('btn-load');

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

              $('.btn-success').attr('disabled', false);

              $('.text-send').css('display', 'block');

              $('.btn-success').removeClass('btn-load');

              $('.spinner-border').css('display', 'none');
              $('.flex-grow-1').css('display', 'none');
            },
          }),
        )
        .subscribe();
    }
  }
}
