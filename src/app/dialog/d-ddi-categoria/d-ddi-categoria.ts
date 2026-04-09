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

import { DDdiCategoriaDetalle } from "./../d-ddi-categoria-detalle/d-ddi-categoria-detalle";

@Component({
   selector: 'app-d-ddi-categoria',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-ddi-categoria.html',
   styleUrl: './d-ddi-categoria.css'
})

export class DDdiCategoria {
   private destroy$ = new Subject<void>();
   readonly dialog = inject(MatDialog);

   ruta = new Rutas;
   varb = new Variables;
   cols: number = 3;

   constructor (@Inject(MAT_DIALOG_DATA) public data: any, private service:AppService, public fun: Funciones) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.loading_2 = false;
         this.varb.message = 'Sin Información';
         this.varb.sucursal = this.fun.Get_SessionStorage(this.varb.storageSucursal, 'json');
         this.Read_Dias_Inventario_Categoria();
      }
   }

   ngOnDestroy () {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ READ ============================================ \\
   Read_Dias_Inventario_Categoria () {
      this.varb.loading = true;

      let datos = this.data.formato != undefined ? 
         {
            cve_depto: this.data.cve_depto,
            formato: this.data.formato 
         } 
      : 
         { 
            cve_depto: this.data.cve_depto,
            cve_sucursal: this.varb.sucursal.cve_sucursal
         };

      let sendDatas = {
         evento: 'Read_Dias_Inventario_Categoria',
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
   Open_Dialog_Detalle (data:any) {
      this.dialog.open(DDdiCategoriaDetalle, {
         data: {
            cve_categoria: data.cve_categoria,
            cve_depto: this.data.cve_depto,
            formato: this.data.formato,
            title_sub: data.categoria
         },
         width: '1300px',  
         maxWidth: '100vw',
         panelClass: 'dialogo-sin-padding'
      });
   }
}