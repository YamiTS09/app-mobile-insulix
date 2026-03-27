import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common'; // Importante para usar *ngIf

@Component({
  selector: 'app-medico-header',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './medico-header.component.html',
  styleUrls: ['./medico-header.component.scss'],
})
export class MedicoHeaderComponent implements OnInit {

  medicoLogueado: any = null;

  constructor() { }

  ngOnInit() {
    this.obtenerSesion();
  }

  obtenerSesion() {
    const session = localStorage.getItem('userProfile') || localStorage.getItem('user_session');
    if (session) {
      this.medicoLogueado = JSON.parse(session);
    }
  }
}