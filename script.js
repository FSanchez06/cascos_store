// ===== Datos de productos =====
const IMG = "https://images.pexels.com/photos/";
const PRODUCTS = [
  {id:1, name:"Thunder Pro R",  brand:"Shoei", type:"integral",  price:1250000, emoji:"🏍️", img:IMG+"12000088/pexels-photo-12000088.jpeg?auto=compress&cs=tinysrgb&w=600"},
  {id:2, name:"Street Flip X",  brand:"HJC",   type:"modular",   price:780000,  emoji:"🪖", img:IMG+"38843996/pexels-photo-38843996.jpeg?auto=compress&cs=tinysrgb&w=600"},
  {id:3, name:"Urban Open 3",   brand:"LS2",   type:"abierto",   price:320000,  emoji:"🛵", img:IMG+"20728826/pexels-photo-20728826.jpeg?auto=compress&cs=tinysrgb&w=600"},
  {id:4, name:"Dirt Master MX", brand:"Fox",   type:"motocross", price:650000,  emoji:"⛑️", img:IMG+"18556007/pexels-photo-18556007.jpeg?auto=compress&cs=tinysrgb&w=600"},
  {id:5, name:"Carbon GT",      brand:"AGV",   type:"integral",  price:1450000, emoji:"🏍️", img:IMG+"12950523/pexels-photo-12950523.jpeg?auto=compress&cs=tinysrgb&w=600"},
  {id:6, name:"City Rider",     brand:"LS2",   type:"abierto",   price:280000,  emoji:"🛵", img:IMG+"18556012/pexels-photo-18556012.jpeg?auto=compress&cs=tinysrgb&w=600"},
  {id:7, name:"Modular Tour",   brand:"Shoei", type:"modular",   price:980000,  emoji:"🪖", img:IMG+"12000088/pexels-photo-12000088.jpeg?auto=compress&cs=tinysrgb&w=600"},
  {id:8, name:"Enduro Peak",    brand:"Fox",   type:"motocross", price:540000,  emoji:"⛑️", img:IMG+"18556007/pexels-photo-18556007.jpeg?auto=compress&cs=tinysrgb&w=600"},
  {id:9, name:"Speed Vortex",   brand:"AGV",   type:"integral",  price:890000,  emoji:"🏍️", img:IMG+"12950523/pexels-photo-12950523.jpeg?auto=compress&cs=tinysrgb&w=600"},
];

const fmt = n => "$" + n.toLocaleString("es-CO");

// ===== Estado =====
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// ===== Render catálogo =====
const grid = document.getElementById("grid");
const empty = document.getElementById("empty");

