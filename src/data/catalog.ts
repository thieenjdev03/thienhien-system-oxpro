export type Category = 'Pano sắt'|'Bản lề'|'Chông sắt'|'Mâm cầu thang'|'Hoa văn'|'Phụ kiện';
export type Product = {id:string;name:string;category:Category; description:string;image:string;tag?:string};
export const categories: {name:Category;sub:string;image:string}[] = [
 {name:'Pano sắt',sub:'Hoa văn cho cửa & cổng',image:'/assets/pano.svg'},
 {name:'Bản lề',sub:'Kết cấu chắc chắn',image:'/assets/hinge.svg'},
 {name:'Chông sắt',sub:'Chi tiết hàng rào',image:'/assets/spikes.svg'},
 {name:'Mâm cầu thang',sub:'Điểm nhấn lan can',image:'/assets/rosette.svg'},
 {name:'Hoa văn',sub:'Sắt mỹ thuật trang trí',image:'/assets/scroll.svg'},
 {name:'Phụ kiện',sub:'Các dòng sản phẩm khác',image:'/assets/hardware.svg'},
];
export const products: Product[] = [
 {id:'PN-001',name:'Pano hoa văn cổ điển',category:'Pano sắt',description:'Mẫu họa tiết sắt mỹ thuật cho cửa cổng',image:'/assets/pano.svg',tag:'Nổi bật'},
 {id:'BL-002',name:'Bản lề cổng trụ',category:'Bản lề',description:'Phụ kiện cho cửa và cổng sắt',image:'/assets/hinge.svg'},
 {id:'CS-003',name:'Chông hàng rào đầu nhọn',category:'Chông sắt',description:'Chi tiết trang trí hàng rào',image:'/assets/spikes.svg',tag:'Phổ biến'},
 {id:'MC-004',name:'Mâm trang trí cầu thang',category:'Mâm cầu thang',description:'Hoa văn tròn cho lan can cầu thang',image:'/assets/rosette.svg'},
 {id:'HV-005',name:'Hoa văn uốn nghệ thuật',category:'Hoa văn',description:'Họa tiết uốn trang trí cửa sắt',image:'/assets/scroll.svg'},
 {id:'PK-006',name:'Bộ phụ kiện cơ khí',category:'Phụ kiện',description:'Các dòng phụ kiện phổ thông',image:'/assets/hardware.svg'},
];
