import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ElectrovalvulasService {

  constructor(private _http: HttpClient) { }

  async getAllElectrovalvulas(): Promise<Electrovalvula[]> {
    try {
      const response = await firstValueFrom(
        this._http.get<{ success: boolean; data: Electrovalvula[]; count: number }>("http://localhost:8000/api/electrovalvulas")
      );
      if (response.success) {
        return response.data;
      } else {
        throw new Error("No se pudieron cargar las electrovalvulas");
      }
    } catch (error) {
      console.error("Error fetching electrovalvulas", error);
      throw new Error("No se pudieron cargar las electrovalvulas");
    }
  }

  async getElectrovalvula(id: number): Promise<Electrovalvula | null> {
    try {
      return await firstValueFrom(
        this._http.get<{ success: boolean; data: Electrovalvula; count: number }>(
          `http://localhost:8000/api/electrovalvulas/${id}`
        ).pipe(
          map(res => {
            if (res.success && res.data) {
              const e = res.data;
              return {
                ...e,
                state: e.estado === 1
              } as Electrovalvula;
            } else {
              return null;
            }
          })
        )
      );
    } catch (error) {
      console.error("Error fetching electrovalvula", error);
      throw new Error("No se pudo cargar la electrovalvula");
    }
  }

  async toggleElectrovalvula(id: number, state: boolean): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this._http.patch<{ success: boolean }>("http://localhost:8000/api/electrovalvulas/" + id, { state })
      );
      if (response.success) {
        return true;
      } else {
        throw new Error("No se pudo actualizar la electrovalvula");
      }
    } catch (error) {
      console.error("Error updating electrovalvula", error);
      throw new Error("No se pudo actualizar la electrovalvula");
    }
  }
}

export interface Electrovalvula {
  electrovalvulaId: number;
  nombre: string;
  estado: number;
  state?: boolean;
}
