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
import { DVentaFamilia } from "./../d-venta-familia/d-venta-familia";

@Component({
   selector: 'app-d-venta-departamento',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-venta-departamento.html',
   styleUrl: './d-venta-departamento.css'
})

export class DVentaDepartamento {
   private destroy$ = new Subject<void>();
   readonly dialog = inject(MatDialog);

   ruta = new Rutas;
   varb = new Variables;
   cols: number = 6;

   constructor (@Inject(MAT_DIALOG_DATA) public data: any, private service:AppService, public fun: Funciones) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.loading_2 = false;
         this.varb.message = 'Sin Información';
         this.varb.sucursal = this.fun.Get_SessionStorage(this.varb.storageSucursal, 'json');
         this.Read_Venta_Departamento();

      }
   }

   ngOnDestroy () {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ READ ============================================ \\
   Read_Venta_Departamento () {
      this.varb.loading = true;

      let sendDatas = {
         evento: 'Read_Venta_Departamento',
         datos: {
            clave: this.data.clave,
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            month: this.data.month,
            year: this.data.year
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

   // ============================================ DIALOG ============================================ \\
   Open_Dialog_Venta_Departamento (data:any) {
      this.dialog.open(DVentaFamilia, {
         data: {
            clave: data.Clave,
            title: 'Venta '+this.data.title,
            title_sub: data.Descripcion,
            month: this.data.month,
            year: this.data.year
         },
         width: '1300px',  
         maxWidth: '100vw',
         panelClass: 'dialogo-sin-padding'
      });
   }
}