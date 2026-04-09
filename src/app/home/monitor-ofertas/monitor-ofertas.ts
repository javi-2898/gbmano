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
   selector: 'app-monitor-ofertas',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './monitor-ofertas.html',
   styleUrl: './monitor-ofertas.css'
})

export class MonitorOfertas {
   private destroy$         = new Subject<void>();
   private searchProveedor$ = new Subject<string>();
   varb = new Variables;
   ruta = new Rutas;
   colspan = 11;

   constructor(private service:AppService, public fun: Funciones) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.message  = 'Sin Información';
         this.varb.user     = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.varb.fecha    = this.fun.GetStartOfMonth();
         this.varb.fechaFin = this.fun.GetEndOfMonth();
         this.Read_Sucursales();

         /* =============== Read_Proveedor =============== */
         this.searchProveedor$.pipe(
            debounceTime(600), 
            distinctUntilChanged(), 
            tap(term => {
               if (typeof term === 'object' && term !== null) {
                  this.executeSearchProveedor(term); 
               } else {
                  this.varb.cveProveedor = "0";
               }
            }),
            switchMap(term => {  
               // Solo procedemos si es un string (escribiendo)
               if (typeof term !== 'string') {
                  return of(null); // Ignorar si es un objeto o nulo
               }
               
               const textoBusqueda = term.trim();
               if (textoBusqueda.length < 2 && textoBusqueda.length > 0) {
                  return of(null);
               }
               
               if (textoBusqueda.length === 0) {
                  this.varb.proveedor = [];
                  return of(null); 
               }
               
               this.varb.proveedor = [];
               
               let sendDatas = {
                  evento: 'Read_Proveedor',
                  datos: {
                     texto: textoBusqueda
                  }
               };

               return this.service.Read(this.ruta.proveedor, sendDatas).pipe(
                  catchError(error => {
                     this.fun.Swal_Error(error.message);
                     this.varb.loading_2 = false;
                     return of(null); // Devolvemos un observable nulo para no romper el stream
                  })
               );
            }),
            takeUntil(this.destroy$)

         ).subscribe((res:any) => {
            if (res && res.code === 200) {
               this.varb.proveedor = res.data;
            } else if (res && res.code !== 201) {
               this.fun.Swal_Advertencia(res.message);
            }
         });

      }
   }

   ngOnDestroy () {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ READ ============================================ \\
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

   Read_Ofertas () {
      var cve_sucursal  = (this.varb.selectSuc != null || this.varb.selectSuc != undefined) ? this.varb.selectSuc.cve_sucursal : null;
      var cve_proveedor = (this.varb.selectProv != null || this.varb.selectProv != undefined) ? this.varb.selectProv.cve_proveedor : null;

      let sendDatas = {
         evento: "Read_Ofertas",
         datos: {
            cve_proveedor: cve_proveedor,
            cve_sucursal: cve_sucursal,
            fecha_fin: this.varb.fechaFin,
            fecha_inicio: this.varb.fecha
         }
      };

      this.service.Read(this.ruta.monitor, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.varb.table = res.data;
            } else if (res.code === 201) {
               this.varb.table = [];
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

   Read_Promocion () {
      var cve_sucursal  = (this.varb.selectSuc != null || this.varb.selectSuc != undefined) ? this.varb.selectSuc.cve_sucursal : null;
      var cve_proveedor = (this.varb.selectProv != null || this.varb.selectProv != undefined) ? this.varb.selectProv.cve_proveedor : null;

      let sendDatas = {
         evento: "Read_Promocion",
         datos: {
            cve_proveedor: cve_proveedor,
            cve_sucursal: cve_sucursal,
            fecha_fin: this.varb.fechaFin,
            fecha_inicio: this.varb.fecha
         }
      };

      this.service.Read(this.ruta.monitor, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.varb.table = res.data;
            } else if (res.code === 201) {
               this.varb.table = [];
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

   // ============================================ FUNCIONES ============================================ \\
   Cargar_Fun_Read () {
      if (this.varb.formatos == '') return this.fun.Swal_Advertencia('Seleccionar una opción oferta o promoción');
      
      this.varb.loading = true;
      this.varb.table   = [];
      
      if (this.varb.formatos == 'OFERTA') {
         this.Read_Ofertas();
      } else {
         this.Read_Promocion();
      }
   }

   executeSearchProveedor (searchTerm: any) {
      if (typeof searchTerm === 'object' && searchTerm !== null && !Array.isArray(searchTerm)) {
         this.varb.cveProveedor = searchTerm.cve_proveedor;
      }
   }

   onSearchChangeProveedor (event: string) {
      this.searchProveedor$.next(event);
   }
}