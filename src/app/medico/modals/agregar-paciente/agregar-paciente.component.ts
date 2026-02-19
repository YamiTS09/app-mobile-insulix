import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-agregar-paciente',
  templateUrl: './agregar-paciente.component.html',
  styleUrls: ['./agregar-paciente.component.scss'],
  standalone: false
})
export class AgregarPacienteComponent implements OnInit {

  // Recibimos el objeto del paciente si se trata de una edición
  @Input() itemAEditar: any;

  // Objeto estructurado para el formulario
  patientData = {
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    edad: '',
    glucosa: '',
    telefono: '',
    email: '',
    usuario: '',
    password: '',
    confirmarPassword: '',
    img: '',
    estado: 'normal'
  };

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    // Si itemAEditar existe, clonamos sus valores al formulario
    if (this.itemAEditar) {
      // Usamos el operador spread para no modificar el objeto original por referencia
      this.patientData = { ...this.itemAEditar };
      
      /* Nota: Si en tu Tab-Pacientes guardas el nombre ya concatenado, 
         podrías tener problemas al editar si quieres separar nombre y apellidos. 
         Si es el caso, aquí podrías aplicar lógica para separar el string.
      */
    }
  }

  /**
   * Cierra el modal sin enviar datos
   */
  dismiss() {
    this.modalCtrl.dismiss();
  }

  /**
   * Procesa la información y la envía de vuelta
   */
  savePatient() {
    // 1. Validación de campos obligatorios
    if (!this.patientData.nombre || !this.patientData.glucosa) {
      alert('Por favor completa el nombre y el nivel de glucosa.');
      return;
    }

    // 2. Validación de contraseñas (solo si es un usuario nuevo o se está cambiando)
    if (this.patientData.password !== this.patientData.confirmarPassword) {
      alert('Las contraseñas no coinciden. Por favor verifica.');
      return;
    }

    // 3. Lógica de determinación de estado basada en la glucosa (mg/dL)
    const g = Number(this.patientData.glucosa);
    let estadoCalculado = 'normal';
    
    if (g > 180) {
      estadoCalculado = 'alto';
    } else if (g < 70) {
      estadoCalculado = 'bajo';
    } else {
      estadoCalculado = 'normal';
    }

    // 4. Preparación del objeto final
    const datosParaGuardar = {
      ...this.patientData,
      estado: estadoCalculado,
      // Mantenemos la imagen existente o generamos una nueva
      img: this.patientData.img || `https://i.pravatar.cc/150?u=${encodeURIComponent(this.patientData.nombre)}`
    };

    // 5. Cerramos el modal enviando los datos (el Tab-Pacientes recibirá esto en onDidDismiss)
    this.modalCtrl.dismiss(datosParaGuardar);
  }
}