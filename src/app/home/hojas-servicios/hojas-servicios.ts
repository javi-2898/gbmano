import { Component } from '@angular/core';

import { of, Subject, catchError, tap, switchMap } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Variables } from "./../../class/variables";
import { Funciones } from "./../../class/funciones";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

@Component({
   selector: 'app-hojas-servicios',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './hojas-servicios.html',
   styleUrl: './hojas-servicios.css'
})

export class HojasServicios {
   private destroy$ = new Subject<void>();

   varb = new Variables;
   ruta = new Rutas;

   colspan = 11;

   constructor (private service:AppService, public fun: Funciones) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.user    = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.varb.view    = false;
         this.varb.loading = false;

         this.Create_Menu();

      }
   }

   ngOnDestroy () {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ CREATE ============================================ \\
   Create_Menu () {
      let sendData = {
         evento: "Create_Menu",
         datos: {
            cve_sucursal: this.varb.user.cve_sucursal,
            menu: 'Hojas Servicios',
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
   Read_Hojas_Servicios_Sin_Terminar () {
      this.varb.table   = [];
      this.varb.loading = true;
      this.varb.view    = false;

      let sendDatas = {
         evento: "Read_Hojas_Servicios_Sin_Terminar",
         datas: {
            cve_sucursal: (this.varb.user.cve_sucursal !== '99') ? this.varb.user.cve_sucursal : null
         }
      };

      this.service.Read(this.ruta.hojasServicios, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               let data:any = [];

               res.data.forEach((item:any) => {
                  data.push({
                     falla: item.falla,
                     fecha_apertura: item.fecha_apertura,
                     fecha_asignado: item.fecha_asignacion,
                     folio: item.folio,
                     hora_apertura: this.fun.Horas(item.hora_apertura),
                     hora_asignado: (item.hora_asignacion == null) ? '' : this.fun.Horas(item.hora_asignacion),
                     prioridad: item.prioridad,
                     sucursal: item.cve_sucursal + ' - ' + this.fun.toTitulo(item.nombre_sucursal),
                     status: item.status
                  });
               });

               this.varb.table = data;
               

            } else if (res.code === 201) {
               this.varb.message = res.message;
            } else {
               this.fun.Swal_Advertencia(res.message);
            }
         },
         error: (error) => {
            this.varb.loading = false;
            this.fun.Swal_Error(error.message);
         },
         complete: () => {
            this.varb.loading = false;
         }
      });
   }

   Read_Hojas_Servicios_Terminadas () {
      this.varb.table   = [];
      this.varb.loading = true;

      let sendDatas = {
         evento: "Read_Hojas_Servicios_Terminadas",
         datos: {
            cve_sucursal: (this.varb.user.cve_sucursal !== '99') ? this.varb.user.cve_sucursal : this.varb.selectSuc.cve_sucursal,
            fecha_fin_apertura: this.varb.fechaFin != '' ? this.varb.fechaFin : null,
            fecha_inicio_apertura: this.varb.fecha != '' ? this.varb.fecha : null
         }
      };

      this.service.Read(this.ruta.hojasServicios, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               let data:any = [];

               res.data.forEach((item:any) => {
                  data.push({
                     falla: item.falla,
                     fecha_apertura: item.fecha_apertura,
                     fecha_asignado: item.fecha_asignacion,
                     folio: item.folio,
                     hora_apertura: this.fun.Horas(item.hora_apertura),
                     hora_asignado: (item.hora_asignacion == null) ? '' : this.fun.Horas(item.hora_asignacion),
                     prioridad: item.prioridad,
                     sucursal: item.cve_sucursal + ' - ' + this.fun.toTitulo(item.nombre_sucursal),
                     status: item.status
                  });
               });

               this.varb.table = data;
               

            } else if (res.code === 201) {
               this.varb.message = res.message;
            } else {
               this.fun.Swal_Advertencia(res.message);
            }
         },
         error: (error) => {
            this.varb.loading = false;
            this.fun.Swal_Error(error.message);
         },
         complete: () => {
            this.varb.loading = false;
         }
      });
   }

   Read_Sucursales () {
      let sendDatas = {
         evento: "Read_Sucursal",
         datos: null
      };

      this.service.Read(this.ruta.sucursales, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               
               res.data.forEach((params:any) => {
                  this.varb.sucursales.push({
                     cve_sucursal: params.cve_sucursal,
                     nombre: params.cve_sucursal+' - '+this.fun.toTitulo(params.nombre)
                  });
               });
               
            } else {
               this.fun.Swal_Advertencia(res.message);
            }
         },
         error: (error) => {
            this.fun.Swal_Error(error.message);
         },
         complete: () => {
            if (this.varb.user.cve_sucursal !== '99') {
               this.varb.selectSuc = this.fun.Get_SessionStorage(this.varb.storageSucursal, 'json');
            }
         }
      });
   }


   // ============================================ FUNCIONES ============================================ \\
   Activar_Inputs () {
      this.varb.table = [];
      this.varb.view  = true;
      this.Read_Sucursales();
   }
}