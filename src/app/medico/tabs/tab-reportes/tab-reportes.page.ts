import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-tab-reportes',
  templateUrl: './tab-reportes.page.html',
  styleUrls: ['./tab-reportes.page.scss'],
  standalone: false
})
export class TabReportesPage implements OnInit {

  patientName: string = '';
  options = [
    { label: 'Historial de Glucosa (ML).', checked: false },
    { label: 'Cumplimiento de Dieta.', checked: false },
    { label: 'Registro de Actividad Física.', checked: false }
  ];

  historyReports: any[] = [];

  constructor(private toastCtrl: ToastController) { }

  ngOnInit() {
    this.cargarHistorialReportes();
  }

  cargarHistorialReportes() {
    const reportes = localStorage.getItem('insulix_historial_reportes');
    this.historyReports = reportes ? JSON.parse(reportes) : [
      { title: 'Reporte Inicial', patient: 'Sandra Yamileth Jimenez Asis', date: '12/02/2026', id: 1 }
    ];
  }

  async generateReport() {
  const doc = new jsPDF();
  const fechaStr = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // 1. Recuperar la base de datos de pacientes
  const storagePacientes = localStorage.getItem('insulix_pacientes');
  const listaPacientes = storagePacientes ? JSON.parse(storagePacientes) : [];

  if (listaPacientes.length === 0) {
    this.mostrarToast('No hay pacientes registrados para generar el reporte.');
    return;
  }

  // 2. Diseño del encabezado
  doc.setFontSize(20);
  doc.setTextColor(0, 112, 224); // Azul Insulix
  doc.text('INSULIX: Reporte Clínico General', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Fecha: ${fechaStr}`, 105, 28, { align: 'center' });
  doc.line(20, 32, 190, 32);

  // 3. Mapeo dinámico de datos de LocalStorage
  // Recorremos la lista completa de pacientes sin filtros
  const filasTabla = listaPacientes.map((p: any) => [
    p.nombre || 'N/A',
    this.options[0].checked ? `${p.glucosa || '--'} mg/dL` : '---',
    this.options[1].checked ? (p.dietasAsignadas?.length || 0) : '---',
    this.options[2].checked ? (p.ejercicioAsignado?.nombre || 'Sin actividad') : '---'
  ]);

  // 
  
  // 4. Generación de la tabla
  autoTable(doc, {
    startY: 40,
    head: [['Paciente', 'Nivel Glucosa', 'Planes Dieta', 'Actividad Física']],
    body: filasTabla,
    theme: 'striped',
    headStyles: { fillColor: [0, 112, 224], halign: 'center' },
    styles: { fontSize: 9, halign: 'left' },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' }
    }
  });

  // 5. Descarga y Registro en historial
  const nombreArchivo = `Reporte_General_${Date.now()}.pdf`;
  doc.save(nombreArchivo);

  const historialEntry = {
    title: 'Reporte General Automático',
    patient: `${listaPacientes.length} pacientes incluidos`,
    date: new Date().toLocaleDateString(),
    id: Date.now()
  };

  this.historyReports.unshift(historialEntry);
  localStorage.setItem('insulix_historial_reportes', JSON.stringify(this.historyReports));
  
  this.mostrarToast('Reporte generado exitosamente.');
}

  async mostrarToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: 'primary'
    });
    toast.present();
  }
}