import { Component } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  swipeOpts = {
    allowSlidePrev: false,
    allowSlideNext: false,
  };
  constructor(private barcodeScanner: BarcodeScanner) {}

  scaner() {
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
     }).catch(err => {
         console.log('Error', err);
     });
  }
  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    
  }

}
