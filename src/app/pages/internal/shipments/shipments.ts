import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthUserType } from '../../../types/auth-user.type';
import { LoadResourcesService } from '../../../services/load-resources.service';
import { InternalService } from '../../../services/internal.service';
import { ValuesCatalogService } from '../../../services/values-catalog.service';

const $ = (window as any).$;

declare const Toastify: any;

const ESTILOS_DATATABLE = [
  '/assets/libs/jquery-datatable/css/dataTables.bootstrap5.min.css',
  '/assets/libs/jquery-datatable/css/responsive.bootstrap.min.css',
  '/assets/libs/jquery-datatable/css/buttons.dataTables.min.css',
];

const SCRIPTS_DATATABLE = [
  '/assets/libs/jquery-datatable/js/jquery.dataTables.min.js',
  '/assets/libs/jquery-datatable/js/dataTables.bootstrap5.min.js',
  '/assets/libs/jquery-datatable/js/dataTables.responsive.min.js',
  '/assets/libs/jquery-datatable/js/dataTables.buttons.min.js',
  '/assets/libs/jquery-datatable/js/buttons.print.min.js',
  '/assets/libs/jquery-datatable/js/buttons.html5.min.js',
  '/assets/libs/jquery-datatable/js/pdfmake.min.js',
  '/assets/libs/jquery-datatable/js/vfs_fonts.min.js',
  '/assets/libs/jquery-datatable/js/jszip.min.js',
];

@Component({
  selector: 'shipments-root',
  imports: [],
  templateUrl: './shipments.html',
  styleUrl: './shipments.css',
})
export class Shipments {
  protected readonly title = signal('Internal - Shipments');

