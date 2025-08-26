import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  ToastController,
  AlertController,
  LoadingController,
  IonToggle,
  IonButton
} from '@ionic/angular/standalone';
import { Dispositivo, DispositivoService } from '../services/dispositivo.service';
import { Medicion, MedicionesService } from '../services/mediciones.service';
import { ActivatedRoute } from '@angular/router';
import { Electrovalvula, ElectrovalvulasService } from '../services/electrovalvulas.service';


@Component({
  selector: 'app-listado-dispositivos',
  templateUrl: './listado-dispositivos.page.html',
  styleUrls: ['./listado-dispositivos.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonList,
    IonItem,
    RouterModule,
    IonLabel,
    IonToggle,
    IonButton
  ]
})
export class ListadoDispositivosPage implements OnDestroy {

  mediciones: Medicion | null = null;
  dispositivo: Dispositivo | null = null;
  id: string | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  private loadingTimeout?: number;
  mostrarLista: boolean = false;
  electrovalvula: Electrovalvula | null = null;

  ionViewWillEnter() {
    this.id = this._actRouter.snapshot.paramMap.get('id');
    this.cargarMediciones();
  }

  constructor(
    public dispositivoService: DispositivoService,
    private _actRouter: ActivatedRoute,
    private medicionesService: MedicionesService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private electrovalvulasService: ElectrovalvulasService
  ) { }

  async cargarMediciones(showLoading: boolean = true) {
    let loading: HTMLIonLoadingElement | null = null;

    try {
      this.error = null;

      if (showLoading) {
        this.isLoading = true;
        loading = await this.loadingController.create({
          message: 'Cargando mediciones...',
        });
        await loading.present();
      }

      // Pongo un timeout al loading
      if (showLoading && loading) {
        this.loadingTimeout = window.setTimeout(async () => {
          if (loading && this.isLoading) {
            const loading = await this.loadingController.getTop();
            if (loading) {
              loading.dismiss();
            }
            this.isLoading = false;

            // Timeout message
            const toast = await this.toastController.create({
              message: 'No se encontraron mediciones.',
              duration: 2000,
              color: 'warning',
              position: 'bottom'
            });

            await toast.present();
          }
        }, 10000);
      }

      if (!this.id) {
        throw new Error('ID de dispositivo no proporcionado');
      }

      this.mediciones = await this.medicionesService.getLastMedicionByID(parseInt(this.id));
      if (!this.mediciones) {

        const toast = await this.toastController.create({
          message: 'No se encontraron mediciones.',
          duration: 2000,
          color: 'warning',
          position: 'bottom'
        });

        await toast.present();
      }

      this.dispositivo = await this.dispositivoService.getDispositivo(parseInt(this.id));
      if (this.dispositivo?.electrovalvulaId != null) {
        this.electrovalvula = await this.electrovalvulasService.getElectrovalvula(this.dispositivo.electrovalvulaId);
      } else {
        this.electrovalvula = null;
      }

    } catch (error) {

      console.error('Error cargando la medicion:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Error cargando la medicion. Por favor, intenta nuevamente',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Reintentar',
            handler: () => {
              this.cargarMediciones();
            }
          }
        ]
      });

      await alert.present();
    } finally {
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout);
        this.loadingTimeout = undefined;
      }

      if (showLoading && loading) {
        this.isLoading = false;
        const topLoading = await this.loadingController.getTop();
        if (topLoading) {
          topLoading.dismiss();
        }
      }
    }
  }

  async tryToggleValve(event: any) {
    const newState: boolean = event.detail.checked;

    if (!this.electrovalvula) return;

    try {
      await this.electrovalvulasService.toggleElectrovalvula(
        this.electrovalvula.electrovalvulaId,
        newState
      );

      this.electrovalvula.state = newState;
    } catch (error) {
      console.error('Error toggling electrovalvula:', error);

      event.target.checked = !newState;

      const toast = await this.toastController.create({
        message: 'No se pudo actualizar la electrovalvula.',
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
    }
  }

  ngOnDestroy() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }
}
