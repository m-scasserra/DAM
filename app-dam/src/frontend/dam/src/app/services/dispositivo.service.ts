import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DispositivoService {

  constructor(private _http: HttpClient) { }

  async getAllDispositivos(): Promise<Dispositivo[]> {
    try {
      const response = await firstValueFrom(
        this._http.get<{success: boolean; data: Dispositivo[]; count: number}>("http://localhost:8000/api/dispositivos")
      );
      if (response.success) {
        return response.data;
      } else {
        throw new Error("No se pudieron cargar los dispositivos");
      }
    } catch (error) {
      console.error("Error fetching dispositivos", error);
      throw new Error("No se pudieron cargar los dispositivos");
    }
  }

  async getDispositivo(id: number): Promise<Dispositivo | null> {
    try {
      const response = await firstValueFrom(
        this._http.get<{success: boolean; data: Dispositivo; count: number}>("http://localhost:8000/api/dispositivo/" + id)
      );
      if (response.success) {
        return response.data;
      } else {
        throw new Error("No se pudo cargar el dispositivo");
      }
    } catch (error) {
      console.error("Error fetching dispositivo", error);
      throw new Error("No se pudo cargar el dispositivo");
    }
  }
}

export interface Dispositivo {
  dispositivoId: number;
  electrovalvulaId: number;
  nombre: string;
  ubicacion: string;
}
