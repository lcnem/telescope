import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Coin } from 'cosmos-client/api';
import { Key } from '@model/keys/key.model';

export type SendOnSubmitEvent = {
  key: Key;
  toAddress: string;
  amount: Coin[];
  privateKey: string;
};

@Component({
  selector: 'view-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.css'],
})
export class SendComponent implements OnInit {
  @Input()
  key?: Key | null;

  @Input()
  coins?: Coin[] | null;

  @Output()
  appSubmit: EventEmitter<SendOnSubmitEvent>;

  amount: Coin[];

  constructor() {
    this.appSubmit = new EventEmitter();
    this.amount = [{ denom: '', amount: '' }];
  }

  ngOnInit(): void {}

  removeAmount(index: number) {
    this.amount.splice(index, 1);
  }

  addAmount() {
    this.amount.push({});
  }

  onSubmit(toAddress: string, privateKey: string) {
    this.appSubmit.emit({
      key: this.key!,
      toAddress: toAddress,
      amount: this.amount,
      privateKey: privateKey,
    });
  }
}
