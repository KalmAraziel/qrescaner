import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
// alias
import { File as ionFile } from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {
  guardados: Registro[] = [];

  constructor(
    private storage: Storage,
    private navCtrl: NavController,
    private inAppBrowser: InAppBrowser,
    private file: ionFile,
    private email: EmailComposer
  ) {
    this.cargarStorage();
  }

  async cargarStorage() {
    this.guardados = (await this.storage.get('registros')) || [];
  }

  async guardarRegistro(format: string, texto: string) {
    await this.cargarStorage();
    const nuevoRegistro = new Registro(format, texto);
    this.guardados.unshift(nuevoRegistro);
    this.storage.set('registros', this.guardados);

    this.abrirRegistro(nuevoRegistro);

  }

  abrirRegistro(registro: Registro) {
    this.navCtrl.navigateForward('/tabs/tab2');
    switch (registro.type) {
      case 'http':
        // abrir navegador
        this.inAppBrowser.create(registro.text, '_system');
        break;
      case 'geo':
          this.navCtrl.navigateForward(`/tabs/tab2/mapa/${registro.text}`);
          break;
      default:
        break;
    }
  }

  enviarCorreo() {
    const arrTemp = [];

    const titulos = ' Tipo, Formato, Creado en, Texto\n';
    arrTemp.push(titulos);
    this.guardados.forEach(registro => {
      const linea = `${ registro.type }, ${ registro.format }, ${ registro.created }, ${ registro.text.replace(',', ' ') }\n`;
      arrTemp.push(linea);
    });

    this.crearArchivoFisico(arrTemp.join(''));
  }

  crearArchivoFisico(texto: string) {
    this.file.checkFile( this.file.dataDirectory, 'registros.csv' )
    .then(existe => {
      console.log('existe: ', existe);
      return this.escribirEnArchivo(texto);
    })
    .catch( () => {
      return this.file.createFile( this.file.dataDirectory, 'registros.csv', false ).then( (creado) => {
        this.escribirEnArchivo(texto);
      }).catch(err => {
        console.log('no se pudo crear el archivo', err);
      });
    });
  }

  async escribirEnArchivo(texto: string) {
    await this.file.writeExistingFile(this.file.dataDirectory, 'registros.csv' , texto);

    const archivo = this.file.dataDirectory + 'registros.csv';

    this.email.isAvailable().then((available: boolean) =>{
      if ( available ) {
        const email = {
          to: 'marcos.ahumada08@gmail.com',
          // cc: 'erika@mustermann.de',
          bcc: ['john@doe.com', 'jane@doe.com'],
          attachments: [
            archivo
          ],
          subject: 'Backup Scan',
          body: 'Aqui estan los Backups de los scanners',
          isHtml: true
        };
        this.email.open(email);
      }

     });
  }
}
