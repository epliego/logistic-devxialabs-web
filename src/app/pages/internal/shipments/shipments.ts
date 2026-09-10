import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoadResourcesService } from '../../../services/load-resources.service';
import { PaquetesService } from '../../../services/paquetes.service';

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

  private readonly paquetesService = inject(PaquetesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly cargarRecursos = inject(LoadResourcesService);
  private router = inject(Router);

  private datatable_listado_paquetes: any;

  private estado: string = '';

  public async ngOnInit(): Promise<void> {
    try {
      await this.cargarRecursos.cargarEstilos(ESTILOS_DATATABLE);
      await this.cargarRecursos.cargarScripts(SCRIPTS_DATATABLE);
    } catch (error) {
      console.warn('No se pudieron cargar los recursos del DataTable:', error);

      return;
    }

    if (typeof (window as any).$ === 'undefined') {
      console.warn('jQuery not available, skipping DataTable init');

      return;
    }

    this.inicializarDataTableListadoPaquetes(this.estado);

    this.formularioCrearPaquete();

    this.formularioActualizarEstadoPaquete();
  }

  /**
   * Datatable Listado de Shipments
   * @private
   */
  private inicializarDataTableListadoPaquetes(estado: string): void {
    if ($.fn.DataTable && $.fn.dataTable.isDataTable('.js-listado-shipments')) {
      this.datatable_listado_paquetes.destroy();
    }

    this.datatable_listado_paquetes = $('.js-listado-shipments').DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      ordering: true,
      lengthMenu: [
        [10, 25, 50, 100],
        [10, 25, 50, 100],
      ],
      ajax: (dataTablesParameters: any, callback: (data: any) => void) => {
        // Consultado (08-2026) en: https://l-lin.github.io/angular-datatables/#/basic/new-server-side
        // console.log(dataTablesParameters);
        this.paquetesService
          .obtenerPaquetes(
            estado,
            dataTablesParameters.start,
            dataTablesParameters.search.value,
            dataTablesParameters.length,
            dataTablesParameters.order[0].dir,
          )
          .subscribe((res: any) => {
            this.cdr.detectChanges();

            const arreglo_data: any[] = [];
            for (const paquete of res.data[0].listado_paquetes) {
              let estado_option =
                '                  <option value="REGISTRADO">REGISTRADO</option>' +
                '                  <option value="EN_TRANSITO">EN_TRANSITO</option>' +
                '                  <option value="ENTREGADO">ENTREGADO</option>' +
                '                  <option value="DEVUELTO">DEVUELTO</option>';
              if (paquete.estado === 'REGISTRADO') {
                estado_option =
                  '                  <option value="REGISTRADO" selected>REGISTRADO</option>' +
                  '                  <option value="EN_TRANSITO">EN_TRANSITO</option>' +
                  '                  <option value="ENTREGADO">ENTREGADO</option>' +
                  '                  <option value="DEVUELTO">DEVUELTO</option>';
              } else if (paquete.estado === 'EN_TRANSITO') {
                estado_option =
                  '                  <option value="REGISTRADO">REGISTRADO</option>' +
                  '                  <option value="EN_TRANSITO" selected>EN_TRANSITO</option>' +
                  '                  <option value="ENTREGADO">ENTREGADO</option>' +
                  '                  <option value="DEVUELTO">DEVUELTO</option>';
              } else if (paquete.estado === 'ENTREGADO') {
                estado_option =
                  '                  <option value="REGISTRADO">REGISTRADO</option>' +
                  '                  <option value="EN_TRANSITO">EN_TRANSITO</option>' +
                  '                  <option value="ENTREGADO" selected>ENTREGADO</option>' +
                  '                  <option value="DEVUELTO">DEVUELTO</option>';
              } else if (paquete.estado === 'DEVUELTO') {
                estado_option =
                  '                  <option value="REGISTRADO">REGISTRADO</option>' +
                  '                  <option value="EN_TRANSITO">EN_TRANSITO</option>' +
                  '                  <option value="ENTREGADO">ENTREGADO</option>' +
                  '                  <option value="DEVUELTO" selected>DEVUELTO</option>';
              }

              arreglo_data.push({
                id: paquete.id,
                codigo_guia: paquete.codigo_guia,
                destinatario: paquete.destinatario,
                ciudad_destino: paquete.ciudad_destino,
                peso_kg: paquete.peso_kg,
                estado: paquete.estado,
                creado_en: paquete.creado_en,
                acciones:
                  '<div class="dropdown d-inline-block">' +
                  '  <button class="btn btn-soft-secondary btn-sm dropdown" type="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                  '    <i class="ri-more-fill align-middle"></i>' +
                  '  </button>' +
                  '  <ul class="dropdown-menu dropdown-menu-end">' +
                  '    <li>' +
                  '      <a href="javascript:void(0)" class="dropdown-item ver-paquete" data-id="' + paquete.id + '">' +
                  '        <i class="ri-file-pdf-fill align-bottom me-2 text-muted"></i>Ver' +
                  '      </a>' +
                  '    </li>' +
                  '    <li>' +
                  '      <button type="button" class="dropdown-item remove-item-btn" data-bs-toggle="modal" data-bs-target=".actualizar-estado-modal-xl-' + paquete.id + '">' +
                  '        <i class="ri-delete-bin-fill align-bottom me-2 text-muted"></i>Actualizar Estado' +
                  '      </button>' +
                  '    </li>' +
                  '  </ul>' +
                  '</div>' +
                  '<div class="modal fade actualizar-estado-modal-xl-' + paquete.id + '" tabindex="-1" role="dialog" aria-labelledby="myExtraLargeModalLabel" aria-hidden="true">' +
                  '  <div class="modal-dialog modal-xl">' +
                  '    <div class="modal-content">' +
                  '      <div class="modal-header">' +
                  '        <h5 class="modal-title" id="myExtraLargeModalLabel">Actualizar Estado del Paquete</h5>' +
                  '          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
                  '      </div>' +
                  '      <div class="modal-body">' +
                  '        <p>Por favor, seleccione el nuevo Estado del Paquete</p>' +
                  '        <div class="row g-3">' +
                  '          <div class="col-xxl-4 col-sm-12 input-group-lg">' +
                  '            <div class="form-line">' +
                  '              <label for="cambio_estado' + paquete.id + '" class="col-form-label">Ver por Estado</label>' +
                  '              <select id="cambio_estado' + paquete.id + '" name="cambio_estado' + paquete.id + '" class="form-select validate" required>' +
                  estado_option +
                  '              </select>' +
                  '            </div>' +
                  '          </div>' +
                  '        </div>' +
                  '      </div>' +
                  '      <div class="modal-footer">' +
                  '        <a href="javascript:void(0);" class="btn btn-link link-danger shadow-none fw-medium" data-bs-dismiss="modal">' +
                  '          <i class="ri-close-line me-1 align-middle"></i>No' +
                  '        </a>' +
                  '        <button type="button" class="btn btn-success waves-effect waves-light button-actualizar-estado-paquete">' +
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
                draw: Number(dataTablesParameters.draw),
                recordsTotal: res.data[0].total_paquetes,
                recordsFiltered: res.data[0].total_paquetes,
                data: arreglo_data,
              });
            } else {
              callback({
                draw: Number(dataTablesParameters.draw),
                recordsTotal: 0,
                recordsFiltered: 0,
                data: 1,
              });
            }
          });
      },
      columns: [
        { data: 'id' },
        { data: 'codigo_guia' },
        { data: 'destinatario' },
        { data: 'ciudad_destino' },
        { data: 'peso_kg' },
        { data: 'estado' },
        { data: 'creado_en' },
        { data: 'acciones' },
      ],
      columnDefs: [
        {
          targets: [2, 3, 4, 5, 6, 7],
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
            columns: [1, 2, 3, 4, 5, 6],
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
            columns: [1, 2, 3, 4, 5, 6],
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
            columns: [1, 2, 3, 4, 5, 6],
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
            columns: [1, 2, 3, 4, 5, 6],
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

    $('body').on('click', '.ver-paquete', (e: any) => {
      const id = $(e.currentTarget).data('id');

      this.router.navigate(['/backoffice/ver_paquete/' + id]);
    });
  }

  /**
   * Formulario Crear Paquete
   * @private
   */
  private formularioCrearPaquete(): void {
    const formularioCrearPaqueteThis = this;

    $('#form_crear_paquete').validate({
      highlight: function (input: unknown) {
        // console.log(input as any);
        $(input as any).parents('.form-line').addClass('error');
      },
      unhighlight: function (input: unknown) {
        $(input as any).parents('.form-line').removeClass('error');
      },
      errorPlacement: function (error: unknown, element: unknown) {
        $(element as any).parents('.input-group-lg').append(error);
      },
      submitHandler: function (form: HTMLFormElement) {
        const body = {
          codigo_guia: $(form).find('[id="codigo_guia"]').val(),
          destinatario: $(form).find('[id="destinatario"]').val(),
          ciudad_destino: $(form).find('[id="ciudad_destino"]').val(),
          peso_kg: $(form).find('[id="peso_kg"]').val(),
          estado: $(form).find('[id="estado"]').val(),
        };

        formularioCrearPaqueteThis.paquetesService
          .crearPaquete(body)
          .pipe(
            tap(() => {
              // formularioCrearPaqueteThis.isLoading = true;
              // console.log('beforeSend: Spinner activated, UI disabled.');
              $('.button-crear-paquete').attr('disabled', true);

              $('.text-send').css('display', 'none');

              $('.button-crear-paquete').addClass('btn-load');

              $('.spinner-border').css('display', 'block');
              $('.flex-grow-1').css('display', 'block');
            }),
            tap({
              next: (response: any) => {
                // formularioCrearPaqueteThis.isLoading = false;
                // console.log('Success callback: Data saved!', response);

                if (response.statusCode === 201) {
                  $('.crear-paquete-modal-xl').modal('hide');

                  Toastify({
                    text: response.message,
                    duration: 5000,
                    position: 'center',
                    style: {
                      background: '#4FCBB5',
                    },
                  }).showToast(); //Consulted (12-2023) in: https://apvarun.github.io/toastify-js/, https://github.com/apvarun/toastify-js/blob/master/README.md

                  $('#form_crear_paquete')[0].reset();
                  $(form).find('[id="codigo_guia"]').val(null);
                  $(form).find('[id="destinatario"]').val(null);
                  $(form).find('[id="ciudad_destino"]').val(null);
                  $(form).find('[id="peso_kg"]').val(null);

                  formularioCrearPaqueteThis.inicializarDataTableListadoPaquetes(
                    formularioCrearPaqueteThis.estado,
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

                $('.button-crear-paquete').attr('disabled', false);

                $('.text-send').css('display', 'block');

                $('.button-crear-paquete').removeClass('btn-load');

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

                $('.button-crear-paquete').attr('disabled', false);

                $('.text-send').css('display', 'block');

                $('.button-crear-paquete').removeClass('btn-load');

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
   * Listado de Shipments por Estado
   * @param event
   */
  public paquetesPorEstado(event: Event): void {
    // this.inicializarDataTableListadoPaquetes($('#encontrar_por_estado').val());
    const element = event.target as HTMLInputElement;
    // console.log('New Value:', element.value);
    this.inicializarDataTableListadoPaquetes(element.value);
  }

  /**
   * Formulario Actualizar Estado del Paquete
   * @private
   */
  private formularioActualizarEstadoPaquete(): void {
    const formularioActualizarEstadoPaqueteThis = this;

    $('body').on('click', '.button-actualizar-estado-paquete', function (event: any) {
      let tabla = formularioActualizarEstadoPaqueteThis.datatable_listado_paquetes
        .row($(event.target).parents('tr'))
        .data();
      // console.log(tabla.id);
      // return;

      const body = {
        estado: $('#cambio_estado' + tabla.id).val(),
      };

      formularioActualizarEstadoPaqueteThis.paquetesService
        .actualizarEstadoPaquete(body, tabla.id)
        .pipe(
          tap(() => {
            // formularioActualizarEstadoPaqueteThis.isLoading = true;
            // console.log('beforeSend: Spinner activated, UI disabled.');
            $('.button-actualizar-estado-paquete').attr('disabled', true);

            $('.text-send').css('display', 'none');

            $('.button-actualizar-estado-paquete').addClass('btn-load');

            $('.spinner-border').css('display', 'block');
            $('.flex-grow-1').css('display', 'block');
          }),
          tap({
            next: (response: any) => {
              // formularioCrearPaqueteThis.isLoading = false;
              // console.log('Success callback: Data saved!', response);

              if (response.statusCode === 200) {
                $('.actualizar-estado-modal-xl-' + tabla.id).modal('hide');

                Toastify({
                  text: response.message,
                  duration: 5000,
                  position: 'center',
                  style: {
                    background: '#4FCBB5',
                  },
                }).showToast(); //Consulted (12-2023) in: https://apvarun.github.io/toastify-js/, https://github.com/apvarun/toastify-js/blob/master/README.md

                formularioActualizarEstadoPaqueteThis.inicializarDataTableListadoPaquetes(
                  formularioActualizarEstadoPaqueteThis.estado,
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

              $('.button-actualizar-estado-paquete').attr('disabled', false);

              $('.text-send').css('display', 'block');

              $('.button-actualizar-estado-paquete').removeClass('btn-load');

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

              $('.button-actualizar-estado-paquete').attr('disabled', false);

              $('.text-send').css('display', 'block');

              $('.button-actualizar-estado-paquete').removeClass('btn-load');

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
