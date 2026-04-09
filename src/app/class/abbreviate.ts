import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
   name: 'abbreviate',
   standalone: true
})

export class AbbreviatePipe implements PipeTransform {
   transform(value: any, preferredMillion: 'M' | 'MM' = 'M', digits: number = 0): string {
      if (value === null || value === undefined || isNaN(value)) return '0';
      
      const num = parseFloat(value);
      const absNum = Math.abs(num);

      let resultValue: number;
      let suffix: string = '';

      // --- LÓGICA DE DETECCIÓN AUTOMÁTICA ---
      
      if (absNum >= 1000000) {
         // Es un millón o más
         resultValue = num / 1000000;
         suffix = ` ${preferredMillion}`;
      } 
      else if (absNum >= 100000) {
         // Es un mil o más (pero menos de un millón)
         resultValue = num / 100000;
         suffix = ' K';
      } 
      else {
         // Es menor a mil
         resultValue = num;
         suffix = '';
      }

      // Retornamos el número formateado con comas + el sufijo detectado
      return resultValue.toLocaleString('en-US', {
         minimumFractionDigits: 0,
         maximumFractionDigits: digits
      }) + suffix;
   }
}