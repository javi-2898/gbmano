import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Funciones } from "./../../class/funciones";
import { Variables } from "./../../class/variables";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

import { DMerma } from "./../d-merma/d-merma";

@Component({
   selector: 'app-d-merma-grupo',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-merma-grupo.html',
   styleUrl: './d-merma-grupo.css'
})

export class DMermaGrupo {
   private destroy$ = new Subject<void>();
   readonly dialog = inject(MatDialog);

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
            formato: this.data.formato,
            month: this.data.month,
            year: this.data.year
         } 
      : 
         { 
            cve_familia: this.data.cve_familia,
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            month: this.data.month,
            year: this.data.year
         };

      let sendDatas = {
         evento: 'Read_Merma_Abarrote_Grupo',
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
            formato: this.data.formato,
            month: this.data.month,
            year: this.data.year
         } 
      : 
         { 
            cve_familia: this.data.cve_familia,
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            month: this.data.month,
            year: this.data.year
         };

      let sendDatas = {
         evento: 'Read_Merma_Perecedero_Grupo',
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

   // ============================================ DIALOG ============================================ \\
   Open_Dialog_Merma (data:any) {
      this.dialog.open(DMerma, {
         data: {
            cve_familia: this.data.cve_familia,
            cve_producto: data.cve_producto,
            formato: this.data.formato,
            title: this.data.title,
            title_sub: data.descripcion,
            month: this.data.month,
            year: this.data.year
         },
         width: '1300px',  
         maxWidth: '100vw',
         panelClass: 'dialogo-sin-padding'
      });
   }
}