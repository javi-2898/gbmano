import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import * as c3 from 'c3';
import * as d3 from 'd3'; 
import { of, Subject, catchError, tap, switchMap } from "rxjs";
// Importamos 'debounceTime' y 'distinctUntilChanged' para la búsqueda en tiempo real
import { takeUntil, debounceTime, distinctUntilChanged } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Variables } from "./../../class/variables";
import { Funciones } from "./../../class/funciones";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

import { DPromociones } from "./../../dialog/d-promociones/d-promociones";

@Component({
   selector: 'app-productos',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './productos.html',
   styleUrl: './productos.css'
})

export class Productos {
   private destroy$       = new Subject<void>();
   private searchSubject$ = new Subject<string>();

   readonly dialog = inject(MatDialog);

   ruta = new Rutas;
   varb = new Variables;

   constructor (public fun: Funciones, private service: AppService) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.loading_2 = false;
         this.varb.loading_3 = false;
         this.varb.message = 'Sin Información.';
         this.varb.message_2 = 'Sin Información.';
         this.varb.user = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.varb.sucursal = this.fun.Get_SessionStorage(this.varb.storageSucursal, 'json');
         this.Create_Menu();

         setTimeout(() => {
            this.Grafica([
               [String(2025), 0, 0, 0, 0, 0, 0],
               [String(2025 - 1), 0, 0, 0, 0, 0, 0]
            ]);
         }, 0);

