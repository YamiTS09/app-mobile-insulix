import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { CatalogDraftService } from 'src/app/services/catalog-draft.service';

@Component({
  selector: 'app-add-catalog',
  templateUrl: './add-catalog.component.html',
  styleUrls: ['./add-catalog.component.scss'],
  standalone: false
})
export class AddCatalogComponent implements OnInit, OnDestroy {
  @Input() type!: 'dieta' | 'ejercicio';
  @Input() itemAEditar: any;
  @Input() draftKey: string | null = null;
  @Input() registerDraftSaver?: (saveBeforeClose: () => void) => void;

  dietaData = {
    catalogo_platillo_id: '',
    nombre: '',
    descripcion: '',
    imagen_url: '',
    imagen_file: null as File | null,
    imagen_preview: '',
    categoria_sugerida: '',
    porcion_cantidad: null as number | null,
    porcion_unidad: 'g',
    calorias_kcal: null as number | null,
    carbohidratos_g: null as number | null,
    proteinas_g: null as number | null,
    grasas_g: null as number | null,
    azucares_g: null as number | null,
    fibra_g: null as number | null,
    colesterol_mg: null as number | null,
    bebida_nombre: '',
    bebida_cantidad_ml: null as number | null,
    bebida_notas: ''
  };

  ejercicioData = {
    id: null,
    nombre: '',
    duracion: '',
    descripcion: '',
    pacientes: 0
  };

  errorMessage = '';
  draftRestored = false;
  private initialValues: Record<string, any> = {};
  private submitted = false;
  private closing = false;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private drafts: CatalogDraftService
  ) { }

  ngOnInit() {
    this.registerDraftSaver?.(() => {
      if (!this.submitted) this.keepDraft();
      this.closing = true;
    });
    if (this.itemAEditar) {
      if (this.type === 'dieta') {
        this.dietaData = {
          ...this.dietaData,
          ...this.itemAEditar,
          categoria_sugerida: this.itemAEditar.categoria_sugerida || '',
          imagen_url: this.itemAEditar.imagen_url || ''
        };
      } else {
        this.ejercicioData = { ...this.ejercicioData, ...this.itemAEditar };
      }
    }
    this.initialValues = { ...this.currentValues };

    const draft = this.draftKey ? this.drafts.get(this.draftKey) : null;
    if (draft) {
      if (this.type === 'dieta') {
        this.dietaData = { ...this.dietaData, ...draft.values };
        if (this.dietaData.imagen_file) this.loadImagePreview(this.dietaData.imagen_file);
      } else {
        this.ejercicioData = { ...this.ejercicioData, ...draft.values };
      }
      this.draftRestored = true;
    }
  }

  ngOnDestroy() {
    // Ionic also destroys this component on backdrop, swipe or hardware Back.
    // Submissions were saved before dismissal; do not recreate them after an API success.
    if (!this.submitted && !this.closing) this.keepDraft();
  }

  get hasChanges(): boolean {
    return Object.keys(this.currentValues).some(key =>
      key !== 'imagen_preview' && this.currentValues[key] !== this.initialValues[key]
    );
  }

  private get currentValues(): Record<string, any> {
    return this.type === 'dieta' ? this.dietaData : this.ejercicioData;
  }

  private keepDraft(): number | undefined {
    if (!this.draftKey || (!this.hasChanges && !this.draftRestored)) return undefined;
    return this.drafts.save(this.draftKey, this.currentValues);
  }

  dismiss() {
    this.keepDraft();
    this.modalCtrl.dismiss(undefined, 'cancel');
  }

  async discardDraft() {
    const alert = await this.alertCtrl.create({
      header: 'Descartar borrador',
      message: 'Se quitarán los datos que has escrito. ¿Quieres continuar?',
      buttons: [
        { text: 'Conservar', role: 'cancel' },
        {
          text: 'Descartar',
          role: 'destructive',
          handler: () => {
            if (this.draftKey) this.drafts.discard(this.draftKey);
            if (this.type === 'dieta') {
              this.dietaData = { ...this.dietaData, ...this.initialValues };
            } else {
              this.ejercicioData = { ...this.ejercicioData, ...this.initialValues };
            }
            this.draftRestored = false;
            this.errorMessage = '';
          }
        }
      ]
    });
    await alert.present();
  }

  save() {
    if (this.type === 'dieta') {
      if (!this.dietaData.nombre.trim()) {
        this.errorMessage = 'Escribe el nombre del platillo.';
        return;
      }
      if (!this.dietaData.porcion_cantidad || this.dietaData.porcion_cantidad <= 0) {
        this.errorMessage = 'Indica una porción mayor que cero.';
        return;
      }
      if (this.dietaData.calorias_kcal === null || this.dietaData.calorias_kcal < 0) {
        this.errorMessage = 'Indica las calorías por porción.';
        return;
      }
      if (this.dietaData.bebida_cantidad_ml && this.dietaData.bebida_cantidad_ml <= 0) {
        this.errorMessage = 'La cantidad de bebida debe ser mayor que cero.';
        return;
      }
    }

    const draftRevision = this.draftKey
      ? this.drafts.save(this.draftKey, this.currentValues)
      : undefined;
    this.submitted = true;
    this.modalCtrl.dismiss({ values: { ...this.currentValues }, draftRevision }, 'save');
  }

  seleccionarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Selecciona un archivo de imagen.';
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'La imagen debe pesar menos de 5 MB.';
      input.value = '';
      return;
    }

    this.errorMessage = '';
    input.value = '';
    this.dietaData.imagen_file = file;
    this.dietaData.imagen_preview = '';
    this.loadImagePreview(file);
  }

  private loadImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      if (this.dietaData.imagen_file === file) {
        this.dietaData.imagen_preview = String(reader.result || '');
      }
    };
    reader.readAsDataURL(file);
  }

  quitarImagen() {
    this.dietaData.imagen_file = null;
    this.dietaData.imagen_preview = '';
    this.dietaData.imagen_url = '';
  }
}
