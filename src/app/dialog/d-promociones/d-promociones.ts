import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Funciones } from "./../../class/funciones";
import { Variables } from "./../../class/variables";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

@Component({
   selector: 'app-d-promociones',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-promociones.html',
   styleUrl: './d-promociones.css'
})

export class DPromociones {
   private destroy$ = new Subject<void>();
   
   ruta = new Rutas;
   varb = new Variables;

   constructor(@Inject(MAT_DIALOG_DATA) public data: any, private service:AppService, public fun: Funciones) {}

   ngOnInit() {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.loading_2 = false;
         this.varb.message_2 = 'Sin Información';

      }
   }

   ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
   }
}