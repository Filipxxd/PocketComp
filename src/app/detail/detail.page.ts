import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { StorageService } from '../_services/storage.service';
import { Compilation } from '../_models/compilation';
import { SAVED_COMPILATIONS } from '../app.constants';
import { LanguageDisplayNames } from '../_models/languages';
import { StateService } from '../_services/state.service';

@Component({
  selector: 'detail',
  templateUrl: 'detail.page.html',
  styleUrls: ['detail.page.scss'],
  standalone: false
})
export class DetailPage implements OnInit {
  public languageDisplayNames = LanguageDisplayNames;
  compilation: Compilation | null = null;
  alreadySaved: boolean = false;

  constructor(    
    private router: Router,
    private route: ActivatedRoute,
    private stateService: StateService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.alreadySaved = true;
    const compilationId = this.route.snapshot.paramMap.get('id');

    if (compilationId) {
      const compilations = await this.stateService.getCompilations();
      this.compilation = compilations.find((c) => c.id === compilationId) || null;
    } else {
      this.compilation = this.stateService.getCurrentCompilation();
      this.alreadySaved = false;
    }

    this.stateService.setCurrentCompilation(null);

    if (!this.compilation){
        const toast = await this.toastController.create({
          message: 'Compiler not found',
          duration: 1500,
          position: 'top',
          icon: 'alert-circle-outline',
          swipeGesture: 'vertical'
        });
        
        await toast.present();
        this.router.navigate(['/tabs/compilations']);
    }
  }

  async onSave() {
    if (!this.compilation) return;

    const compilations = await this.stateService.getCompilations();

    const index = compilations.findIndex((c: { id: string; }) => c.id === this.compilation!.id);
    if (index !== -1)
      compilations[index] = this.compilation;
    else
      compilations.push(this.compilation);

    this.stateService.setCompilations(compilations);

    const toast = await this.toastController.create({
      message: 'Compiler has been saved',
      duration: 1500,
      position: 'top',
      icon: 'checkmark-outline',
      swipeGesture: 'vertical'
    });

    await toast.present();
    this.alreadySaved = true;
  }

  async onEdit() {
    if (!this.compilation) return;

    this.stateService.setCurrentCompilation(this.compilation);
    this.router.navigate(['/tabs/compiler']);
  }

  async onDelete() {
    const alert = await this.alertController.create({
      header: 'Delete Compiler',
      message: 'Are you sure you want to delete this compilation?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            if (this.alreadySaved){
              const compilations = await this.stateService.getCompilations();
              const updatedCompilations = compilations.filter((c: { id: string; }) => c.id !== this.compilation!.id);
              this.stateService.setCompilations(updatedCompilations);
            }
            this.router.navigate(['/tabs/compilations']);

            const toast = await this.toastController.create({
              message: 'Compiler has been deleted',
              duration: 1500,
              position: 'top',
              icon: 'checkmark-outline',
              swipeGesture: 'vertical'
            });

            await toast.present();
          }
        }
      ]
    });

    await alert.present();
  }
}