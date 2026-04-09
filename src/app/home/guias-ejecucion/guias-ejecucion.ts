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

import { DGuias } from "./../../dialog/d-guias/d-guias";

@Component({
  selector: 'app-guias-ejecucion',
  imports: [ImportsModules, Material, Primeng],
  templateUrl: './guias-ejecucion.html',
  styleUrl: './guias-ejecucion.css'
})
export class GuiasEjecucion {
   private destroy$ = new Subject<void>();
   readonly dialog = inject(MatDialog);
   ruta = new Rutas;
   varb = new Variables;

   constructor (public fun: Funciones, private service: AppService) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {
         this.varb.user = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.varb.sucursal = this.fun.Get_SessionStorage(this.varb.storageSucursal, 'json');
         this.varb.loading = false;
         this.varb.message = 'Sin Información.';
         this.Create_Menu();
         this.Read_Evaluacion();

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
            menu: 'Guías de Ejecución',
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
   Read_Evaluacion () {
      this.varb.table = [];
      this.varb.loading = true;

      let sendDatas = {
         evento: 'Read_Evaluacion',
         datos: {
            estatus: 'Activo',
            sucursales: this.varb.sucursal.cve_sucursal,
            tipo: 'EJECUCION'
         }
      }

      this.service.Read(this.ruta.encuestas, sendDatas)
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
         }
      });
   }

   // ============================================ DIALOG ============================================ \\
   Open_Dialog_Indicador(item:any) {
      const seleccion = window.getSelection()?.toString();

      if (!seleccion) {
         this.dialog.open(DGuias, {
            data: {
               evaluacion: item.Evaluacion,
               tipo: item.Tipo,
               title: item.Evaluacion
            },
            width: '100%',  
            maxWidth: '100vw',
            maxHeight: '100vh',
            panelClass: ['full-screen-modal', 'dialogo-sin-padding'],
         });
      }
   }
}
