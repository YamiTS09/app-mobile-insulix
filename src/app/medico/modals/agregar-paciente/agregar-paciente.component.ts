import { Component, Input, OnInit, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-agregar-paciente',
  templateUrl: './agregar-paciente.component.html',
  styleUrls: ['./agregar-paciente.component.scss'],
  standalone: false
})
export class AgregarPacienteComponent implements OnInit {

  // Recibimos el objeto del paciente si se trata de una edición
  @Input() itemAEditar: any;

  patientData = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    sexo: 'M',
    tipo_diabetes: 'Tipo 2',
    glucosa_base: null as any,
    peso: null as any,
    estatura: null as any,
    telefono: '',
    direccion: '',
    email: '',
    password: '',
    confirmarPassword: '',
    img: ''
  };

  private authService = inject(AuthService);

  showPassword = false;
  showConfirmPassword = false;

  constructor(private modalCtrl: ModalController) { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  filterLettersOnly(event: any, field: string) {
    const value = event.target.value;
    const cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    (this.patientData as any)[field] = cleanValue;
    event.target.value = cleanValue;
  }

  filterNumbersOnly(event: any, field: string) {
    let value = event.target.value;
    let cleanValue = value.replace(/[^0-9]/g, '');
    if (cleanValue.length > 10) cleanValue = cleanValue.substring(0, 10);
    (this.patientData as any)[field] = cleanValue;
    event.target.value = cleanValue;
  }

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

  submitted = false;

  getErrors(field: string): string {
    const data = this.patientData as any;
    const value = data[field];

    // No mostrar error de "Obligatorio" si el usuario ni siquiera ha tocado/enviado el formulario
    // y el campo está actualmente vacío. Una vez enviado, sí se mostrará.
    if (!this.submitted && (value === '' || value === null || value === undefined)) {
      return '';
    }
    
    switch (field) {
      case 'nombre':
        return !value ? 'Obligatorio' : '';
      case 'apellido_paterno':
        return !value ? 'Obligatorio' : '';
      case 'peso':
        if (!value) return 'Obligatorio';
        if (value <= 0 || value > 300) return 'Rango: 0-300 kg';
        return '';
      case 'estatura':
        if (!value) return 'Obligatorio';
        if (value <= 0 || value > 3) return 'Rango: 0.1-3 metros';
        return '';
      case 'glucosa_base':
        if (!value) return 'Obligatorio';
        if (value <= 0 || value > 1000) return 'Rango: 1-1000 mg/dL';
        return '';
      case 'telefono':
        if (!value) return 'Obligatorio';
        if (value.length !== 10) return 'Faltan dígitos (10)';
        return '';
      case 'email':
        if (!value) return 'Obligatorio';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Formato inválido';
        return '';
      case 'password':
        if (this.itemAEditar) return '';
        if (!value) return 'Obligatorio';
        const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
        if (!passwordRegex.test(value)) return 'Min. 8 char y 1 mayúscula';
        return '';
      case 'confirmarPassword':
        if (this.itemAEditar) return '';
        if (!value) return 'Confirmar contraseña';
        if (data.password !== value) return 'No coinciden';
        return '';
      default:
        return '';
    }
  }

  isFormValid(): boolean {
    const fields = ['nombre', 'apellido_paterno', 'peso', 'estatura', 'glucosa_base', 'telefono', 'email'];
    if (!this.itemAEditar) {
      fields.push('password', 'confirmarPassword');
    }
    return fields.every(f => this.getErrors(f) === '');
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
  async savePatient() {
    this.submitted = true;
    
    // 1. Validación de campos mediante isFormValid()
    if (!this.isFormValid()) {
      return;
    }

    let uid = '';
    
    if (!this.itemAEditar) {
      // SOLO si es CREACION tratamos de crear la cuenta en Firebase
      try {
         // OJO: Esto puede cerrar la sesión del médico actual por limitaciones de Firebase Auth en el mismo cliente.
         // En un entorno de producción avanzado, usarías Firebase Admin SDK desde el API.
         const authRef = (this.authService as any).auth;
         if (!authRef) {
            throw new Error("No authenticator found");
         }
         const { createUserWithEmailAndPassword } = await import('@angular/fire/auth');
         const result = await createUserWithEmailAndPassword(authRef, this.patientData.email, this.patientData.password);
         uid = result.user.uid;
      } catch (e: any) {
          alert('Hubo un error al registrar en FirebaseAuth: ' + e.message);
          return;
      }
    }

    // 4. Preparación del objeto final
    const datosParaGuardar: any = {
      ...this.patientData,
      // Mantenemos la imagen existente o asignamos la de por defecto
      foto_url: this.patientData.img || (this.itemAEditar ? this.itemAEditar.foto_url : 'assets/images/perfil-default.png')
    };

    if (!this.itemAEditar) {
      datosParaGuardar.uid = uid;
    }

    // 5. Cerramos el modal enviando los datos (el Tab-Pacientes recibirá esto en onDidDismiss)
    this.modalCtrl.dismiss(datosParaGuardar);
  }
}