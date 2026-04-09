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

@Component({
   selector: 'app-d-guias',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-guias.html',
   styleUrl: './d-guias.css'
})

export class DGuias {
   private destroy$ = new Subject<void>();
   readonly dialog = inject(MatDialog);

   ruta = new Rutas;
   varb = new Variables;
   cols: number = 5;

   constructor(@Inject(MAT_DIALOG_DATA) public data: any, private service:AppService, public fun: Funciones) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.message = 'Sin Información.';
         this.Read_Encuestas_Areas();

      }
   }

   ngOnDestroy () {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ GET ============================================ \\
   Get_Imagen(file:string, area:string): string {
      return this.service.Get_Imagen(file, area);
   }

   // ============================================ READ ============================================ \\
   Read_Encuestas_Areas () {
      this.varb.table = [];
      this.varb.loading = true;

      let sendDatas = {
         evento: 'Read_Encuestas_Areas',
         datos: {
            evaluacion: this.data.evaluacion,
            tipo: this.data.tipo
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
}
