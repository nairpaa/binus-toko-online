// Data contoh supaya halaman frontend tidak kosong waktu pertama kali dibuka.
// Gambar diambil dari CDN DummyJSON (gratis untuk keperluan latihan).
const IMG = 'https://cdn.dummyjson.com/product-images';

const products = [
  {
    name: 'iPhone 13 Pro',
    description:
      'Layar Super Retina XDR 6,1 inci dengan ProMotion 120Hz, chip A15 Bionic, dan tiga kamera 12MP yang jago dipakai di kondisi minim cahaya.',
    price: 14999000,
    category: 'Gadget',
    stock: 8,
    image: `${IMG}/smartphones/iphone-13-pro/1.webp`,
  },
  {
    name: 'Oppo A57',
    description:
      'HP harian dengan baterai 5000 mAh dan pengisian cepat 33W. Pas buat kuliah, chat, dan nonton seharian.',
    price: 2499000,
    category: 'Gadget',
    stock: 25,
    image: `${IMG}/smartphones/oppo-a57/1.webp`,
  },
  {
    name: 'MacBook Pro 14 inci Space Grey',
    description:
      'Laptop tipis bertenaga chip Apple Silicon, layar Liquid Retina XDR, dan baterai yang kuat sampai seharian kerja.',
    price: 28999000,
    category: 'Laptop',
    stock: 4,
    image: `${IMG}/laptops/apple-macbook-pro-14-inch-space-grey/1.webp`,
  },
  {
    name: 'Lenovo Yoga 920',
    description:
      'Laptop 2-in-1 dengan engsel 360 derajat. Bisa dipakai sebagai laptop biasa atau dilipat jadi tablet untuk mencatat.',
    price: 15499000,
    category: 'Laptop',
    stock: 6,
    image: `${IMG}/laptops/lenovo-yoga-920/1.webp`,
  },
  {
    name: 'Apple AirPods',
    description:
      'Earphone nirkabel yang langsung tersambung ke perangkat Apple. Ringan, praktis, dan casing-nya sekaligus jadi charger.',
    price: 2199000,
    category: 'Aksesoris',
    stock: 15,
    image: `${IMG}/mobile-accessories/apple-airpods/1.webp`,
  },
  {
    name: 'Beats Flex Wireless Earphones',
    description:
      'Earphone leher dengan kabel fleksibel, ujung magnet yang otomatis pause saat ditempel, dan baterai sampai 12 jam.',
    price: 899000,
    category: 'Aksesoris',
    stock: 20,
    image: `${IMG}/mobile-accessories/beats-flex-wireless-earphones/1.webp`,
  },
  {
    name: 'Brown Leather Belt Watch',
    description:
      'Jam tangan analog dengan tali kulit cokelat. Desainnya klasik, cocok untuk acara formal maupun santai.',
    price: 459000,
    category: 'Aksesoris',
    stock: 12,
    image: `${IMG}/mens-watches/brown-leather-belt-watch/1.webp`,
  },
  {
    name: 'Nike Air Jordan 1 Red and Black',
    description:
      'Sneakers ikonik dengan kombinasi warna merah-hitam. Bahan kulit premium dan sol karet yang nyaman dipakai lama.',
    price: 2899000,
    category: 'Fashion',
    stock: 5,
    image: `${IMG}/mens-shoes/nike-air-jordan-1-red-and-black/1.webp`,
  },
  {
    name: 'Puma Future Rider Trainers',
    description:
      'Sepatu kasual bergaya retro dengan bantalan empuk. Enak dipakai jalan-jalan atau nongkrong.',
    price: 1299000,
    category: 'Fashion',
    stock: 10,
    image: `${IMG}/mens-shoes/puma-future-rider-trainers/1.webp`,
  },
  {
    name: 'Kemeja Flanel Kotak-Kotak',
    description:
      'Kemeja flanel lengan panjang berbahan katun yang adem. Bisa dipakai sendiri atau sebagai outer.',
    price: 249000,
    category: 'Fashion',
    stock: 30,
    image: `${IMG}/mens-shirts/man-plaid-shirt/1.webp`,
  },
  {
    name: 'Lampu Meja Minimalis',
    description:
      'Lampu meja dengan cahaya hangat yang tidak bikin silau. Cocok untuk meja belajar atau samping tempat tidur.',
    price: 189000,
    category: 'Rumah Tangga',
    stock: 18,
    image: `${IMG}/home-decoration/table-lamp/1.webp`,
  },
  {
    name: 'Pot Tanaman Keramik',
    description:
      'Pot keramik ukuran sedang untuk tanaman hias indoor. Bikin sudut ruangan langsung terasa lebih hidup.',
    price: 75000,
    category: 'Rumah Tangga',
    stock: 40,
    image: `${IMG}/home-decoration/plant-pot/1.webp`,
  },
  {
    name: 'Blender Serbaguna',
    description:
      'Blender dengan beberapa level kecepatan untuk jus, smoothie, sampai sambal. Wadahnya mudah dilepas dan dicuci.',
    price: 549000,
    category: 'Rumah Tangga',
    stock: 9,
    image: `${IMG}/kitchen-accessories/boxed-blender/1.webp`,
  },
  {
    name: 'Wajan Baja Karbon',
    description:
      'Wajan baja karbon yang panasnya cepat dan merata. Makin sering dipakai, permukaannya makin anti lengket.',
    price: 229000,
    category: 'Rumah Tangga',
    stock: 0,
    image: `${IMG}/kitchen-accessories/carbon-steel-wok/1.webp`,
  },
];

export default products;
