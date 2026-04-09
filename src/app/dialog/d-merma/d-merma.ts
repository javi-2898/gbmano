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
   selector: 'app-d-merma',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-merma.html',
   styleUrl: './d-merma.css'
})

export class DMerma {
   private destroy$ = new Subject<void>();

   ruta = new Rutas;
   varb = new Variables;
   cols: number = 10;

   constructor (@Inject(MAT_DIALOG_DATA) public data: any, private service:AppService, public fun: Funciones) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.loading_2 = false;
         this.varb.message = 'Sin Información';
         this.varb.sucursal = this.fun.Get_SessionStorage(this.varb.storageSucursal, 'json');

         if (this.data.title === 'Merma Abarrote') {
            this.Read_Merma_Abarrote();
         } else if (this.data.title === 'Merma Perecdero') {
            this.Read_Merma_Perecedero();
         }
      }
   }

   ngOnDestroy () {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ READ ============================================ \\
   Read_Merma_Abarrote () {
      this.varb.loading = true;

      let datos = this.data.formato != undefined ? 
         {
            cve_familia: this.data.cve_familia,
            cve_producto: this.data.cve_producto,
            formato: this.data.formato,
            month: this.data.month,
            year: this.data.year
         } 
      : 
         { 
            cve_familia: this.data.cve_familia,
            cve_producto: this.data.cve_producto,
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            month: this.data.month,
            year: this.data.year
         };

      let sendDatas = {
         evento: 'Read_Merma_Abarrote',
         datos: datos
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

   Read_Merma_Perecedero () {
      this.varb.loading = true;

      let datos = this.data.formato != undefined ? 
         {
            cve_familia: this.data.cve_familia,
            cve_producto: this.data.cve_producto,
            formato: this.data.formato,
            month: this.data.month,
            year: this.data.year
         } 
      : 
         { 
            cve_familia: this.data.cve_familia,
            cve_producto: this.data.cve_producto,
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            month: this.data.month,
            year: this.data.year
         };

      let sendDatas = {
         evento: 'Read_Merma_Perecedero',
         datos: datos
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