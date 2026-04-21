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
   selector: 'app-d-promociones',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-promociones.html',
   styleUrl: './d-promociones.css'
})

export class DPromociones {
   private destroy$ = new Subject<void>();
   
   ruta = new Rutas;
   varb = new Variables;

   constructor(@Inject(MAT_DIALOG_DATA) public data: any, private service:AppService, public fun: Funciones) {}

   ngOnInit() {
      if (this.fun.Verify_Session()) {

         this.varb.loading   = false;
         this.varb.loading_2 = false;
         this.varb.message_2 = 'Sin Información';
         this.Read_Promociones();

      }
   }

   ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
   }


   // ============================================ READ ============================================ \\
   Read_Promociones () {
      this.varb.loading = true;

      let sendDatas = {
         evento: 'Read_Promociones',
         datos: { 
            cve_producto: this.data.cveProducto,
            cve_sucursal: this.data.cveSucursal,
            folio: this.data.folio,
            tipo_promocion: this.data.tipoPromocion,
         }
      }

      this.service.Read(this.ruta.productos, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {

               this.varb.cantidad      = res.cabecero.unidades_cobrar;
               this.varb.cantidadMonto = res.cabecero.unidades_dar;
               this.varb.precio        = res.cabecero.precio_cobrar;
               this.varb.table         = res.detalle;
               this.varb.table_2       = res.detalle_2;

            } else if (res.code === 201) {
               this.varb.message = res.message;
            } else {
               this.fun.Swal_Advertencia(res.message, res.evento);
            }
         },
         error: (error) => {
            this.fun.Swal_Error(error.message, 'Error: Promociones');
            this.varb.loading = false;
         },
         complete: () => {
            this.varb.loading = false;
         },
      });
   }
}