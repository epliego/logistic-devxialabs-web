import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { InternalService } from '../../../services/internal.service';

const $ = (window as any).$;

declare const Toastify: any;

@Component({
  selector: 'ver-paquete-root',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './view-shipment.html',
  styleUrl: './view-shipment.css',
})
export class ViewShipment {
  protected readonly title = signal('Internal - Ver Shipments');

  protected readonly paqueteId = signal<number | null>(null);
  private readonly route = inject(ActivatedRoute);

  private readonly paquetesService = inject(InternalService);

  formActualizarPaquete!: FormGroup;

  estados = [
    { id: 'REGISTRADO', label: 'REGISTRADO' },
    { id: 'EN_TRANSITO', label: 'EN_TRANSITO' },
    { id: 'ENTREGADO', label: 'ENTREGADO' },
    { id: 'DEVUELTO', label: 'DEVUELTO' },
  ];

  constructor(private fb: FormBuilder) {
    // this.initForm();
    this.inicializarForm();
  }

  public async ngOnInit(): Promise<void> {
    const idStr = this.route.snapshot.paramMap.get('id');
    const idNum = idStr ? Number(idStr) : NaN;
    this.paqueteId.set(Number.isFinite(idNum) ? idNum : null);

    this.cargarDatosPaquete();
  }

  /**
   * Inicializar el formulario de actualizar paquete con validaciones
   * @private
   */
  private inicializarForm() {
    this.formActualizarPaquete = this.fb.group({
      paquete_id: ['', [Validators.required]],
      codigo_guia: ['', [Validators.required]],
      destinatario: ['', [Validators.required]],
      ciudad_destino: ['', [Validators.required]],
      peso_kg: ['', [Validators.required, Validators.min(1)]],
      estado: ['', [Validators.required]],
    });
  }

  /**
   * Obtener los datos del paquete y cargarlos al formulario
   * @private
   */
  private cargarDatosPaquete() {
    this.paquetesService.obtenerPaquete(this.paqueteId()!.toString()).subscribe((res: any) => {
      this.formActualizarPaquete.patchValue({
        paquete_id: res.data[0].id,
        codigo_guia: res.data[0].codigo_guia,
        destinatario: res.data[0].destinatario,
        ciudad_destino: res.data[0].ciudad_destino,
        peso_kg: res.data[0].peso_kg,
        estado: res.data[0].estado,
      });
    });
  }

  /**
   * Enviar los datos para actualizar los datos del paquete
   */
  onSubmit() {
    if (this.formActualizarPaquete.valid) {
      // console.log('Datos enviados:', this.formActualizarPaquete.value);

      this.paquetesService
        .actualizarPaquete(
          this.formActualizarPaquete.value,
          this.formActualizarPaquete.value.paquete_id,
        )
        .pipe(
          tap(() => {
            // this.isLoading = true;
            // console.log('beforeSend: Spinner activated, UI disabled.');
            $('.button-actualizar-paquete').attr('disabled', true);

            $('.text-send').css('display', 'none');

            $('.button-actualizar-paquete').addClass('btn-load');

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

              $('.button-actualizar-paquete').attr('disabled', false);

              $('.text-send').css('display', 'block');

              $('.button-actualizar-paquete').removeClass('btn-load');

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

              $('.button-actualizar-paquete').attr('disabled', false);

              $('.text-send').css('display', 'block');

              $('.button-actualizar-paquete').removeClass('btn-load');

              $('.spinner-border').css('display', 'none');
              $('.flex-grow-1').css('display', 'none');
            },
          }),
        )
        .subscribe();
    }
  }
}
