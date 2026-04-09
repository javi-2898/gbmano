import { Component } from '@angular/core';

import { of, Subject, catchError, tap, switchMap } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Variables } from "./../../class/variables";
import { Funciones } from "./../../class/funciones";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

type SucursalData = {
   sucursal: number;
   nombre: string;
   Total: string | null;
   [key: string]: string | number | null; // Permite propiedades dinámicas
};

@Component({
   selector: 'app-resultados-generales',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './resultados-generales.html',
   styleUrl: './resultados-generales.css'
})


export class ResultadosGenerales {
   private destroy$ = new Subject<void>();
   varb = new Variables;
   ruta = new Rutas;

   constructor (private service:AppService, public fun: Funciones) {}

   ngOnInit() {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.loading_2 = false;
         this.varb.message = 'Sin Información.';
         this.varb.message_2 = 'Sin Información.';
         this.varb.user = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.Create_Menu();
         this.Cargar_Fun_Read();

      }
   }

   // ============================================ READ ============================================ \\
   Create_Menu () {
      let sendData = {
         evento: "Create_Menu",
         datos: {
            cve_sucursal: this.varb.user.cve_sucursal,
            menu: 'Resultados Generales',
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
   Read_General () {
      let tipo = (this.varb.selectFormato != undefined || this.varb.selectFormato != null) ? this.varb.selectFormato.value : '';
      let region = (this.varb.selectRegion != undefined || this.varb.selectRegion != null) ? this.varb.selectRegion.value : '';

      let sendData = {
         evento: "Read_General",
         datos: {
            fin_month: this.varb.selectMesFin.value,
            fin_year: this.varb.selectYearFin.Year,
            inicio_month: this.varb.selectMes.value,
            inicio_year: this.varb.selectYear.Year,
            region: region,
            tipo: tipo
         }
      };

      return this.service.Read(this.ruta.resultadosGenerales, sendData).pipe(
         tap((res: any) => {
            if (res.code === 200) {

               this.varb.table = res.data;
               this.varb.total = res.data[0].Total;

            } else if (res.code === 201) {
            
               this.varb.table = [];
               this.varb.message = res.message;

            } else {
               this.fun.Swal_Advertencia(res.message);
            }
         }),
         catchError((error) => {
            this.fun.Swal_Error(error.message);
            return of(null);
         })
      );
   }

   Read_Regiones () {
      let sendDatas = {
         evento: "Read_Regiones",
         datos: null
      };

      return this.service.Read(this.ruta.general, sendDatas)
      .pipe(
         tap((res: any) => {

            if (res.code === 200) {
               this.varb.regiones = res.data;
            }  else {
               this.fun.Swal_Advertencia(res.message);
            }

         }),
         catchError((error) => {
            this.fun.Swal_Error(error.message);
            return of(null);
         })
      );
   }

   Read_Tabla () {
      let tipo = (this.varb.selectFormato != undefined || this.varb.selectFormato != null) ? this.varb.selectFormato.value : '';
      let region = (this.varb.selectRegion != undefined || this.varb.selectRegion != null) ? this.varb.selectRegion.value : '';
      
      let sendData = {
         evento: "Read_Tabla",
         datos: {
            fin_month: this.varb.selectMesFin.value,
            fin_year: this.varb.selectYearFin.Year,
            inicio_month: this.varb.selectMes.value,
            inicio_year: this.varb.selectYear.Year,
            region: region,
            tipo: tipo
         }
      };

      return this.service.Read(this.ruta.resultadosGenerales, sendData)
      .pipe(
         tap((res: any) => {

            if (res.code === 200) {
                    this.varb.sucursales = res.data;
                    this.varb.totalMeses = this.extraerClavesMeses(res.data);

                } else if (res.code === 201) {
                    this.varb.sucursales = [];
                    this.varb.totalMeses = [];
                    this.varb.message_2 = res.message;
                } else {
                    this.fun.Swal_Advertencia(res.message);
                }

         }),
         catchError((error) => {
            this.fun.Swal_Error(error.message);
            return of(null);
         })
      );
   }

   Read_Tipo_Sucursal () {
      let sendDatas = {
         evento: "Read_Tipo_Sucursal",
         datos: null
      };

      return this.service.Read(this.ruta.general, sendDatas)
      .pipe(
         tap((res: any) => {

            if (res.code === 200) {
               this.varb.formato = res.data;
            }  else {
               this.fun.Swal_Advertencia(res.message);
            }

         }),
         catchError((error) => {
            this.fun.Swal_Error(error.message);
            return of(null);
         })
      );
   }

   // ============================================ FUNCIONES ============================================ \\
   Cargar_Fun_Read () {
      this.varb.loading = true;
      this.varb.loading_2 = true;

      this.Read_Tipo_Sucursal().pipe(
         switchMap(() => this.Read_Regiones()),
         takeUntil(this.destroy$)
      ).subscribe({
         complete: () => {
            this.varb.loading = false;
            this.varb.loading_2 = false;
         }
      });
   }

   Cargar_Search_Read () {
      this.varb.loading = true;
      this.varb.loading_2 = true;

      this.Read_General().pipe(
         switchMap(() => this.Read_Tabla()),
         takeUntil(this.destroy$)
      ).subscribe({
         complete: () => {
            this.varb.loading = false;
            this.varb.loading_2 = false;
         }
      });
   }

   private extraerClavesMeses(data: SucursalData[]): string[] {
      if (!data || data.length === 0) {
         return [];
      }
      const primerElemento = data[0];
      const clavesAExcluir = ['sucursal', 'nombre', 'Total'];
    
      // Filtramos todas las claves para quedarnos solo con los meses
      const clavesMeses = Object.keys(primerElemento).filter(key => 
         !clavesAExcluir.includes(key)
      );

      return clavesMeses;
   }
}