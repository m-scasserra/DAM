import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humedadRelativa',
  standalone: true
})
export class HumedadRelativaPipe implements PipeTransform {

  transform(value: string): string {

    const v: number = Math.max(0, Math.min(100, parseInt(value)));
    console.log(v);
    const red: number = Math.round(255 * (1 - v / 100));
    const blue: number = Math.round(255 * (v / 100));
    const green: number = 0;

    return `rgb(${red}, ${green}, ${blue})`;
  }

}

@Pipe({
  name: 'contraste',
  standalone: true
})
export class ContrastePipe implements PipeTransform {
  transform(rgb: string): string {

    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return 'black';
    const r = Number(result[0]);
    const g = Number(result[1]);
    const b = Number(result[2]);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 186 ? 'black' : 'white';
  }
}