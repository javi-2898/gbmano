import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent  } from '@angular/service-worker';

import { filter } from 'rxjs';

import { Primeng } from "./class/primeng";

@Component({
   selector: 'app-root',
   imports: [RouterOutlet, Primeng],
   templateUrl: './app.html',
   styleUrl: './app.css'
})
export class App {
   protected readonly title = signal('gbmano');

   mostrarModal = false;

   constructor (private swUpdate: SwUpdate) {
      if (this.swUpdate.isEnabled) {
         this.swUpdate.versionUpdates
         .pipe(
            filter((evt:any): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
         )
         .subscribe(() => {
            this.mostrarModal = true;
         });
      }
   }

   recargarPagina() {
      this.swUpdate.activateUpdate().then(() => document.location.reload());
   }
}