  private readonly valuesCatalogService = inject(ValuesCatalogService);
  private readonly internalService = inject(InternalService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly loadResources = inject(LoadResourcesService);
  private router = inject(Router);

  private datatable_shipments_list: any;

  private status_id: string = '';

  public status_options: any[] = [];

  public user_profile_name: string = '';

  public async ngOnInit(): Promise<void> {
    if (
      !localStorage.getItem('internal_user_token') ||
      localStorage.getItem('internal_user_token') === ''
    ) {
      await this.router.navigate(['/']);
    }

    const access_token_decoded = jwtDecode<AuthUserType>(
      localStorage.getItem('internal_user_token')!,
    );

    this.user_profile_name = access_token_decoded.user_profile_name;

    try {
      await this.loadResources.loadEstilos(ESTILOS_DATATABLE);
      await this.loadResources.loadScripts(SCRIPTS_DATATABLE);
    } catch (error) {
      console.warn('No se pudieron cargar los recursos del DataTable:', error);

      return;
    }

    if (typeof (window as any).$ === 'undefined') {
      console.warn('jQuery not available, skipping DataTable init');

      return;
    }

    this.valuesCatalogService
      .valuesCatalog({ category: 'SHIPMENT STATUS' }, localStorage.getItem('internal_user_token')!)
      .subscribe((res: any) => {
        this.status_options = res.data[0];
      });

    this.initializeDataTableShipmentsList(this.status_id);

    this.createShipmentForm();

    this.updateStatusShipmentForm();
  }

  /**
   * Datatable Shipments List
   * @private
   */
  private initializeDataTableShipmentsList(status_id: string): void {
    if ($.fn.DataTable && $.fn.dataTable.isDataTable('.js-list-shipments')) {
      this.datatable_shipments_list.destroy();
    }

    this.datatable_shipments_list = $('.js-list-shipments').DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      ordering: true,
      lengthMenu: [
        [10, 25, 50, 100],
        [10, 25, 50, 100],
      ],
      ajax: (dataTables_parameters: any, callback: (data: any) => void) => {
        // Consultado (08-2026) en: https://l-lin.github.io/angular-datatables/#/basic/new-server-side
        // console.log(dataTables_parameters);
        this.internalService
          .shipmentsList(
            status_id,
            dataTables_parameters.start,
            dataTables_parameters.search.value,
            dataTables_parameters.length,
            dataTables_parameters.order[0].dir,
            localStorage.getItem('internal_user_token')!,
          )
          .subscribe((res: any) => {
            this.cdr.detectChanges();

            const array_data: any[] = [];
            for (const shipment of res.data[0].list_shipments) {
              let status_option = '';
              for (const option of this.status_options) {
                if (shipment.status === option.name) {
                  status_option +=
                    '                  <option value="' + option.id + '" selected>' + option.name + '</option>';
                } else {
                  status_option +=
                    '                  <option value="' + option.id + '">' + option.name + '</option>';
                }
              }

              let hidden_status_change: string = '';
              if (shipment.status === 'ENTREGADO') {
                hidden_status_change = 'hidden';
              }

              array_data.push({
                shipment_id: shipment.shipment_id,
                guide_code: shipment.guide_code,
                provenance_direction: shipment.provenance_direction,
                destination_direction: shipment.destination_direction,
                status: shipment.status,
                date: shipment.insert_date,
                actions:
                  '<div class="dropdown d-inline-block">' +
                  '  <button class="btn btn-soft-secondary btn-sm dropdown" type="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                  '    <i class="ri-more-fill align-middle"></i>' +
                  '  </button>' +
                  '  <ul class="dropdown-menu dropdown-menu-end">' +
                  '    <li>' +
                  '      <a href="javascript:void(0)" class="dropdown-item view-shipment" data-id="' + shipment.shipment_id + '">' +
                  '        <i class="ri-file-pdf-fill align-bottom me-2 text-muted"></i>Ver' +
                  '      </a>' +
                  '    </li>' +
                  '    <li>' +
                  '      <button type="button" class="dropdown-item remove-item-btn" data-bs-toggle="modal" data-bs-target=".update-status-modal-xl-' + shipment.shipment_id + '" ' + hidden_status_change + '>' +
                  '        <i class="ri-delete-bin-fill align-bottom me-2 text-muted"></i>Actualizar Estado' +
                  '      </button>' +
                  '    </li>' +
                  '  </ul>' +
                  '</div>' +
                  '<div class="modal fade update-status-modal-xl-' + shipment.shipment_id + '" tabindex="-1" role="dialog" aria-labelledby="myExtraLargeModalLabel" aria-hidden="true">' +
                  '  <div class="modal-dialog modal-xl">' +
                  '    <div class="modal-content">' +
                  '      <div class="modal-header">' +
                  '        <h5 class="modal-title" id="myExtraLargeModalLabel">Actualizar Estado del Envío</h5>' +
                  '          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
                  '      </div>' +
                  '      <div class="modal-body">' +
                  '        <p>Por favor, seleccione el nuevo Estado del Envío</p>' +
                  '        <div class="row g-3">' +
                  '          <div class="col-xxl-4 col-sm-12 input-group-lg">' +
                  '            <div class="form-line">' +
                  '              <label for="status_change_' + shipment.shipment_id + '" class="col-form-label">Ver por Estado</label>' +
                  '              <select id="status_change_' + shipment.shipment_id + '" name="status_change_' + shipment.shipment_id + '" class="form-select validate" required>' +
                  status_option +
                  '              </select>' +
                  '            </div>' +
                  '          </div>' +
                  '        </div>' +
                  '      </div>' +
                  '      <div class="modal-footer">' +
                  '        <a href="javascript:void(0);" class="btn btn-link link-danger shadow-none fw-medium" data-bs-dismiss="modal">' +
                  '          <i class="ri-close-line me-1 align-middle"></i>No' +
                  '        </a>' +
                  '        <button type="button" class="btn btn-success waves-effect waves-light button-update-status-shipment">' +
                  '          <div class="text-send">' +
                  '            Guardar' +
                  '          </div>' +
                  '          <span class="d-flex align-items-center">' +
                  '            <span class="spinner-border flex-shrink-0" role="status" style="display: none;">' +
                  '              <span class="visually-hidden">Por favor, espere...</span>' +
                  '            </span>' +
                  '            <span class="flex-grow-1 ms-2" style="display: none;">' +
                  '              Por favor, espere...' +
                  '            </span>' +
                  '          </span>' +
                  '        </button>' +
                  '      </div>' +
                  '    </div>' +
                  '  </div>' +
                  '</div>',
              });
            }

            if (res.statusCode === 200) {
              callback({
                draw: Number(dataTables_parameters.draw),
                recordsTotal: res.data[0].total_shipments,
                recordsFiltered: res.data[0].total_shipments,
                data: array_data,
              });
            } else {
              callback({
                draw: Number(dataTables_parameters.draw),
                recordsTotal: 0,
                recordsFiltered: 0,
                data: 1,
              });
            }
          });
      },
      columns: [
        { data: 'shipment_id' },
        { data: 'guide_code' },
        { data: 'provenance_direction' },
        { data: 'destination_direction' },
        { data: 'status' },
        { data: 'date' },
        { data: 'actions' },
      ],
      columnDefs: [
        {
          targets: [2, 3, 4, 5, 6],
          orderable: false,
        },
        {
          targets: [0],
          visible: false,
          searchable: false,
        },
      ],
      searching: true,
      dom: 'Bfrtip',
      responsive: true,
      language: {
        url: '/assets/libs/jquery-datatable/language/Spanish.json', // trabajar cualquier ambiente
        buttons: {
          // Consultado (01-2016) en: https://datatables.net/extensions/buttons/examples/flash/copyi18n.html
          copyTitle: 'Copiado al portapapeles',
          copySuccess: {
            // Consultado (01-2016) en: https://datatables.net/reference/button/copyHtml5
            1: 'Copiada una fila al portapapeles',
            _: 'Copiadas %d filas al portapapeles',
          },
        },
        sLength: 'dataTables_length',
      },
      buttons: [
        {
          extend: 'copy',
          text: 'Copiar',
          exportOptions: {
            modifier: {
              page: 'all',
            },
            columns: [1, 2, 3, 4, 5],
          },
        },
        {
          extend: 'csv',
          text: 'CSV',
          //title: $("#title").val(),
          exportOptions: {
            modifier: {
              search: 'none',
            },
            columns: [1, 2, 3, 4, 5],
          },
        },
        {
          extend: 'excel',
          text: 'Descargar Excel',
          // title: $("#title").val(),
          exportOptions: {
            modifier: {
              page: 'all',
            },
            columns: [1, 2, 3, 4, 5],
          },
        },
        {
          extend: 'pdf',
          text: 'PDF',
          // title: $("#title").val(),
          pageSize: 'LETTER',
          exportOptions: {
            modifier: {
              page: 'all',
            },
            columns: [1, 2, 3, 4, 5],
          },
        },
        {
          extend: 'print',
          text: 'Imprimir',
          // title: $("#title").val(),
          pageSize: 'LETTER',
        },
      ],
    });

