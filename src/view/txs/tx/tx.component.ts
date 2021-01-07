import { Component, OnInit, Input } from '@angular/core';
import { TxQuery } from 'cosmos-client/api';

@Component({
  selector: 'view-tx',
  templateUrl: './tx.component.html',
  styleUrls: ['./tx.component.css'],
})
export class TxComponent implements OnInit {
  @Input()
  tx?: TxQuery | null;

  constructor() {}

  ngOnInit(): void {}

  constructorName(instance: any) {
    return instance.constructor.name;
  }
}
