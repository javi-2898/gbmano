import { Component, ViewChild, ElementRef, Renderer2, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { MenuItem } from 'primeng/api';
import Swal from "sweetalert2";

import { ImportsModules } from "./../class/modules";
import { Material } from "./../class/material";
import { Primeng } from "./../class/primeng";
import { Variables } from "./../class/variables";
import { Funciones } from "./../class/funciones";

import { DSuc } from "./../dialog/d-suc/d-suc";

@Component({
   selector: 'app-home',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './home.html',
   styleUrl: './home.css'
})

export class Home {
   @ViewChild('navigation', {static: false})
   set trigger(val: ElementRef<HTMLDivElement>){
      let listItems = this.el.nativeElement.querySelectorAll('.navigation li');
      let toggle = this.el.nativeElement.querySelector('.toggle');
      let navigation = this.el.nativeElement.querySelector('.navigation');
      let main = this.el.nativeElement.querySelector('.main');

      // Función para manejar la clase 'hovered'
      let activeLink = (event: any) => {
         listItems.forEach((item: any) => this.renderer.removeClass(item, 'hovered'));
         this.renderer.addClass(event.currentTarget, 'hovered');
      };

      // Agregamos el evento 'mouseover' a cada 'li'
      /*listItems.forEach((item: any) => {
         this.renderer.listen(item, 'mouseover', activeLink);
      });*/

      toggle.onclick = function (e:any) {
         if (e) e.stopPropagation(); // Detener la propagación del evento de clic

         navigation.classList.toggle('active');
         main.classList.toggle('active');
      }

      // Cerrar al dar clic fuera (en el Main/Fondo)
      if (main) {
         this.renderer.listen(main, 'click', () => {
            if (window.innerWidth < 1270 && navigation.classList.contains('active')) { 
               navigation.classList.remove('active');
               main.classList.remove('active');
            }
         });
      }

      // 🔹 Cerrar menú al hacer clic en enlace (solo si < 991px)
      const menuLinks = this.el.nativeElement.querySelectorAll('.navigation a[routerLink]');
      menuLinks.forEach((link: any) => {
         this.renderer.listen(link, 'click', () => {
            if (window.innerWidth < 1270) { // 👈 condición de tamaño
               navigation.classList.remove('active');
               main.classList.remove('active');
            }
         });
      });
   }

   readonly dialog = inject(MatDialog);
   activeSubmenu: string | null = null;
   items: MenuItem[] | undefined;
   varb = new Variables;

   constructor(private el:ElementRef, private renderer:Renderer2, private router:Router, public fun:Funciones) {}
   
   ngOnInit() {
      if (this.fun.Verify_Session()) {
         
         this.varb.user = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.varb.sucursal = this.fun.Get_SessionStorage(this.varb.storageSucursal, 'json');
         
         if (this.varb.sucursal == null) {
            this.openDialog();
         }

         this.items = [{
            label: this.varb.user?.usuario,
            items: [{
               label: 'Cerrar Sesión',
               icon: 'pi pi-sign-out',
               command: () => { this.Cerrar_Sesion(); }
            }]
         }];

      }
   }

   toggleSubmenu(menu: string, event: Event) {
      event.preventDefault();
      event.stopPropagation();
      // Si ya está abierto, lo cierra; si no, abre el nuevo
      this.activeSubmenu = this.activeSubmenu === menu ? null : menu;
   }
   
   // ============================================ SWEETALERT ============================================ \\
   Cerrar_Sesion () {
      Swal.fire({
         title: "¿Seguro de cerrar sesión?",
         icon: 'question',
         cancelButtonText: "<i class='bi bi-x-circle'></i> No",
         confirmButtonText: "<i class='bi bi-check-circle'></i> Sí",
         customClass: {
            popup: 'sweet-popup',
            title: 'sweet-title',
            confirmButton: 'sweet-confirm',
            cancelButton: 'sweet-cancel'
         },
         showCancelButton: true,
         reverseButtons: true,
      }).then((result) => {
         if (result.isConfirmed) {

            localStorage.removeItem(this.varb.storageSesion);
            sessionStorage.removeItem(this.varb.storageSucursal);
            this.router.navigate(['login']);
            
         }
      });
   }

   // ============================================ DIALOG ============================================ \\
   openDialog() {
      if (this.varb.user.cve_sucursal == '99') {
         
         this.dialog.open(DSuc, {
            width: '600px', // Ancho del diálogo
            disableClose: true
         });

      }
   }
}