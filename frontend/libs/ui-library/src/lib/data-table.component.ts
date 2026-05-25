import { Component, input } from '@angular/core';

export interface DataTableColumn {
  key: string;
  label: string;
}

export type DataTableRecord = Record<
  string,
  string | number | null | undefined
>;

@Component({
  selector: 'lar-data-table',
  template: `
    <div class="table-wrap">
      <table class="au-table">
        <thead>
          <tr>
            @for (column of columns(); track column.key) {
              <th scope="col">{{ column.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (record of records(); track trackRecord(record)) {
            <tr>
              @for (column of columns(); track column.key) {
                <td>{{ record[column.key] ?? '' }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .table-wrap {
        overflow-x: auto;
        border: 1px solid var(--lar-border);
        border-radius: var(--lar-radius);
        background: var(--lar-surface);
      }

      table {
        width: 100%;
        min-width: 640px;
        border-collapse: collapse;
      }

      th,
      td {
        padding: var(--lar-space-3) var(--lar-space-4);
        border-bottom: 1px solid var(--lar-border);
        text-align: left;
        vertical-align: top;
      }

      th {
        color: var(--lar-text);
        font-size: 0.82rem;
      }

      tr:last-child td {
        border-bottom: 0;
      }
    `,
  ],
})
export class DataTableComponent {
  readonly columns = input.required<DataTableColumn[]>();
  readonly records = input.required<DataTableRecord[]>();

  protected trackRecord(record: DataTableRecord): string | number {
    return record['id'] ?? JSON.stringify(record);
  }
}
