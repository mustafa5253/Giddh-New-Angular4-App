import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ImportExcelRequestData, ImportExcelResponseData } from '../../models/api-models/import-excel';
import { IOption } from '../../theme/ng-select/option.interface';

interface DataModel {
  field: string;
  options: IOption[];
  selected: string;
}

@Component({
  selector: 'map-excel-data',  // <home></home>
  styleUrls: ['./map-excel-data.component.scss'],
  templateUrl: './map-excel-data.component.html'
})

export class MapExcelDataComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() public onNext = new EventEmitter<ImportExcelRequestData>();
  @Output() public onBack = new EventEmitter();
  public dataModel: DataModel[];
  private importRequestData: ImportExcelRequestData;

  constructor() {
    //
  }

  private _importData: ImportExcelResponseData;

  public get importData(): ImportExcelResponseData {
    return this._importData;
  }

  @Input()
  public set importData(value: ImportExcelResponseData) {
    this.prepareDataModel(value);
    this._importData = value;
  }

  public ngOnInit() {
    //
  }

  public ngAfterViewInit(): void {
    //
  }

  public ngOnDestroy() {
    //
  }

  public mapExcelData() {
    this.importRequestData = {
      ...this._importData,
      data: {
        items: this._importData.data.items
          .map(p => ({...p, row: p.row.map((value, index) => ({...value, columnNumber: index.toString()}))}))
        , numRows: 0, totalRows: 0
      }
    };
    this.onNext.emit(this.importRequestData);
  }

  public columnSelected(val: IOption, data: DataModel) {
    this._importData.mappings.mappingInfo[data.field] = val ? [{columnNumber: +val.value, columnHeader: val.label, isSelected: true}] : [];
  }

  private prepareDataModel(value: ImportExcelResponseData) {
    const options: IOption[] = value.headers.items.map(p => ({value: p.columnNumber, label: p.columnHeader}));
    Object.keys(value.mappings.mappingInfo).forEach(p => value.mappings.mappingInfo[p][0].isSelected = true);
    this.dataModel = Object.keys(value.mappings.mappingInfo)
      .map(field => ({
        field,
        options,
        selected: value.mappings.mappingInfo[field][0].columnNumber.toString()
      }));
  }
}
