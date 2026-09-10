import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { InternalService } from '../../../services/internal.service';
import { ValuesCatalogService } from '../../../services/values-catalog.service';

const $ = (window as any).$;

declare const Toastify: any;

@Component({
  selector: 'view-shipment-root',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './view-shipment.html',
  styleUrl: './view-shipment.css',
})
export class ViewShipment {
  protected readonly title = signal('Internal - Ver Shipments');

  protected readonly shipmentId = signal<number | null>(null);
  private readonly route = inject(ActivatedRoute);

  private readonly paquetesService = inject(InternalService);

  updateShipmentForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    // this.initForm();
    this.initializeForm();
  }

  public async ngOnInit(): Promise<void> {
    const idStr = this.route.snapshot.paramMap.get('id');
    const idNum = idStr ? Number(idStr) : NaN;
    this.shipmentId.set(Number.isFinite(idNum) ? idNum : null);

    this.loadShipmentData();
  }

  /**
   * Initialize Form update Shipment
   * @private
   */
  private initializeForm() {
    this.updateShipmentForm = this.fb.group({
      shipment_id: ['', [Validators.required]],
      guide_code: ['', [Validators.required]],
      provenance_direction: ['', [Validators.required]],
      destination_direction: ['', [Validators.required]],
      recipient_name: ['', [Validators.required, Validators.min(1)]],
      recipient_phone: [],
      weight_kg: ['', [Validators.required]],
      status_name: ['', Validators.required],
    });
  }

  /**
   * Get Shipment data and show in Form
   * @private
   */
  private loadShipmentData() {
    this.paquetesService
      .getShipment(this.shipmentId()!.toString(), localStorage.getItem('internal_user_token')!)
      .subscribe((res: any) => {
        this.updateShipmentForm.patchValue({
          shipment_id: res.data[0].shipment_id,
          guide_code: res.data[0].guide_code,
          provenance_direction: res.data[0].provenance_direction,
          destination_direction: res.data[0].destination_direction,
          recipient_name: res.data[0].recipient_name,
          recipient_phone: res.data[0].recipient_phone,
          weight_kg: res.data[0].weight_kg,
          status_name: res.data[0].status,
        });
      });
  }

  /**
   * Update Shipment data
   */
  onSubmit() {
    if (this.updateShipmentForm.valid) {
      // console.log('Datos enviados:', this.updateShipmentForm.value);

      this.paquetesService
        .actualizarPaquete(this.updateShipmentForm.value, this.updateShipmentForm.value.paquete_id)
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
