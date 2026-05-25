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
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent {
  readonly columns = input.required<DataTableColumn[]>();
  readonly records = input.required<DataTableRecord[]>();

  protected trackRecord(record: DataTableRecord): string | number {
    return record['id'] ?? JSON.stringify(record);
  }
}
