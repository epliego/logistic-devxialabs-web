import { Component, signal, inject, ChangeDetectorRef } from '@angular/core';
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

  private readonly internalService = inject(InternalService);
  private readonly cdr = inject(ChangeDetectorRef);

  updateShipmentForm!: FormGroup;

  private datatable_shipment_tracking_history_list: any;

  constructor(private fb: FormBuilder) {
    // this.initForm();
    this.initializeForm();
  }

  public async ngOnInit(): Promise<void> {
    const idStr = this.route.snapshot.paramMap.get('id');
    const idNum = idStr ? Number(idStr) : NaN;
    this.shipmentId.set(Number.isFinite(idNum) ? idNum : null);

    this.loadShipmentData();

    if (typeof (window as any).$ === 'undefined') {
      console.warn('jQuery not available, skipping DataTable init');

      return;
    }

    this.initializeDataTableShipmentTrackingHistoryList(this.shipmentId()!.toString());
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
    this.internalService
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
   * Datatable Shipment Tracking History List
   * @private
   */
  private initializeDataTableShipmentTrackingHistoryList(shipment_id: string): void {
    if ($.fn.DataTable && $.fn.dataTable.isDataTable('.js-list-shipment-tracking-history')) {
      this.datatable_shipment_tracking_history_list.destroy();
    }

    this.datatable_shipment_tracking_history_list = $(
      '.js-list-shipment-tracking-history',
    ).DataTable({
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
          .shipmentTrackingHistoryList(
            shipment_id,
            dataTables_parameters.start,
            dataTables_parameters.search.value,
            dataTables_parameters.length,
            dataTables_parameters.order[0].dir,
            localStorage.getItem('internal_user_token')!,
          )
          .subscribe((res: any) => {
            this.cdr.detectChanges();

            const array_data: any[] = [];
            for (const shipment_tracking_history of res.data[0].list_shipment_tracking_history) {
              array_data.push({
                shipment_tracking_history_id:
                  shipment_tracking_history.shipment_tracking_history_id,
                guide_code: shipment_tracking_history.guide_code,
                provenance_direction: shipment_tracking_history.provenance_direction,
                destination_direction: shipment_tracking_history.destination_direction,
                status: shipment_tracking_history.status,
                date: shipment_tracking_history.insert_date,
                insert_by: shipment_tracking_history.insert_by_internal,
              });
            }

            if (res.statusCode === 200) {
              callback({
                draw: Number(dataTables_parameters.draw),
                recordsTotal: res.data[0].total_shipment_tracking_history,
                recordsFiltered: res.data[0].total_shipment_tracking_history,
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
        { data: 'shipment_tracking_history_id' },
        { data: 'guide_code' },
        { data: 'provenance_direction' },
        { data: 'destination_direction' },
        { data: 'status' },
        { data: 'date' },
        { data: 'insert_by' },
      ],
      columnDefs: [
        {
          targets: [1, 2, 3, 4, 6],
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
  }
}
