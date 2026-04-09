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
   selector: 'app-d-detalle-precio',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-detalle-precio.html',
   styleUrl: './d-detalle-precio.css'
})

export class DDetallePrecio {
   private destroy$ = new Subject<void>();

   ruta = new Rutas;
   varb = new Variables;
   cols: number = 5;

   constructor(@Inject(MAT_DIALOG_DATA) public data: any, private service:AppService, public fun: Funciones) {}

   ngOnInit() {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.message = 'Sin Información';
         this.varb.user = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.varb.sucursal = this.fun.Get_SessionStorage(this.varb.storageSucursal, 'json');
         this.Read_Detalle_Precio();
         
      }
   }

   ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
   }

   Read_Detalle_Precio () {
      this.varb.table = [];
      this.varb.loading = true;

      let sendDatas = {
         evento: 'Read_Detalle_Precio',
         datos: {
            cve_sucursal: this.varb.sucursal.cve_sucursal
         }
      }

      this.service.Read(this.ruta.dashboard, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.varb.table = res.data;
            } else if (res.code === 201) {
               this.varb.message = res.message;
            } else {
               this.fun.Swal_Advertencia(res.message);
            }
         },
         error: (error) => {
            this.fun.Swal_Error(error.message);
            this.varb.loading = false;
         },
         complete: () => {
            this.varb.loading = false;
         },
      });
   }
}