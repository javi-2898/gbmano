import { Component } from '@angular/core';

import { of, Subject, catchError, tap, switchMap } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Variables } from "./../../class/variables";
import { Funciones } from "./../../class/funciones";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

@Component({
   selector: 'app-hojas-servicios',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './hojas-servicios.html',
   styleUrl: './hojas-servicios.css'
})

export class HojasServicios {
   private destroy$         = new Subject<void>();
   varb = new Variables;
   ruta = new Rutas;
   colspan = 11;

   constructor(private service:AppService, public fun: Funciones) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.message  = 'Sin Información';
         this.varb.user     = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');


      }
   }

   ngOnDestroy () {
      this.destroy$.next();
      this.destroy$.complete();
   }
}