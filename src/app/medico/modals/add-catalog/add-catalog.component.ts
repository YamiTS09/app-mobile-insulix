import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-catalog',
  templateUrl: './add-catalog.component.html',
  styleUrls: ['./add-catalog.component.scss'],
  standalone: false
})
export class AddCatalogComponent implements OnInit {
  @Input() type!: 'dieta' | 'ejercicio';
  @Input() itemAEditar: any;

  dietaData = {
    id: null,
    nombre: '',
    tipo: 'Desayuno',
    platillo: '',
    acompanante: '',
    bebida: '',
    horario: ''
  };

  ejercicioData = {
    id: null,
    nombre: '',
    duracion: '',
    descripcion: '',
    pacientes: 0
  };

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    // Si recibimos un item, clonamos sus valores para editarlos
    if (this.itemAEditar) {
      if (this.type === 'dieta') {
        this.dietaData = { ...this.itemAEditar };
      } else {
        this.ejercicioData = { ...this.itemAEditar };
      }
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    // Asignación de horario automático basado en la categoría
    if (this.type === 'dieta' && !this.dietaData.horario) {
      const horarios: any = {
        'Desayuno': '8:00 AM - 10:00 AM',
        'Comida': '2:00 PM - 4:00 PM',
        'Cena': '7:00 PM - 9:00 PM'
      };
      this.dietaData.horario = horarios[this.dietaData.tipo];
    }

    const dataToSend = this.type === 'dieta' ? this.dietaData : this.ejercicioData;
    this.modalCtrl.dismiss(dataToSend);
  }
}