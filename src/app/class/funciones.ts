import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import Swal from 'sweetalert2'

import { Variables } from "./variables";

@Injectable({
  providedIn: 'root',
})

export class Funciones {
   varb = new Variables;
   currentYear = (new Date()).getFullYear();
   
   year: any[] = [];

   constructor(private router:Router) {
      if (this.currentYear > (new Date(2024, 11, 31)).getFullYear()) {
         for (let i = 0; i < this.currentYear - (new Date(2023, 11, 31)).getFullYear(); i++) {
            let year = { Year:(this.currentYear - i) };
            this.year.push(year);
         }

      } else {
         this.year.push(2024);
      }
   }

   Verify_Session(): any {
      let session = this.Get_LocalStorage(this.varb.storageSesion, 'json');

      if (session == null || session == "") {

         localStorage.removeItem(this.varb.storageSesion);
         sessionStorage.removeItem(this.varb.storageSucursal);
         this.router.navigate(['../login']);
         return false;

      } else {
         return true;
      }
   }

   // ============================================ STORAGE ============================================ \\
   Set_SessionStorage(key:string, value:any) {
      sessionStorage.setItem(key, value);
   }

   Get_SessionStorage(key:string, type:string): any {
      if (type === 'json') {
         return JSON.parse(sessionStorage.getItem(key) || 'null');
      } else {
         return sessionStorage.getItem(key) || null;
      }
   }

   Set_LocalStorage(key:string, value:any) {
      localStorage.setItem(key, value);
   }

   Get_LocalStorage(key:string, type:string): any {
      if (type === 'json') {
         return JSON.parse(localStorage.getItem(key) || 'null');
      } else {
         return localStorage.getItem(key) || null;
      }
   }

   // ============================================ CLASES ETIQUETAS ============================================ \\
   Tag_Priority(prioridad:string): string {
      let clase:any = {
         'Activo': 'success',
         'Inactivo': 'danger',
         'Recibido': 'success',
         'Capturado': 'info'
      };

      return clase[prioridad] || 'secondary';
   }

   // ============================================ FUNCIONES ============================================ \\
   getPorcentaje(valor: number, total: number): number {
      if (total <= 0) return 0;
      return (valor / total) * 100;
   }

   Get_Meses(mes:any): any {   
      let meses:any = {
         1: ['Ago','Sep','Oct','Nov', 'Dic','Ene'],
         2: ['Sep','Oct','Nov','Dic', 'Ene','Feb'],
         3: ['Oct','Nov','Dic','Ene', 'Feb','Mar'],
         4: ['Nov','Dic','Ene','Feb', 'Mar','Abr'],
         5: ['Dic','Ene','Feb','Mar', 'Abr','May'],
         6: ['Ene','Feb','Mar','Abr', 'May','Jun'],
         7: ['Feb','Mar','Abr','May', 'Jun','Jul'],
         8: ['Mar','Abr','May','Jun', 'Jul','Ago'],
         9: ['Abr','May','Jun','Jul', 'Ago','Sep'],
         10: ['May','Jun','Jul','Ago', 'Sep','Oct'],
         11: ['Jun','Jul','Ago','Sep', 'Oct','Nov'],
         12: ['Jul','Ago','Sep','Oct', 'Nov','Dic']
      }

      return meses[mes];
   }

   getClase(valor: number, total: any, tipo:string): string {
      const porcentaje = total == null ? valor : this.getPorcentaje(valor, total);

      if (porcentaje >= 80) {
         return (tipo === 'circle') ? "circle-success" : "progress-success";
      } else if (porcentaje >= 60 && porcentaje < 80) {
         return (tipo === 'circle') ? "circle-warning" : "progress-warning";
      } else {
         return (tipo === 'circle') ? "circle-danger" : "progress-danger";
      }
   }

   getClaseBackground(valor: number, total: any): string {
      const porcentaje = total == null ? valor : this.getPorcentaje(valor, total);

      if (porcentaje >= 80) {
         return "bg-green";
      } else if (porcentaje >= 60 && porcentaje < 80) {
         return "bg-warn";
      } else {
         return "bg-danger";
      }
   }
   

   toTitulo(texto: string): string {
      if (!texto) return '';

      // Lista de palabras que deben permanecer en minúsculas
      const excepciones = ["y", "la", "el", "del", "de", "a", "en", "con", "por", "para"];

      return texto
      .toLowerCase()
      .split(" ") 
      .map((palabra, index) => {
         // Si está en excepciones y no es la primera palabra → minúscula
         if (excepciones.includes(palabra) && index > 0) {
            return palabra;
         }
         
         // Capitalizar primera letra
         return palabra.charAt(0).toUpperCase() + palabra.slice(1);
      }).join(" ");
   }

   Convert_Fechas(fechaStr: string): string {
      const [anio, mes, dia] = fechaStr.split('-');
      return `${dia}/${mes}/${anio}`;
   }

   Primer_Dia_Mes(fechaStr: string): string {
      const [mesStr, anioStr] = fechaStr.split("/");
      const mes = parseInt(mesStr, 10) - 1; // restamos 1 porque Date usa meses 0-11
      const anio = parseInt(anioStr, 10);

      // Día 1 del mes actual
      const primerDia = new Date(anio, mes, 1);

      const dia = String(primerDia.getDate()).padStart(2, "0");
      const mesFmt = String(primerDia.getMonth() + 1).padStart(2, "0");
      const anioFmt = primerDia.getFullYear();

      return `${dia}/${mesFmt}/${anioFmt}`;
   }

