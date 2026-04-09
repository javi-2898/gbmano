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
   selector: 'app-d-ddi-categoria-detalle',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-ddi-categoria-detalle.html',
   styleUrl: './d-ddi-categoria-detalle.css'
})

export class DDdiCategoriaDetalle {
   private destroy$ = new Subject<void>();

   ruta = new Rutas;
   varb = new Variables;
   cols: number = 5;

   constructor (@Inject(MAT_DIALOG_DATA) public data: any, private service:AppService, public fun: Funciones) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.message = 'Sin Información';
         this.varb.sucursal = this.fun.Get_SessionStorage(this.varb.storageSucursal, 'json');
         this.Read_Dias_Inventario_Categoria_Detalle();
      }
   }

   ngOnDestroy () {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ READ ============================================ \\
   Read_Dias_Inventario_Categoria_Detalle () {
      this.varb.loading = true;
      let datos = this.data.formato != undefined ? 
         {
            cve_categoria: this.data.cve_categoria,
            cve_depto: this.data.cve_depto,
            formato: this.data.formato 
         } 
      : 
         { 
            cve_categoria: this.data.cve_categoria,
            cve_depto: this.data.cve_depto,
            cve_sucursal: this.varb.sucursal.cve_sucursal
         };

      let sendDatas = {
         evento: 'Read_Dias_Inventario_Categoria_Detalle',
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