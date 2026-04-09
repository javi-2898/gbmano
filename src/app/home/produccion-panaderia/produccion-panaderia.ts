import { Component } from '@angular/core';

import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
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
   selector: 'app-produccion-panaderia',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './produccion-panaderia.html',
   styleUrl: './produccion-panaderia.css'
})

export class ProduccionPanaderia {
   private destroy$ = new Subject<void>();

   ruta = new Rutas;
   varb = new Variables;

   constructor (public fun:Funciones, private service:AppService) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.message_2 = 'Sin Información';
         this.varb.user = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.varb.fecha = this.fun.GetDates();
         this.Create_Menu();
         this.Read_Sucursales();

      }
   }

   ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ READ ============================================ \\
   Create_Menu () {
      let sendData = {
         evento: "Create_Menu",
         datos: {
            cve_sucursal: this.varb.user.cve_sucursal,
            menu: 'Producción Panadería',
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
   Read_Sucursales() {
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

   Read_Reporte() {
      this.varb.alert = false;
      this.varb.table = [];

      if (this.varb.fecha === '') {

         this.varb.loading = false;
         this.varb.alert = true;
         this.varb.message = 'El campo <i>Fecha</i> no puede estar vacío.';
         return

      }
      
      this.varb.loading = true;

      let sendDatas = {
         evento: 'Read_Reporte',
         datos: {
            cve_sucursal: (this.varb.selectSuc !== undefined && this.varb.selectSuc !== null) ? this.varb.selectSuc.cve_sucursal : null,
            fecha: this.varb.fecha
         }
      }

      this.service.Read(this.ruta.panaderia, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.varb.table = res.data;
            } else if (res.code === 201) {
               this.varb.table = [];
               this.varb.message_2 = res.message;
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
         },
      });
   }

   // ============================================ FUNCIONES ============================================ \\
   exportExcel(dt: any) {
      const exportData = dt.filteredValue || dt.value;

      // 1. Eliminar campo que no quieres
      const cleanedData = (exportData as any[]).map(({ ExistenciaInicial, ...rest }) => rest);

      // 2. Renombrar propiedades
      const renamedData = cleanedData.map((item:any) => ({
         Suc: item.cve_sucursal,
         Producto: item.cve_producto,
         Pres: item.cve_presentacion,
         Descripción: item.Descripcion,
         Existencia: item.ExistenciaInicial,
         Sugerido: item.Sugerido,
         'Pz a Producir': item.Total,
         'Producción Capturada': item.CapturaProduccion,
         Diferencia: item.Diferencia,
         'Costo Producción': item.Costo,
         'Precio Venta': item.Precio,
         Margen: item.Margen,
         'Ventas Udes': item.VentaUdes,
         'Ventas CUC': item.VentaCosto,
         'Ventas PP': item.VentaMonto,
         Utilidad: item.Utilidad,
         'Existencia Final': item.ExistenciaFinal,
         Merma: item.Merma
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
         'Sugerido',
         'Pz a Producir',
         'Producción Capturada',
         'Diferencia',
         'Costo Producción',
         'Precio Venta',
         'Margen',
         'Ventas Udes',
         'Ventas CUC',
         'Ventas PP',
         'Utilidad',
         'Existencia Final',
         'Merma'
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
      saveAs(data, `reporte_panadería_${new Date().getTime()}.xlsx`);
   }
}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';