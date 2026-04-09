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

import { DDdiCategoria } from "./../d-ddi-categoria/d-ddi-categoria";

@Component({
	selector: 'app-d-ddi-departamento',
	imports: [ImportsModules, Material, Primeng],
	templateUrl: './d-ddi-departamento.html',
	styleUrl: './d-ddi-departamento.css'
})

export class DDdiDepartamento {
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
         this.Read_Dias_Inventario_Departamento();

         console.log(this.data.formato);
         
      }
   }

   ngOnDestroy () {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ READ ============================================ \\
   Read_Dias_Inventario_Departamento () {
      this.varb.loading = true;
      let datos = this.data.formato != undefined ? {formato: this.data.formato } : { cve_sucursal: this.varb.sucursal.cve_sucursal };

      let sendDatas = {
         evento: 'Read_Dias_Inventario_Departamento',
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
   Open_Dialog_Categoria (data:any) {
      this.dialog.open(DDdiCategoria, {
         data: {
            cve_depto: data.cve_depto,
            formato: this.data.formato,
            title: data.descripcion
         },
         width: '800px',  
         maxWidth: '100vw',
         panelClass: 'dialogo-sin-padding'
      });
   }
}