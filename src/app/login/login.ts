import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

import { ImportsModules } from "./../class/modules";
import { Material } from "./../class/material";
import { Primeng } from "./../class/primeng";
import { Rutas } from "./../class/rutas";
import { Funciones } from "./../class/funciones";
import { Variables } from "./../class/variables";

import { AppService } from "./../app.service";

import { Spinner } from "./../spinner/spinner";

@Component({
   selector: 'app-login',
   imports: [ImportsModules, Material, Primeng, Spinner],
   templateUrl: './login.html',
   styleUrl: './login.css'
})

export class Login {
   @ViewChild('spinner') spinner!: Spinner;

   ruta = new Rutas;
   varb = new Variables;

   form = new FormGroup({
      username: new FormControl(''),
      password: new FormControl('')
   });

   constructor(private service:AppService, private router:Router, private fun:Funciones) {}

   ngOnInit() {
      history.pushState(null, '', location.href);
      window.onpopstate = () => {
         history.pushState(null, '', location.href); // no permite volver
      };
      
      if (this.fun.Verify_Session()) {
         this.router.navigate(['home/dashboard']);
      }
   }

   // ============================================ READ ============================================ \\
   Read_Login() {
      this.varb.alert = false;

      if (this.form.controls.username.value === '') {
         this.varb.alert = true;
         this.varb.message = 'El campo <i>Nombre de usuario</i> no puede estar vacío.';
         return;
      }

      if (this.form.controls.password.value === '') {
         this.varb.alert = true;
         this.varb.message = 'El campo <i>Contraseña</i> no puede estar vacío.';
         return;
      }

      this.varb.loading = true;

      let sendDatas = {
         evento: 'Read_Login',
         datos: {
            user: this.form.controls.username.value,
            password: this.form.controls.password.value
         }
      }
      
      this.service.Read(this.ruta.login, sendDatas).subscribe({
         next: (res) => {
            if (res.code === 200) {

               this.fun.Set_LocalStorage(this.varb.storageSesion, JSON.stringify(res.data[0]));
               
               if (res.data[0].cve_sucursal !== '99') {
                  
                  this.fun.Set_SessionStorage(
                     this.varb.storageSucursal,
                     JSON.stringify({
                        cve_sucursal: res.data[0].cve_sucursal,
                        nombre: res.data[0].cve_sucursal+' - '+this.fun.toTitulo(res.data[0].sucursal)
                     })
                  );
               }

               this.router.navigate(['home/dashboard']);
               
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
   Ocultar_Alerta() {
      if (this.form.controls.username.value && this.form.controls.username.value.trim() !== '') {
         this.varb.alert = false;
      }

      if (this.form.controls.password.value && this.form.controls.password.value.trim() !== '') {
         this.varb.alert = false;
      }
   }
}