import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicionesService {

  constructor(private _http: HttpClient) { }

  async getMedicionesByID(dispositivoId: number): Promise<Medicion[]> {
    try {
      return await firstValueFrom(
        this._http
          .get<{ success: boolean; data: MedicionRaw[]; count: number }>(
            `http://localhost:8000/api/mediciones/${dispositivoId}`
          )
          .pipe(
            map(res =>
              res.success
                ? res.data.map(m => ({
                  medicionId: m.medicionId,
                  fecha: m.fecha ? new Date(m.fecha) : null,
                  valor: m.valor,
                  dispositivoId: m.dispositivoId
                }))
                : []
            )
          )
      );
    } catch (error) {
      console.error('Error fetching mediciones:', error);
      throw new Error('No se pudieron cargar las mediciones');
    }
  }

  async getLastMedicionByID(dispositivoId: number): Promise<Medicion | null> {
    try {
      return await firstValueFrom(
        this._http
          .get<{ success: boolean; data: MedicionRaw; count: number }>(
            `http://localhost:8000/api/mediciones/${dispositivoId}/latest`
          )
          .pipe(
            map(res =>
              res.success && res.data
                ? {
                  medicionId: res.data.medicionId,
                  fecha: res.data.fecha ? new Date(res.data.fecha) : null,
                  valor: res.data.valor,
                  dispositivoId: res.data.dispositivoId
                }
                : null
            )
          )
      );
    } catch (error) {
      console.error('Error fetching medicion:', error);
      throw new Error('No se pudieron cargar la medicion');
    }
  }
}

export interface Medicion {
  medicionId: number;
  fecha: Date | null;
  valor: string;
  dispositivoId: number;
}

interface MedicionRaw {
  medicionId: number;
  fecha: string;
  valor: string;
  dispositivoId: number;
}