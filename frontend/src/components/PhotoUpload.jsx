import { useState } from 'react';
import axios from 'axios';

const PhotoUpload = ({ onUploadSuccess }) => {
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const manejarCambio = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file)); // Crea una vista previa local
    }
  };

  const subirFoto = async () => {
    if (!imagen) return alert('Por favor, selecciona una imagen primero');

    setSubiendo(true);
    const formData = new FormData();
    formData.append('image', imagen); // 'image' debe coincidir con lo que pusimos en el backend

    try {
      const token = localStorage.getItem('token'); // Obtenemos tu JWT
      const res = await axios.post('http://localhost:5001/api/auth/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      });

      setMensaje('¡Foto actualizada con éxito!');
      if (onUploadSuccess) onUploadSuccess(res.data.foto);
    } catch (error) {
      console.error(error);
      setMensaje('Error al subir la foto');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ 
      background: '#2d0a1e', padding: '20px', borderRadius: '12px', 
      border: '1px solid #d4537e', textAlign: 'center', marginTop: '20px' 
    }}>
      <h4 style={{ color: '#e8b86d', marginBottom: '15px' }}>Actualizar Foto de Perfil</h4>
      
      {preview && (
        <img src={preview} alt="Vista previa" style={{ 
          width: '100px', height: '100px', borderRadius: '50%', 
          objectFit: 'cover', marginBottom: '15px', border: '2px solid #e8b86d' 
        }} />
      )}

      <input 
        type="file" 
        accept="image/*" 
        onChange={manejarCambio} 
        style={{ display: 'block', margin: '0 auto 15px', color: '#ccc' }}
      />

      <button 
        onClick={subirFoto} 
        disabled={subiendo}
        style={{
          background: subiendo ? '#888' : '#d4537e',
          color: 'white', border: 'none', padding: '10px 20px',
          borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        {subiendo ? 'Subiendo...' : 'Guardar Foto'}
      </button>

      {mensaje && <p style={{ color: '#e8b86d', fontSize: '14px', marginTop: '10px' }}>{mensaje}</p>}
    </div>
  );
};

export default PhotoUpload;