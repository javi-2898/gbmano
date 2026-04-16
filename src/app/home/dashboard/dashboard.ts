import { Component, inject, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { of, Subject, catchError, tap, switchMap } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as c3 from 'c3';
import * as d3 from 'd3'; 

import { AbbreviatePipe } from "./../../class/abbreviate";
import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Variables } from "./../../class/variables";
import { Funciones } from "./../../class/funciones";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

import { DDdiDepartamento } from "./../../dialog/d-ddi-departamento/d-ddi-departamento";
import { DDetallePrecio } from "./../../dialog/d-detalle-precio/d-detalle-precio";
import { DIndicador } from "./../../dialog/d-indicador/d-indicador";

@Component({
   selector: 'app-dashboard',
   imports: [ImportsModules, Material, Primeng, AbbreviatePipe],
   templateUrl: './dashboard.html',
   styleUrl: './dashboard.css'
})

export class Dashboard {
   private destroy$ = new Subject<void>();
   readonly dialog = inject(MatDialog);

   varb = new Variables;
   ruta = new Rutas;

   constructor(private service:AppService, public fun: Funciones) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {
         this.varb.user = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.varb.sucursal = this.fun.Get_SessionStorage(this.varb.storageSucursal, 'json');
         
         this.checkScreenSize();
         
         if (this.varb.sucursal !== null) {
            this.Cargar_Fun_Read();
         }
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
            menu: 'Dashboard',
            usuario: this.varb.user.usuario
         }
      };

      return this.service.Read(this.ruta.views, sendData)
      .pipe(
         tap((res: any) => {
            console.log(res.message)
         }),
         catchError((error) => {
            console.log(error.message);
            return of(null);
         })
      );
   }

   // ============================================ READ ============================================ \\
   Read_Dias_Inventario  () {
      let sendData = {
         evento: "Read_Dias_Inventario",
         datos: {
            cve_sucursal: this.varb.sucursal.cve_sucursal
         }
      };

      return this.service.Read(this.ruta.dashboard, sendData)
      .pipe(
         tap((res: any) => {
            this.varb.loading_6 = false;
            if (res.code === 200) {
               this.varb.DDI = res.data[0].DDI;
            } else {
               this.fun.Swal_Advertencia(res.message, res.evento);
            }
         }),
         catchError((error) => {
            this.varb.loading_6 = false;
            this.fun.Swal_Error(error.message, 'Días Inventario');
            return of(null);
         })
      );
   }

   Read_Grafica_Ventas () {
      let sendData = {
         evento: "Read_Grafica_Ventas",
         datos: {
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            month: this.varb.selectMes.value,
            year: this.varb.selectYear.Year
         }
      };

      return this.service.Read(this.ruta.dashboard, sendData)
      .pipe(
         tap((res: any) => {

            if (res.code === 200) {
               
               this.varb.loading_2 = false;
               let yearActual:any = [];
               let yearAnterior:any = [];

               if (parseInt(res.data[0].año) === this.varb.selectYear.Year) {
                  yearActual.push(String(this.varb.selectYear.Year) );
                  yearAnterior.push(String(this.varb.selectYear.Year - 1));
               }

               res.data.forEach((item:any) => {
                  yearActual.push(parseFloat(item.ventaactual));
                  yearAnterior.push(parseFloat(item.ventaanterior));
               })
               
               setTimeout(() => {
                  this.Grafica([yearActual, yearAnterior]);
               }, 0);
               
            } else if (res.code === 201) {
               this.fun.Swal_Advertencia(res.message, res.evento);
            } else {
               this.fun.Swal_Error(res.message, res.evento);
            }

            if (res.code !== 200) {

               this.Grafica([
                  [String(this.varb.selectYear.Year), 0, 0, 0, 0, 0, 0],
                  [String(this.varb.selectYear.Year - 1), 0, 0, 0, 0, 0, 0]
               ]);

            }
         }),
         catchError((error) => {
            this.varb.loading_2 = false;
            this.fun.Swal_Error(error.message, 'Graficas Ventas');
            return of(null);
         })
      );
   }

   Read_Precios_Aplicar () {
      let sendData = {
         evento: "Read_Precios_Aplicar",
         datos: {
            cve_sucursal: this.varb.sucursal.cve_sucursal
         }
      };

      return this.service.Read(this.ruta.dashboard, sendData)
      .pipe(
         tap((res: any) => {
            this.varb.loading_3 = false;

            if (res.code === 200) {
               this.varb.precioAplicar = res.data[0];
            } else if (res.code === 201) {
               this.fun.Swal_Error(res.message, res.evento);
            } else {
               this.fun.Swal_Advertencia(res.message, res.evento);
            }
         }),
         catchError((error) => {
            this.varb.loading_3 = false;
            this.fun.Swal_Error(error.message, 'Precios Aplicar');
            return of(null);
         })
      );
   }

   Read_Tabla () {
      let sendData = {
         evento: "Read_Tabla",
         datos: {
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            month: this.varb.selectMes.value,
            year: this.varb.selectYear.Year
         }
      };

      return this.service.Read(this.ruta.dashboard, sendData).pipe(
         tap((res: any) => {
            this.varb.loading = false;

            if (res.code === 200) {

               this.varb.table = res.data;
               this.varb.ventaActual = res.data[0].Resultado;
               this.varb.ventaAnterior = res.data[0].VtaAnterior;
               this.varb.objetivo = res.data[0].VtaObjetivo;
               this.varb.cobertura = ((this.varb.ventaActual / this.varb.objetivo) * 100) > 0 ? ((this.varb.ventaActual / this.varb.objetivo) * 100) : 0;
               this.varb.crecimiento = (((this.varb.ventaActual / res.data[0].RangoObjetivoInicial)-1)*100);
               this.Total_Puntos();
               this.Total_Ponderacion();

            } else if (res.code === 201) {
            
               this.varb.table = [];
               this.varb.totalPuntos = 0.0;
               this.varb.ventaActual = 0;
               this.varb.ventaAnterior = 0;
               this.varb.objetivo = 0;
               this.varb.cobertura = 0;
               this.varb.crecimiento = 0;
               this.varb.message = res.message;

            } else {
               this.fun.Swal_Error(res.message, res.evento);
            }
         }),
         catchError((error) => {
            this.varb.loading = false;
            this.fun.Swal_Error(error.message, 'Tabla');
            return of(null);
         })
      );
   }

   Read_Tickets () {
      let sendData = {
         evento: "Read_Tickets",
         datos: {
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            month: this.varb.selectMes.value,
            year: this.varb.selectYear.Year
         }
      };

      return this.service.Read(this.ruta.dashboard, sendData)
      .pipe(
         tap((res: any) => {
            this.varb.loading_4 = false;

            if (res.code === 200) {
               this.varb.tickets = res.data[0];
            } else if (res.code === 201) {
               this.fun.Swal_Advertencia(res.message, res.evento);
            } else {
               this.fun.Swal_Error(res.message, res.evento);
            }
         }),
         catchError((error) => {
            this.varb.loading_4 = false;
            this.fun.Swal_Error(error.message, 'Tickets');
            return of(null);
         })
      );
   }

   Read_Ventas_YTD_VS_AA () {
      let sendData = {
         evento: "Read_Ventas_YTD_VS_AA",
         datos: {
            cve_sucursal: this.varb.sucursal.cve_sucursal
         }
      };

      return this.service.Read(this.ruta.dashboard, sendData)
      .pipe(
         tap((res: any) => {
            this.varb.loading_5 = false;

            if (res.code === 200) {
               this.varb.crecimientoYTD = res.data[0].Crecimiento;
               this.varb.ventaYTD = res.data[0].VentaYTD;
            } else if (res.code == 201) {
               this.fun.Swal_Advertencia(res.message, res.evento);
            } else {
               this.fun.Swal_Error(res.message, res.evento);
            }
         }),
         catchError((error) => {
            this.varb.loading_5 = false;
            this.fun.Swal_Error(error.message, 'Ventas YTD VS AA');
            return of(null);
         })
      );
   }

   // ============================================ FUNCIONES ============================================ \\
   Cargar_Fun_Read () {
      this.varb.loading = true;
      this.varb.loading_2 = true;
      this.varb.loading_3 = true;
      this.varb.loading_4 = true;
      this.varb.loading_5 = true;
      this.varb.loading_6 = true;

      this.Create_Menu().pipe(
         switchMap(() => this.Read_Tabla()),
         switchMap(() => this.Read_Ventas_YTD_VS_AA()),
         switchMap(() => this.Read_Precios_Aplicar()),
         switchMap(() => this.Read_Dias_Inventario()),
         switchMap(() => this.Read_Tickets()),
         switchMap(() => this.Read_Grafica_Ventas()),
         takeUntil(this.destroy$)
      ).subscribe({
         complete: () => {}
      });
   }

   Grafica (column:any) {
      const config: any = {
         bindto: '#chart',
         data: {
            columns: column,
            type: 'line'
         },
         line: {
            width: {
               [String(this.varb.selectYear.Year)]: 4,
               [String(this.varb.selectYear.Year - 1)]: 2
            }
         },
         tooltip: {
            format: {
               value: (value: number) => {
                  return "$ " + d3.format(",.2f")(value);
               }
            }
         },
         axis: {
            x: {
               type: 'category',
               categories: this.fun.Get_Meses(this.varb.selectMes.value)
            }
         }
      };

      const chart = c3.generate(config);
   }

   Total_Puntos () {
      let total = 0;

      for (let sale of this.varb.table) {
         total += parseFloat(sale.Puntos);
      }

      this.varb.totalPuntos = total;
   }

   Total_Ponderacion () {
      let total = 0;
      
      for (let sale of this.varb.table) {
         total += parseFloat(sale.Ponderacion);
      }

      this.varb.totalPonderacion = total;
   }

   onRowClick (item: any) {
      const seleccion = window.getSelection()?.toString();
      if (!seleccion) {
         this.Open_Dialog_Indicador(item);
      }
   }

   /* --- Verifica el tamañano de la pantallla */
   @HostListener('window:resize')
   onResize() {
      this.checkScreenSize();
   }

   checkScreenSize() {
      // Definimos que 'view' es true si es pantalla pequeña (Móvil)
      this.varb.view = window.innerWidth < 768;
   }

   // ============================================ DIALOG ============================================ \\
   Open_Dialog_Dias_Invetario_Departamento () {
      this.dialog.open(DDdiDepartamento, {
         data: {
            title: 'Días de Inventario',
         },
         width: '800px',  
         maxWidth: '100vw',
         panelClass: 'dialogo-sin-padding'
      });
   }

   Open_Dialog_Detalle_Precio () {
      this.dialog.open(DDetallePrecio, {
         data: {
            title: 'Precio por Aplicar',
         },
         width: '1100px',  
         maxWidth: '100vw',
         panelClass: 'dialogo-sin-padding'
      });
   }

   Open_Dialog_Indicador (indicador:any) {
      this.dialog.open(DIndicador, {
         data: {
            title: indicador,
            month: this.varb.selectMes.value,
            year: this.varb.selectYear.Year
         },
         width: '1100px',  
         maxWidth: '100vw',
         panelClass: 'dialogo-sin-padding'
      });
   }
}