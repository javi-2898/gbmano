import { Component } from '@angular/core';

import * as XLSX from 'xlsx-js-style';

import { saveAs } from 'file-saver';
import { of, Subject, catchError, tap, switchMap } from "rxjs";
// Importamos 'debounceTime' y 'distinctUntilChanged' para la búsqueda en tiempo real
import { takeUntil, debounceTime, distinctUntilChanged } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Variables } from "./../../class/variables";
import { Funciones } from "./../../class/funciones";
import { Rutas } from "./../../class/rutas";
import { Productos } from "./../../class/producto_analisis";

import { AppService } from "./../../app.service";

@Component({
   selector: 'app-analisis',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './analisis.html',
   styleUrl: './analisis.css'
})

export class Analisis {
   private destroy$ = new Subject<void>();
   private searchMarca$ = new Subject<string>();
   private searchProveedor$ = new Subject<string>();

   ruta = new Rutas;
   varb = new Variables;
   dataSource: any;
   datos: Productos [] | any;

   constructor (public fun: Funciones, private service: AppService) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.message = 'Sin Información.';
         this.varb.user = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.varb.selectSuc = this.fun.Get_SessionStorage(this.varb.storageSucursal, 'json');
         this.Cargar_Fun_Read();

         /* =============== Read_Marca =============== */
         this.searchMarca$.pipe(
            debounceTime(600), 
            distinctUntilChanged(), 
            tap(term => {
               if (typeof term === 'object' && term !== null) {
                  this.executeSearchMarcar(term); 
               } else {
                  this.varb.cveMarca = "";
                  this.Table_Filtros();
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
                  this.varb.marca = [];
                  return of(null); 
               }
               
               this.varb.marca = [];
               
               let sendDatas = {
                  evento: 'Read_Marca',
                  datos: {
                     texto: textoBusqueda
                  }
               };

               return this.service.Read(this.ruta.marca, sendDatas).pipe(
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
               this.varb.marca = res.data;
            } else if (res && res.code !== 201) {
               this.fun.Swal_Advertencia(res.message);
            }
         });

         /* =============== Read_Proveedor =============== */
         this.searchProveedor$.pipe(
            debounceTime(600), 
            distinctUntilChanged(), 
            tap(term => {
               if (typeof term === 'object' && term !== null) {
                  this.executeSearchProveedor(term); 
               } else {
                  this.varb.cveProveedor = "0";
                  this.Table_Filtros();
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
   Create_Menu () {
      let sendData = {
         evento: "Create_Menu",
         datos: {
            cve_sucursal: this.varb.user.cve_sucursal,
            menu: 'Análisis',
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

   // ============================================ GET READ ============================================ \\
   Read_Categoria () {
      let sendDatas = {
         evento: 'Read_Categoria',
         datos: null
      };

      return this.service.Read(this.ruta.categoria, sendDatas)
      .pipe(
         tap((data: any) => {
            if (data.code === 200) {
               this.varb.categoria = data.data;
            } else {
               this.fun.Swal_Advertencia(data.message);
            }
         }),
         catchError((error) => {
            this.fun.Swal_Error(error.message);
            return of(null);
         })
      );
   }

   Read_Analisis () {
      let sendDatas = {
         evento: "Read_Analisis",
         datos: {
            cve_sucursal: this.varb.selectSuc.cve_sucursal
         }
      };

      return this.service.Read(this.ruta.analisis, sendDatas)
      .pipe(
         tap((res: any) => {
            this.varb.loading = false;
            this.dataSource = [];
            this.datos = [];

            if (res.code === 200) {

               res.data.forEach((d:any) => {
                  let producto = new Productos(
                     d.cve_producto,
                     d.descripcion,
                     d.unidades,
                     d.importe_vta,
                     d.desplazamiento,
                     d.rotacion,
                     d.Clasificacion,
                     d.Existencia,
                     d.DiasInv,
                     d.participacion,
                     d.existencia80,
                     d.fecha_documento ? d.ultimaventa : "",
                     d.Cve_Proveedor,
                     d.Cve_Categoria,
                     d.Cve_Marca
                  );

                  this.varb.skus += 1;
                  this.varb.totalExistencia += Number(d.Existencia);
                  this.varb.totalImporte += Number(d.importe_vta);
                  this.varb.totalVenta += Number(d.unidades);
                  this.datos.push(producto);
               });

               this.Table_Filtros();

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

   // ============================================ FUNCIONES ============================================ \\
   Cargar_Fun_Read() {
      this.varb.loading = true;

      this.Create_Menu().pipe(
         switchMap(() => this.Read_Analisis()),
         switchMap(() => this.Read_Categoria()),
         takeUntil(this.destroy$)
      ).subscribe({
         complete: () => {}
      });
   }

   Table_Filtros () {
      this.dataSource = this.datos.filter((producto: Productos) => {
         return ((Number(this.varb.cveProveedor) != 0 ? producto.proveedor == Number(this.varb.cveProveedor) : true) &&
            (this.varb.cveMarca != "" ? producto.marca == this.varb.cveMarca : true) &&
            (this.varb.cveCategoria != "" ? producto.categoria == this.varb.cveCategoria : true) &&
            (this.varb.existencia2 != 0 ? producto.existencia >= this.varb.existencia2 : true) &&
            (this.varb.sinExistencia != 0 ? producto.existencia > -1 && producto.existencia < 1 : true) &&
            (this.varb.sinVenta != 0 ? producto.unidades == 0 : true) &&
            (this.varb.participacion != 0 ? producto.participacion < this.varb.participacion : true) &&
            (this.varb.almacen != 0 ? producto.existencia80 > this.varb.almacen : true)
         )
      });      
      
      this.varb.filtroExistencia = 0;
      this.varb.filtroImporte = 0;
      this.varb.filtroVenta = 0;
      this.varb.filtroSKUS = 0;
      this.varb.porcExistencia = 0;
      this.varb.porcImporte = 0;
      this.varb.porcVenta = 0;
      this.varb.porcSKUS = 0;

      this.dataSource.forEach((d:any) => {         
         this.varb.filtroExistencia += Number(d.existencia);
         this.varb.filtroImporte += Number(d.importe_vta);
         this.varb.filtroVenta += Number(d.unidades);
         this.varb.filtroSKUS += 1;
      });
      
      this.varb.porcExistencia = (this.varb.filtroExistencia / this.varb.totalExistencia) * 100;
      this.varb.porcImporte = (this.varb.filtroImporte / this.varb.totalImporte) * 100;
      this.varb.porcVenta = (this.varb.filtroVenta / this.varb.totalVenta) * 100;
      this.varb.porcSKUS = (this.varb.filtroSKUS / this.varb.skus) * 100;
   }

   onSearchChangeMarca (event: string) {
      this.searchMarca$.next(event);
   }

   executeSearchMarcar (searchTerm: any) {
      if (typeof searchTerm === 'object' && searchTerm !== null && !Array.isArray(searchTerm)) {
         this.varb.cveMarca = searchTerm.cve_marca;
         this.Table_Filtros();
      }
   }

   onSearchChangeProveedor (event: string) {
      this.searchProveedor$.next(event);
   }

   executeSearchProveedor (searchTerm: any) {
      if (typeof searchTerm === 'object' && searchTerm !== null && !Array.isArray(searchTerm)) {
         this.varb.cveProveedor = searchTerm.cve_proveedor;
         this.Table_Filtros();
      }
   }

   onChangeCategoria (event: any) {
      this.varb.cveCategoria = event == null ? '' : event.id;
      this.Table_Filtros();
   }

   onChangeExitencia (event: any) {
      this.varb.existencia2 = event.length == 0 ? 0 : Number(event[0]);
      this.Table_Filtros();
   }

   onChangeSinExitencia (event: any) {
      this.varb.sinExistencia = event.length == 0 ? 0 : Number(event[0]);
      this.Table_Filtros();
   }

   onChangeSinVenta (event: any) {
      this.varb.sinVenta = event.length == 0 ? 0 : Number(event[0]);
      this.Table_Filtros();
   }

   // ============================================ FUNCIONES ============================================ \\
   exportExcel(dt: any) {
      const exportData = dt.filteredValue || dt.value;

      // 1. Eliminar campo que no quieres
      const cleanedData = (exportData as any[]).map(({ ExistenciaInicial, ...rest }) => rest);

      // 2. Renombrar propiedades
      const renamedData = cleanedData.map((item:any) => ({
         Clave: item.cve_producto,
         Descripción: item.descripcion,
         Unidad: item.unidades,
         'Monto Venta': item.importe_vta,
         Desplazamiento: item.desplazamiento,
         'Promedio Venta Diaria': item.rotacion,
         Existencia: item.existencia,
         'Días Inventario': item.DiasInv,
         'Participación Monto': item.participacion,
         'Almacén 80': item.existencia80,
         'Ultima Entrada': item.ultimaventa
      }));

      // 3. Crear worksheet desde JSON
      let worksheet: XLSX.WorkSheet = (XLSX.utils as any).json_to_sheet(renamedData, { origin: "A2" }); // con origin: "A2" dejamos fila 1 en blanco (header empieza en la 2)

      // 4. Aplicar estilo al header (fila 2 en Excel = r:1 en JS)
      const range = XLSX.utils.decode_range(worksheet['!ref']!);
      for (let C = range.s.c; C <= range.e.c; ++C) {
         const cellAddress = XLSX.utils.encode_cell({ r: 1, c: C }); // header en fila 2
         
         if (worksheet[cellAddress]) {
            
            worksheet[cellAddress].s = {
               fill: { type: "pattern", pattern: "solid", fgColor: { rgb: "003594" } },
               font: { bold: true, color: { rgb: "FFFFFF" } },
               alignment: { horizontal: "center", vertical: "center" }
            };

         }
      }

      // 5. Forzar columnas a ser numéricas
      const numericColumns = [
         'Unidad',
         'Monto Venta',
         'Desplazamiento',
         'Promedio Venta Diaria',
         'Existencia',
         'Almacén 80'
      ];

      numericColumns.forEach((colName) => {
         const colIndex = renamedData.length > 0 ? Object.keys(renamedData[0]).indexOf(colName) : -1;

         if (colIndex >= 0) {

            for (let R = 2; R <= range.e.r + 1; ++R) { // datos empiezan en fila 3
               const cellAddress = XLSX.utils.encode_cell({ r: R, c: colIndex });
               const cell = worksheet[cellAddress];
               
               if (cell && !isNaN(Number(cell.v))) {
                  cell.t = 'n';              // cambia tipo a number
                  cell.v = Number(cell.v);   // asegura que sea número
               }
            }

         }
      });

      // 6. Crear workbook
      const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };

      // 7. Guardar archivo
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, `reporte_analisis_${new Date().getTime()}.xlsx`);
   }
}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';