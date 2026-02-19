import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-paciente-header',
  templateUrl: './paciente-header.component.html',
  styleUrls: ['./paciente-header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class PacienteHeaderComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