   Ultimo_Dia_Mes(fechaStr: string): string {
      const [mesStr, anioStr] = fechaStr.split("/");
      const mes = parseInt(mesStr, 10);   // 08 → 8
      const anio = parseInt(anioStr, 10); // 2025

      // Día 0 del mes siguiente = último día del mes actual
      const ultimoDia = new Date(anio, mes, 0);

      // Formatear a DD/MM/YYYY
      const dia = String(ultimoDia.getDate()).padStart(2, "0");
      const mesFmt = String(ultimoDia.getMonth() + 1).padStart(2, "0");
      const anioFmt = ultimoDia.getFullYear();

      return `${dia}/${mesFmt}/${anioFmt}`;
   }

   Horas(hora24: string) {
      const [horas, minutos] = hora24.split(':').map(Number);
      const periodo = horas >= 12 ? 'PM' : 'AM';
      const horas12 = horas % 12 || 12; // Si es 0, cambia a 12
      return `${horas12}:${minutos.toString().padStart(2, '0')} ${periodo}`;
   }

   Diccionario (palabra:string): string {
      const correcciones: Record<string, string> = {
         'Ejecucion': 'Ejecución',
         'Perecdero': 'Perecedero',
         'Rotacion': 'Rotación'
      };

      for (const [mal, bien] of Object.entries(correcciones)) {
         const regex = new RegExp(`\\b${mal}\\b`, "gi");
         palabra = palabra.replace(regex, bien);
      }

      return palabra;
   }

   public _quitarAcentos(texto: string): string {
      if (!texto) return '';
      // Utiliza la normalización Unicode (NFD) para separar los diacríticos y luego una expresión regular para eliminarlos.
      return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
   }

   public GetDates(): string {
      const today = new Date();
      const year = today.getFullYear();
      // getMonth() devuelve 0-11, sumamos 1
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
   }

   GetStartOfMonth(): string {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      
      return `${year}-${month}-01`;
   }

   GetEndOfMonth(): string {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1; // de 0–11 a 1–12

      // Crear una fecha del día 0 del siguiente mes → último día del mes actual
      const endOfMonth = new Date(year, month, 0);

      const endYear = endOfMonth.getFullYear();
      const endMonth = String(endOfMonth.getMonth() + 1).padStart(2, '0');
      const endDay = String(endOfMonth.getDate()).padStart(2, '0');

      return `${endYear}-${endMonth}-${endDay}`;
   }

   // ============================================ ORDERNAR DATOS DE LA TABLA ============================================ \\
   customSort(event: any) {
      const { data, field, order } = event;

      data.sort((a: any, b: any) => {
         const v1 = this.sortableValue(a[field]);
         const v2 = this.sortableValue(b[field]);

         let result = 0;
         if (v1 == null && v2 != null) result = -1;
         else if (v1 != null && v2 == null) result = 1;
         else if (v1 == null && v2 == null) result = 0;
         else if (typeof v1 === 'number' && typeof v2 === 'number') result = v1 - v2;       // num/decimal
         else result = String(v1).localeCompare(String(v2), undefined, { numeric: true });  // texto con dígitos

         return order * result;  // asc/desc
      });
   }

   private sortableValue(val: any): any {
      // ya es número
      if (typeof val === 'number') return val;

      // intentar convertir string numérico (soporta "1.234,56" o "1,234.56")
      if (typeof val === 'string') {
         let s = val.trim();
         if (!s) return s;

         // normaliza separadores
         if (s.includes(',') && !s.includes('.')) s = s.replace(/\./g, '').replace(',', '.'); // 1.234,56 -> 1234.56
         else s = s.replace(/,/g, '');                                                        // 1,234.56 -> 1234.56

         const n = Number(s);
         if (!isNaN(n)) return n;
         return s;
      }

      return val;
   }

   // ============================================ SWEETALERT ============================================ \\
   Swal_Advertencia (message:string, title = 'Advertencia') {
      Swal.fire({
         title: title,
         html: message,
         icon: 'warning',
         cancelButtonText: "<i class='bi bi-x-circle'></i> Cerrar",
         customClass: {
            popup: 'sweet-popup',
            title: 'sweet-title',
            cancelButton: 'sweet-cancel'
         },
         showCancelButton: true,
         showConfirmButton: false
      });
   }

   Swal_Error (message:string, title = 'Error') {
      Swal.fire({
         title: title,
         text: message,
         icon: 'error',
         cancelButtonText: "<i class='bi bi-x-circle'></i> Cerrar",
         customClass: {
            popup: 'sweet-popup',
            title: 'sweet-title',
            cancelButton: 'sweet-cancel'
         },
         showCancelButton: true,
         showConfirmButton: false
      });
   }

   Swal_Exito (message:string) {
      Swal.fire({
         title: "Exito",
         text: message,
         icon: 'success',
         cancelButtonText: "<i class='bi bi-x-circle'></i> Cerrar",
         customClass: {
            popup: 'sweet-popup',
            title: 'sweet-title',
            cancelButton: 'sweet-cancel'
         },
         showCancelButton: true,
         showConfirmButton: false
      });
   }
}