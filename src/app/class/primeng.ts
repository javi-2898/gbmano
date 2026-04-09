import { NgModule } from '@angular/core';

// ============= Form ============= \\
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

// ============= Button ============= \\
import { ButtonModule } from 'primeng/button';

// ============= Data ============= \\
import { TableModule } from 'primeng/table';

// ============= Panel ============= \\
import { CardModule } from 'primeng/card';
import { StepperModule } from 'primeng/stepper';

// ============= Overlay ============= \\
import { TooltipModule } from 'primeng/tooltip';

// ============= File ============= \\
import { FileUploadModule } from 'primeng/fileupload';

// ============= Menu ============= \\
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';

// ============= Media ============= \\
import { ImageModule } from 'primeng/image';

// ============= Chart ============= \\
import { ChartModule } from 'primeng/chart';

// ============= Message ============= \\
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';

// ============= Misc ============= \\
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

@NgModule({
   imports: [
      // ===== Form ===== \\
      CheckboxModule,
      FloatLabelModule,
      InputTextModule,
      IconFieldModule,
      InputIconModule,
      InputGroupModule,
      InputGroupAddonModule,
      InputNumberModule,
      MultiSelectModule,
      PasswordModule,
      RadioButtonModule,
      SelectModule,
      TextareaModule,

      // ===== Button ===== \\
      ButtonModule,
      
      // ===== Panel ===== \\
      TableModule,

      // ===== Panel ===== \\
      CardModule,
      StepperModule,

      // ===== Overlay ===== \\
      TooltipModule,

      // ===== File ===== \\
      FileUploadModule,

      // ===== Menu ===== \\
      BreadcrumbModule,
      MenuModule,
      MenubarModule,

      // ===== Media ===== \\
      ImageModule,

      // ===== Chart ===== \\
      ChartModule,

      // ===== Message ===== \\
      MessageModule,
      ToastModule,

      // ===== Misc ===== \\
      ProgressSpinnerModule,
      SkeletonModule,
      TagModule
   ],
   exports: [
      // ===== Form ===== \\
      CheckboxModule,
      FloatLabelModule,
      InputTextModule,
      IconFieldModule,
      InputIconModule,
      InputGroupModule,
      InputGroupAddonModule,
      InputNumberModule,
      MultiSelectModule,
      PasswordModule,
      RadioButtonModule,
      SelectModule,
      TextareaModule,

      // ===== Button ===== \\
      ButtonModule,

      // ===== Panel ===== \\
      TableModule,

      // ===== Panel ===== \\
      CardModule,
      StepperModule,

      // ===== Overlay ===== \\
      TooltipModule,

      // ===== File ===== \\
      FileUploadModule,

      // ===== Menu ===== \\
      BreadcrumbModule,
      MenuModule,
      MenubarModule,

      // ===== Media ===== \\
      ImageModule,

      // ===== Chart ===== \\
      ChartModule,

      // ===== Message ===== \\
      MessageModule,
      ToastModule,

      // ===== Misc ===== \\
      ProgressSpinnerModule,
      SkeletonModule,
      TagModule
   ]
})

export class Primeng {}