function getFiltered(){
  const q = document.getElementById("search").value.toLowerCase().trim();
  const t = document.getElementById("filterType").value;
  const b = document.getElementById("filterBrand").value;
  const [min,max] = document.getElementById("filterPrice").value.split("-").map(Number);
  const priceAll = document.getElementById("filterPrice").value === "all";

  return PRODUCTS.filter(p =>
    (t==="all" || p.type===t) &&
    (b==="all" || p.brand===b) &&
    (priceAll || (p.price>=min && p.price<=max)) &&
    (p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
  );
}

function renderGrid(){
  const items = getFiltered();
  grid.innerHTML = items.map(p => `
    <article class="card">
      <div class="card__img"><img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.parentNode.textContent='${p.emoji}'"></div>
      <div class="card__body">
        <span class="card__brand">${p.brand}</span>
        <h3 class="card__name">${p.name}</h3>
        <span class="card__type">${p.type}</span>
        <span class="card__price">${fmt(p.price)}</span>
        <button class="btn btn--primary card__btn" data-add="${p.id}">Agregar</button>
      </div>
    </article>`).join("");
  empty.hidden = items.length > 0;
}

// Llenar filtro de marcas dinámicamente
const brands = [...new Set(PRODUCTS.map(p=>p.brand))];
document.getElementById("filterBrand").insertAdjacentHTML("beforeend",
  brands.map(b=>`<option value="${b}">${b}</option>`).join(""));

// ===== Carrito =====
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

function saveCart(){ localStorage.setItem("cart", JSON.stringify(cart)); }

function addToCart(id){
  const item = cart.find(i=>i.id===id);
  if(item) item.qty++;
  else { const p = PRODUCTS.find(p=>p.id===id); cart.push({...p, qty:1}); }
  saveCart(); renderCart();
}
function changeQty(id,d){
  const item = cart.find(i=>i.id===id);
  if(!item) return;
  item.qty += d;
  if(item.qty<=0) cart = cart.filter(i=>i.id!==id);
  saveCart(); renderCart();
}
function removeItem(id){ cart = cart.filter(i=>i.id!==id); saveCart(); renderCart(); }

function renderCart(){
  const count = cart.reduce((s,i)=>s+i.qty,0);
  cartCount.textContent = count;
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  cartTotal.textContent = fmt(total);

  cartItems.innerHTML = cart.length ? cart.map(i=>`
    <div class="ci">
      <div class="ci__emoji"><img src="${i.img}" alt="${i.name}" onerror="this.parentNode.textContent='${i.emoji}'"></div>
      <div class="ci__info">
        <div class="ci__name">${i.name}</div>
        <div class="ci__price">${fmt(i.price)}</div>
        <div class="ci__qty">
          <button data-minus="${i.id}">−</button>
          <span>${i.qty}</span>
          <button data-plus="${i.id}">+</button>
        </div>
      </div>
      <button class="ci__remove" data-rem="${i.id}">🗑️</button>
    </div>`).join("")
    : `<p class="cart__empty">Tu carrito está vacío</p>`;
}

// ===== Eventos =====
document.addEventListener("click", e=>{
  const add = e.target.dataset.add;
  const plus = e.target.dataset.plus;
  const minus = e.target.dataset.minus;
  const rem = e.target.dataset.rem;
  if(add)   addToCart(+add);
  if(plus)  changeQty(+plus,1);
  if(minus) changeQty(+minus,-1);
  if(rem)   removeItem(+rem);
});

["filterType","filterBrand","filterPrice"].forEach(id=>
  document.getElementById(id).addEventListener("change", renderGrid));
document.getElementById("search").addEventListener("input", renderGrid);

// Abrir/cerrar carrito
const cartEl = document.getElementById("cart");
const overlay = document.getElementById("cartOverlay");
function toggleCart(open){ cartEl.classList.toggle("open",open); overlay.classList.toggle("open",open); }
document.getElementById("cartBtn").addEventListener("click",()=>toggleCart(true));
document.getElementById("cartClose").addEventListener("click",()=>toggleCart(false));
overlay.addEventListener("click",()=>toggleCart(false));

document.getElementById("checkout").addEventListener("click",()=>{
  if(!cart.length){ alert("Tu carrito está vacío"); return; }
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  alert("¡Gracias por tu compra!\nTotal: " + fmt(total));
  cart = []; saveCart(); renderCart(); toggleCart(false);
});

// Menú móvil
document.getElementById("burger").addEventListener("click",()=>
  document.getElementById("nav").classList.toggle("open"));
document.querySelectorAll(".nav a").forEach(a=>
  a.addEventListener("click",()=>document.getElementById("nav").classList.remove("open")));

// ===== Formulario con validación =====
const form = document.getElementById("contactForm");
form.addEventListener("submit", e=>{
  e.preventDefault();
  let ok = true;
  const fields = [
    {el:form.name,  test:v=>v.trim().length>=2,            msg:"Ingresa tu nombre"},
    {el:form.email, test:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg:"Correo no válido"},
    {el:form.msg,   test:v=>v.trim().length>=10,           msg:"Mínimo 10 caracteres"},
  ];
  fields.forEach(f=>{
    const err = f.el.nextElementSibling;
    if(!f.test(f.el.value)){ f.el.classList.add("invalid"); err.textContent=f.msg; ok=false; }
    else { f.el.classList.remove("invalid"); err.textContent=""; }
  });
  if(ok){
    document.getElementById("formOk").hidden = false;
    form.reset();
    setTimeout(()=>document.getElementById("formOk").hidden=true, 4000);
  }
});

// ===== Init =====
renderGrid();
renderCart();