    $('body').on('click', '.view-shipment', (e: any) => {
      const id = $(e.currentTarget).data('id');

      this.router.navigate(['/internal/view_shipment/' + id]);
    });
  }

  /**
   * Create Shipment Form
   * @private
   */
  private createShipmentForm(): void {
    const createShipmentFormThis = this;

    $('#create_shipment_form').validate({
      highlight: function (input: unknown) {
        // console.log(input as any);
        $(input as any)
          .parents('.form-line')
          .addClass('error');
      },
      unhighlight: function (input: unknown) {
        $(input as any)
          .parents('.form-line')
          .removeClass('error');
      },
      errorPlacement: function (error: unknown, element: unknown) {
        $(element as any)
          .parents('.input-group-lg')
          .append(error);
      },
      submitHandler: function (form: HTMLFormElement) {
        const body = {
          provenance_direction: $(form).find('[id="provenance_direction"]').val(),
          destination_direction: $(form).find('[id="destination_direction"]').val(),
          recipient_name: $(form).find('[id="recipient_name"]').val(),
          recipient_phone: $(form).find('[id="recipient_phone"]').val(),
          weight_kg: Number($(form).find('[id="weight_kg"]').val()),
        };

        createShipmentFormThis.internalService
          .createShipment(body, localStorage.getItem('internal_user_token')!)
          .pipe(
            tap(() => {
              // createShipmentFormThis.isLoading = true;
              // console.log('beforeSend: Spinner activated, UI disabled.');
              $('.button-create-shipment').attr('disabled', true);

              $('.text-send').css('display', 'none');

              $('.button-create-shipment').addClass('btn-load');

              $('.spinner-border').css('display', 'block');
              $('.flex-grow-1').css('display', 'block');
            }),
            tap({
              next: (response: any) => {
                // createShipmentFormThis.isLoading = false;
                // console.log('Success callback: Data saved!', response);

                if (response.statusCode === 201) {
                  $('.create-shipment-modal-xl').modal('hide');

                  Toastify({
                    text: response.message,
                    duration: 5000,
                    position: 'center',
                    style: {
                      background: '#4FCBB5',
                    },
                  }).showToast(); //Consulted (12-2023) in: https://apvarun.github.io/toastify-js/, https://github.com/apvarun/toastify-js/blob/master/README.md

                  $('#create_shipment_form')[0].reset();
                  $(form).find('[id="provenance_direction"]').val(null);
                  $(form).find('[id="destination_direction"]').val(null);
                  $(form).find('[id="recipient_name"]').val(null);
                  $(form).find('[id="recipient_phone"]').val(null);
                  $(form).find('[id="weight_kg"]').val(null);

                  createShipmentFormThis.initializeDataTableShipmentsList(
                    createShipmentFormThis.status_id,
                  );
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

                $('.button-create-shipment').attr('disabled', false);

                $('.text-send').css('display', 'block');

                $('.button-create-shipment').removeClass('btn-load');

                $('.spinner-border').css('display', 'none');
                $('.flex-grow-1').css('display', 'none');
              },
              error: (error: any) => {
                // createShipmentFormThis.isLoading = false;
                // console.error(error);
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

                $('.button-create-shipment').attr('disabled', false);

                $('.text-send').css('display', 'block');

                $('.button-create-shipment').removeClass('btn-load');

                $('.spinner-border').css('display', 'none');
                $('.flex-grow-1').css('display', 'none');
              },
            }),
          )
          .subscribe();

        return false;
      },
    });
  }

  /**
   * Shipments by Status
   * @param event
   */
  public shipmentsByStatus(event: Event): void {
    // this.initializeDataTableShipmentsList($('#find_by_status').val());
    const element = event.target as HTMLInputElement;
    // console.log('New Value:', element.value);
    this.initializeDataTableShipmentsList(element.value);
  }

  /**
   * Update Status Shipment Form
   * @private
   */
  private updateStatusShipmentForm(): void {
    const updateStatusShipmentFormThis = this;

    $('body').on('click', '.button-update-status-shipment', function (event: any) {
      let table = updateStatusShipmentFormThis.datatable_shipments_list
        .row($(event.target).parents('tr'))
        .data();
      // console.log(table.shipment_id);
      // return;

      const body = {
        status_id: parseInt($('#status_change_' + table.shipment_id).val()),
      };

      updateStatusShipmentFormThis.internalService
        .updateShipmentStatus(body, table.shipment_id, localStorage.getItem('internal_user_token')!)
        .pipe(
          tap(() => {
            // updateStatusShipmentFormThis.isLoading = true;
            // console.log('beforeSend: Spinner activated, UI disabled.');
            $('.button-update-status-shipment').attr('disabled', true);

            $('.text-send').css('display', 'none');

            $('.button-update-status-shipment').addClass('btn-load');

            $('.spinner-border').css('display', 'block');
            $('.flex-grow-1').css('display', 'block');
          }),
          tap({
            next: (response: any) => {
              // createShipmentFormThis.isLoading = false;
              // console.log('Success callback: Data saved!', response);

              if (response.statusCode === 200) {
                $('.update-status-modal-xl-' + table.shipment_id).modal('hide');

                Toastify({
                  text: response.message,
                  duration: 5000,
                  position: 'center',
                  style: {
                    background: '#4FCBB5',
                  },
                }).showToast(); //Consulted (12-2023) in: https://apvarun.github.io/toastify-js/, https://github.com/apvarun/toastify-js/blob/master/README.md

                updateStatusShipmentFormThis.initializeDataTableShipmentsList(
                  updateStatusShipmentFormThis.status_id,
                );
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

              $('.button-update-status-shipment').attr('disabled', false);

              $('.text-send').css('display', 'block');

              $('.button-update-status-shipment').removeClass('btn-load');

              $('.spinner-border').css('display', 'none');
              $('.flex-grow-1').css('display', 'none');
            },
            error: (error: any) => {
              // createShipmentFormThis.isLoading = false;
              // console.error('Error callback:', error);

              Toastify({
                text: 'Error: ' + error.message,
                duration: 5000,
                position: 'center',
                style: {
                  background: '#EF6548',
                },
              }).showToast(); //Consulted (12-2023) in: https://github.com/apvarun/toastify-js/blob/master/README.md

              $('.button-update-status-shipment').attr('disabled', false);

              $('.text-send').css('display', 'block');

              $('.button-update-status-shipment').removeClass('btn-load');

              $('.spinner-border').css('display', 'none');
              $('.flex-grow-1').css('display', 'none');
            },
          }),
        )
        .subscribe();

      return false;
    });
  }
}
