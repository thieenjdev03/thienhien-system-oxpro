'use client';
import {useState} from 'react';
// Thu nhỏ ảnh ở trình duyệt trước khi gửi (Vercel giới hạn body ~4.5MB), server nén lại lần nữa.
export default function ImagePicker({name,current,png}:{name:string;current?:string|null;png?:boolean}){
 const [preview,setPreview]=useState(current||'');
 async function pick(e:React.ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;
  if(f.size>5*1024*1024){alert('Ảnh tối đa 5MB');e.target.value='';return}
  const bmp=await createImageBitmap(f),k=Math.min(1,1600/Math.max(bmp.width,bmp.height));
  const c=document.createElement('canvas');c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);c.getContext('2d')!.drawImage(bmp,0,0,c.width,c.height);
  const type=png?'image/png':'image/jpeg';const blob:Blob|null=await new Promise(r=>c.toBlob(r,type,.85));if(!blob)return;
  const dt=new DataTransfer();dt.items.add(new File([blob],f.name.replace(/\.\w+$/,'')+(png?'.png':'.jpg'),{type}));e.target.files=dt.files;setPreview(URL.createObjectURL(blob))}
 return <div className="row">{preview&&<img src={preview} alt="" className="thumb"/>}<input type="file" name={name} accept="image/png,image/jpeg,image/webp" onChange={pick}/></div>}
