import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { MensajesService } from '../services/mensajes.service';

@Component({
  selector: 'app-agregar-clientes',
  templateUrl: './agregar-clientes.component.html',
  styleUrls: ['./agregar-clientes.component.scss']
})
export class AgregarClientesComponent implements OnInit {
  formularioCliente: FormGroup
  porcentajeSubida: number = 0 ;
  urlImagen: string = '';
  esEditable: boolean = false;
  id: string;
  constructor(
    private fb: FormBuilder, 
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private activeRoute: ActivatedRoute,
    private msj: MensajesService) { }

  ngOnInit(): void {
  
    this.formularioCliente = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', Validators.compose([
        Validators.required, Validators.email
      ])],
      dni: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      telefono: [''],
      imgUrl: ['']
    })
    this.id = this.activeRoute.snapshot.params.clienteID
    if(this.id != undefined)
    {
      this.esEditable = true;
      this.db.doc<any>('clientes/' + this.id).valueChanges().subscribe((cliente)=>{
        this.formularioCliente.setValue({
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          correo: cliente.correo,
          fechaNacimiento: new Date(cliente.fechaNacimiento.seconds * 1000).toISOString().substr(0,10),
          telefono: cliente.telefono,
          dni: cliente.dni,
          imgUrl: ''
        })
        this.urlImagen = cliente.imgUrl
      })
    }
  }

  agregar()
  {
    this.formularioCliente.value.imgUrl = this.urlImagen
    this.formularioCliente.value.fechaNacimiento = new Date(this.formularioCliente.value.fechaNacimiento)
    console.log(this.formularioCliente.value)
    this.db.collection('clientes').add(this.formularioCliente.value).then((termino)=>{
      this.msj.mensajeCorrecto('Agregado', 'Se ha agregado correctamente el usuario')
    })
  }
  subirImagen(evento)
  { 
    if(evento.target.files.length > 0)
    {
      let nombre = new Date().getTime().toString()
      let archivo = evento.target.files[0]
      let extension = archivo.name.toString().substring(archivo.name.toString().lastIndexOf('.'))


      let ruta = 'clientes/' + nombre + extension
      const referencia = this.storage.ref(ruta)
      const tarea = referencia.put(archivo)
      tarea.then((objeto)=>{
      console.log('Imagen subida')
      referencia.getDownloadURL().subscribe((url)=>{
        this.urlImagen = url;
      })
    })
    tarea.percentageChanges().subscribe((porcentaje)=>{
      this.porcentajeSubida = parseInt(porcentaje.toString());
    })
    }
  }
  editar()
  {
    this.formularioCliente.value.imgUrl = this.urlImagen
    this.formularioCliente.value.fechaNacimiento = new Date(this.formularioCliente.value.fechaNacimiento)
    

    this.db.doc('clientes/' + this.id).update(this.formularioCliente.value).then((termino)=>{
      this.msj.mensajeCorrecto('Editado', 'Se ha editado correctamente el usuario')
    }).catch(()=>{
      this.msj.mensajeError('Error', 'Ha ocurrido un error')
    })
  }

}
