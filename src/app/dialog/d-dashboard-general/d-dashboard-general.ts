import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';

import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Funciones } from "./../../class/funciones";
import { Variables } from "./../../class/variables";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

import { DIndicador } from "./../../dialog/d-indicador/d-indicador";

@Component({
   selector: 'app-d-dashboard-general',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-dashboard-general.html',
   styleUrl: './d-dashboard-general.css'
})

export class DDashboardGeneral {
   private destroy$ = new Subject<void>();
   readonly dialog  = inject(MatDialog);

   ruta = new Rutas;
   varb = new Variables;
   cols: number = 7;

   constructor (@Inject(MAT_DIALOG_DATA) public data: any, private service:AppService, public fun: Funciones) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.message = 'Sin Información';
         this.varb.sucursal = this.fun.Get_SessionStorage(this.varb.storageSucursal, 'json');
         this.Read_Dashboard_General();

      }
   }

   ngOnDestroy () {
      this.destroy$.next();
      this.destroy$.complete();
   }


   // ============================================ READ ============================================ \\
   Read_Dashboard_General () {
      this.varb.loading = true;

      let sendDatas = {
         evento: 'Read_Dashboard_General',
         datos: {
            formato: this.data.formato,
            indicador: this.data.title,
            month: this.data.month,
            year: this.data.year
         }
      }

      this.service.Read(this.ruta.dashboard, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               //this.varb.table = res.data;
               res.data.forEach((item:any) => {
                  var data:any = {
                     calificacion: item.Calificacion,
                     cobertura: (item.resultado / item.RangoObjetivoFinal),
                     cve_sucursal: item.cve_sucursal,
                     nombre: item.NombreCorto,
                     objetivo_minimo: item.RangoObjetivoInicial,
                     objetivo_deseado: item.RangoObjetivoFinal,
                     resultado: item.resultado
                  }

                  this.varb.table.push(data);
               });
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


   // ============================================ FUNCIONES ============================================ \\
   onRowClick (item: any) {
      const seleccion = window.getSelection()?.toString();
      if (!seleccion) {
         this.Open_Dialog_Indicador(item);
      }
   }


   // ============================================ DIALOG ============================================ \\
   Open_Dialog_Indicador (item:any) {
      this.dialog.open(DIndicador, {
         data: {
            formato: this.data.formato,
            cve_sucursal: item.cve_sucursal,
            title: this.data.title,
            month: this.varb.selectMes.value,
            year: this.varb.selectYear.Year
         },
         width: '1100px',  
         maxWidth: '100vw',
         panelClass: 'dialogo-sin-padding'
      });
   }
}