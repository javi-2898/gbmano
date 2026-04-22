import { Component } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Funciones } from "./../../class/funciones";
import { Variables } from "./../../class/variables";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

@Component({
  selector: 'app-asistencia',
  imports: [ImportsModules, Material, Primeng],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.css'
})

export class Asistencia {
  private destroy$ = new Subject<void>();

  ruta = new Rutas;
  varb = new Variables;

  constructor (public fun:Funciones, private service:AppService) {}

   ngOnInit() {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.message_2 = 'Sin Información';
         this.varb.user = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.varb.fecha = this.fun.GetStartOfMonth();
         this.varb.fechaFin = this.fun.GetEndOfMonth();
         this.Create_Menu();
         this.Read_Sucursales();
         
      }
   }

   ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ CREATE ============================================ \\
   Create_Menu () {
      let sendData = {
         evento: "Create_Menu",
         datos: {
            cve_sucursal: this.varb.user.cve_sucursal,
            menu: 'Asistencia',
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
   Read_Asistencia () {
      this.varb.loading = true;
      this.varb.table = [];

      let sendDatas = {
         evento: "Read_Asistencia",
         datos: {
            cve_sucursal: this.varb.selectSuc.cve_sucursal,
            fecha_fin: this.varb.fechaFin,
            fecha_inicio: this.varb.fecha,
         }
      };

      this.service.Read(this.ruta.asistencia, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.varb.table = res.data;
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
         },
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
}