         this.searchSubject$.pipe(
            debounceTime(600), 
            distinctUntilChanged(), 
            tap(term => {
               if (typeof term === 'object' && term !== null) {
                  this.executeSearch(term); 
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
               
               // Si el término está vacío, puedes decidir si quieres limpiar la lista o no.
               if (textoBusqueda.length === 0) {
                  this.varb.producto = [];
                  return of(null); 
               }
               
               this.varb.producto = [];
               
               let sendDatas = {
                  evento: 'Read_Producto',
                  datos: {
                     cve_sucursal: this.varb.sucursal.cve_sucursal,
                     texto: textoBusqueda
                  }
               };

               // Hacemos la llamada a la API y manejamos el error
               return this.service.Read(this.ruta.productos, sendDatas).pipe(
                  catchError(error => {
                     this.fun.Swal_Error(error.message);
                     this.varb.loading_2 = false;
                     return of(null); // Devolvemos un observable nulo para no romper el stream
                  })
               );
            }),
            takeUntil(this.destroy$)

         ).subscribe(res => {
            if (res && res.code === 200) {
               this.varb.producto = res.data;
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
   Create_Menu () {
      let sendData = {
         evento: "Create_Menu",
         datos: {
            cve_sucursal: this.varb.user.cve_sucursal,
            menu: 'Productos',
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
   Read_Producto (texto:string) {
      this.varb.producto = []; 

      let sendDatas = {
         evento: 'Read_Producto',
         datos: {
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            texto: texto
         }
      }

      this.service.Read(this.ruta.productos, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.varb.producto = res.data;
            } else if (res.code !== 201) {
               this.fun.Swal_Advertencia(res.message);
            }
         },
         error: (error) => {
            this.fun.Swal_Error(error.message);
         }
      });
   }

   Read_Producto_Codigo () {
      this.varb.producto = []; 

      let sendDatas = {
         evento: 'Read_Producto_Codigo',
         datos: {
            codigo: this.varb.codigo,
            cve_sucursal: this.varb.sucursal.cve_sucursal
         }
      }

      this.service.Read(this.ruta.productos, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               
               this.varb.productos = res.data[0];
               this.varb.cveProducto = res.data[0].cve_producto;
               this.varb.descripcion = res.data[0].descripcion;
               this.Cargar_Fun_Read();
               
            } else if (res.code !== 201) {
               this.fun.Swal_Advertencia(res.message);
            }
         },
         error: (error) => {
            this.fun.Swal_Error(error.message);
         }
      });
   }

   Read_Producto_Entradas () {
      this.varb.table = [];
      
      let sendDatas = {
         evento: 'Read_Producto_Entradas',
         datos: {
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            cve_producto: this.varb.productos.cve_producto
         }
      }

      return this.service.Read(this.ruta.productos, sendDatas)
      .pipe(
         tap((res: any) => {
            this.varb.loading_3 = false;

            if (res.code === 200) {
               this.varb.table = res.data;
            } else if (res.code === 201) {
               this.varb.message = res.message;
            } else {
               this.fun.Swal_Advertencia(res.message);
            }
         }),
         catchError((error) => {
            this.varb.loading_3 = false;
            this.fun.Swal_Error(error.message);
            return of(null);
         })
      );
   }

   Read_Producto_Precio () {
      let sendDatas = {
         evento: 'Read_Producto_Precio',
         datos: {
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            cve_producto: this.varb.productos.cve_producto
         }
      }

      return this.service.Read(this.ruta.productos, sendDatas)
      .pipe(
         tap((res: any) => {
            this.varb.loading_2 = false;

            if (res.code === 200) {
               
               this.varb.existenciaCEDIS = res.data[0].ExistenciaCEDIS;
               this.varb.precio          = res.data[0].precio_pieza;
               this.varb.precioTri       = res.data[0].precio_tri;
               this.varb.precioSix       = res.data[0].precio_six;
               this.varb.precioMedio     = res.data[0].precio_media;
               this.varb.precioCaja      = res.data[0].precio_caja;
               this.varb.caja            = res.data[0].cont_caja;
               this.varb.media           = res.data[0].cont_med;
               this.varb.tri             = res.data[0].cont_tri;
               this.varb.six             = res.data[0].cont_six;
               this.varb.precioOfer      = res.data[0].Oferta;
               this.varb.fechaOfertaI    = res.data[0].Inicio_Oferta;
               this.varb.fechaOfertaF    = res.data[0].Fin_Oferta;
               this.varb.folioPromo      = res.data[0].Folio_Promo
               this.varb.fechaPromocionF = res.data[0].Fin_Promo;
               this.varb.fechaPromocionI = res.data[0].Inicio_Promo;
               this.varb.tipoPromocion   = Number(res.data[0].Tipo_Promo);

            } else {
               this.fun.Swal_Advertencia(res.message);
            }
         }),
         catchError((error) => {
            this.varb.loading_2 = false;
            this.fun.Swal_Error(error.message);
            return of(null);
         })
      );
   }

   Read_Producto_Resumen () {
      let sendDatas = {
         evento: 'Read_Producto_Resumen',
         datos: {
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            cve_producto: this.varb.productos.cve_producto
         }
      }

      return this.service.Read(this.ruta.productos, sendDatas)
      .pipe(
         tap((res: any) => {
            this.varb.loading = false;

            if (res.code === 200) {

               let series1: any = [];
               let series2: any = [];

               this.varb.existencia = res.data3.Existencia;
               this.varb.rotacion = res.data.rotacion;
               this.varb.ventaActual = res.data.venta60;
               this.varb.inventario = this.varb.existencia / this.varb.rotacion;

               for (const property in res.data) {
                  if (property != "rotacion" && property != "venta60") {
                     series1.push(res.data[property]);
                     series2.push(res.data2[property]);
                  }
               }
               
               setTimeout(() => {
                  this.Grafica([
                     [String(this.varb.selectYear.Year), series1[0], series1[1], series1[2], series1[3], series1[4], series1[5]],
                     [String(this.varb.selectYear.Year - 1), series2[0], series2[1], series2[2], series2[3], series2[4], series2[5]]
                  ]);
               }, 0);
               
            } else {
               this.fun.Swal_Advertencia(res.message);
            }
         }),
         catchError((error) => {
            this.varb.loading = false;
            this.fun.Swal_Error(error.message);
            return of(null);
         })
      );
   }


   // ============================================ DIALOG ============================================ \\
   Open_Dialog_Promociones (folio:any, tipoPromocion:any, fechaInicio:string, fechaFin:string) {
      const seleccion = window.getSelection()?.toString();
      if (!seleccion) {
         this.dialog.open(DPromociones, {
            data: {
               fechaFin: fechaFin,
               fechaInicio: fechaInicio,
               folio: folio,
               title: 'Promoción',
               tipoPromocion: tipoPromocion
            },
            width: '80vw',  
            maxWidth: '100vw',
            panelClass: 'dialogo-sin-padding'
         });
      }
   }


   // ============================================ FUNCIONES ============================================ \\
   Cargar_Fun_Read () {
      this.varb.loading   = true;
      this.varb.loading_2 = true;
      this.varb.loading_3 = true;

      this.Read_Producto_Entradas().pipe(
         switchMap(() => this.Read_Producto_Precio()),
         switchMap(() => this.Read_Producto_Resumen()),
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

   onSearchChange(event: string) {
      this.searchSubject$.next(event);
   }

   executeSearch(searchTerm: any) {
      if (typeof searchTerm === 'object' && searchTerm !== null && !Array.isArray(searchTerm)) {

         this.varb.productos = searchTerm;
         this.varb.cveProducto = searchTerm.cve_producto;
         this.varb.descripcion = searchTerm.descripcion;
         this.Cargar_Fun_Read();

      }
   }
}