import { Component, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  LoadingController,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  ToastController,
  AlertController,
  IonLabel
} from '@ionic/angular/standalone';
import { OnInit } from '@angular/core';
import { DispositivoService, Dispositivo } from '../services/dispositivo.service';
import { HighlightSensorDirective } from '../directives/highlight-sensor.directive';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    RouterModule,
    CommonModule,
    IonList,
    IonItem,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    HighlightSensorDirective,
    IonLabel
  ],
})

export class HomePage implements OnInit, OnDestroy {
  isLoading: boolean = false;
  dispositivos: Dispositivo[] = [];
  error: string | null = null;
  private loadingTimeout?: number;

  constructor(
    private loadingController: LoadingController,
    private dispositivoService: DispositivoService,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.cargarDispositivos();
  }

  ngOnDestroy(): void {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = undefined;
    }
  }

  async cargarDispositivos(showLoading: boolean = true) {
    let loading: HTMLIonLoadingElement | null = null;

    try {
      this.error = null;

      if (showLoading) {
        this.isLoading = true;
        loading = await this.loadingController.create({
          message: 'Cargando dispositivos...',
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
              message: 'No se encontraron dispositivos.',
              duration: 2000,
              color: 'warning',
              position: 'bottom'
            });

            await toast.present();
          }
        }, 10000);
      }

      this.dispositivos = await this.dispositivoService.getAllDispositivos();

      if (this.dispositivos.length === 0) {

        const toast = await this.toastController.create({
          message: 'No se encontraron dispositivos.',
          duration: 2000,
          color: 'warning',
          position: 'bottom'
        });

        await toast.present();
      }

    } catch (error) {

      console.error('Error cargando los dispositivos:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Error cargando los dispositivos. Por favor, intenta nuevamente',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Reintentar',
            handler: () => {
              this.cargarDispositivos();
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
        const loading = await this.loadingController.getTop();
        if (loading) {
          loading.dismiss();
        }
      }
    }
  }
}
