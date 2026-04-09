import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Variables } from "./../../class/variables";
import { Funciones } from "./../../class/funciones";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

import { DAudkpi } from "./../../dialog/d-audkpi/d-audkpi";

@Component({
   selector: 'app-evaluaciones',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './evaluaciones.html',
   styleUrl: './evaluaciones.css'
})

export class Evaluaciones {
   private destroy$ = new Subject<void>();
   readonly dialog = inject(MatDialog);

   ruta = new Rutas;
   varb = new Variables;

   constructor (public fun: Funciones, private service: AppService) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.message_2 = 'Sin Información';
         this.varb.fecha = this.fun.GetStartOfMonth();
         this.varb.fechaFin = this.fun.GetEndOfMonth();
         this.varb.user = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.Create_Menu();

      }
   }

   ngOnDestroy () {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ READ ============================================ \\
   Create_Menu () {
      let sendData = {
         evento: "Create_Menu",
         datos: {
            cve_sucursal: this.varb.user.cve_sucursal,
            menu: 'Evaluaciones',
            usuario: this.varb.user.usuario
         }
      };

      return this.service.Read(this.ruta.views, sendData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            console.log(res.message);
            
         }, 
         error: (err) => {
            console.log(err.message);
               
         },
      });
   }

   // ============================================ READ ============================================ \\
   Read_Auditoria () {
      this.varb.alert = false;
      this.varb.table = [];

      if (this.varb.fecha === '') {

         this.varb.loading = false;
         this.varb.alert = true;
         this.varb.message = 'El campo <i>Fecha Inicio</i> no puede estar vacío.';
         return

      }

      if (this.varb.fechaFin === '') {

         this.varb.loading = false;
         this.varb.alert = true;
         this.varb.message = 'El campo <i>Fecha Fin</i> no puede estar vacío.';
         return

      }

      if (this.varb.fecha > this.varb.fechaFin) {

         this.varb.loading = false;
         this.varb.alert = true;
         this.varb.message = '<i>Fecha Inicio</i> no debe ser mayor a la <i>Fecha Fin</i>.';
         return

      }
      
      this.varb.loading = true;

      let sendDatas = {
         evento: 'Read_Auditoria',
         datos: {
            fecha_inicio: this.fun.Convert_Fechas(this.varb.fecha),
            fecha_fin: this.fun.Convert_Fechas(this.varb.fechaFin)
         }
      }

      this.service.Read(this.ruta.evaluaciones, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.varb.table = res.data;
            } else if (res.code === 201) {
               this.varb.table = [];
               this.varb.message_2 = res.message;
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
   openDialog (item:any) {
      this.dialog.open(DAudkpi, {
         data: {
            auditado: item.auditado,
            auditor: item.auditor,
            cve_auditado: item.cve_auditado,
            cve_auditor: item.cve_auditor,
            cve_sucursal: item.cve_sucursal,
            evaluacion: item.evaluacion,
            fecha: item.fechaEvaluacion,
            puesto_auditado: item.puesto_auditado, 
            tipo: item.tipo,
            title: 'KPI '+item.sucursal,
            sucursal: item.sucursal
         },
         width: '1000px',  
         maxWidth: '90vw',
      });
   }

   // ============================================ FUNCIONES ============================================ \\
   onRowClick (item: any) {
      const seleccion = window.getSelection()?.toString();
      if (!seleccion) {
         this.openDialog(item);
      }
   }
}