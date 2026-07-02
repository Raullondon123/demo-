let selectedPlan = "economy";
const catalog = [
  { id: 1, emoji: "📘", name: "Cuaderno cuadriculado A4", economy: ["Justus · 100 hojas", 8.20], premium: ["Standford · 100 hojas", 12.90], qty: 2 },
  { id: 2, emoji: "🎨", name: "Caja de colores x 12", economy: ["Artesco", 9.90], premium: ["Faber-Castell", 15.90], qty: 1 },
  { id: 3, emoji: "✏️", name: "Lápiz negro N° 2", economy: ["Vinifan", 0.90], premium: ["Faber-Castell", 1.80], qty: 3 },
  { id: 4, emoji: "🧽", name: "Borrador blanco grande", economy: ["Pegafan", 1.70], premium: ["Staedtler", 3.40], qty: 2 },
  { id: 5, emoji: "✂️", name: "Tijera escolar punta roma", economy: ["Artesco", 5.90], premium: ["Maped", 9.90], qty: 1 },
  { id: 6, emoji: "🖊️", name: "Lapicero azul", economy: ["Faber-Castell", 2.20], premium: ["Pilot", 4.50], qty: 2 },
  { id: 7, emoji: "📏", name: "Regla transparente 30 cm", economy: ["Artesco", 2.10], premium: ["Maped", 4.90], qty: 0 },
  { id: 8, emoji: "🖍️", name: "Plumones delgados x 12", economy: ["Vinifan", 8.90], premium: ["Faber-Castell", 16.90], qty: 0 },
  { id: 9, emoji: "🧴", name: "Goma escolar 250 ml", economy: ["Pegafan", 5.50], premium: ["UHU", 9.20], qty: 0 },
  { id: 10, emoji: "📁", name: "Folder A4 con liga", economy: ["Util Of", 3.90], premium: ["Artesco", 6.50], qty: 0 },
  { id: 11, emoji: "📝", name: "Block de cartulina colores", economy: ["Loro", 7.20], premium: ["Canson", 13.90], qty: 0 }
];
const products = catalog;

const screens = document.querySelectorAll(".screen");
const cartList = document.querySelector("#cartList");
const money = value => `S/ ${value.toFixed(2)}`;

function go(id) {
  screens.forEach(s => s.classList.toggle("active", s.id === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (id === "cart" || id === "checkout" || id === "payment" || id === "success") updateTotals();
}

function renderCart() {
  cartList.innerHTML = products.filter(p => p.qty > 0).map(p => `
    <article class="cart-item">
      <div class="product-img">${p.emoji}</div>
      <div class="item-info">
        <small>EN STOCK</small>
        <h3>${p.name}</h3>
        <span>${p[selectedPlan][0]}</span><br>
        <b>${money(p[selectedPlan][1])}</b>
      </div>
      <div class="qty">
        <button data-action="minus" data-id="${p.id}" aria-label="Restar">−</button>
        <span>${p.qty}</span>
        <button data-action="plus" data-id="${p.id}" aria-label="Sumar">＋</button>
      </div>
    </article>`).join("");
  updateTotals();
}

function updateTotals() {
  const totalQty = products.reduce((n, p) => n + p.qty, 0);
  const rawTotal = products.reduce((n, p) => n + p[selectedPlan][1] * p.qty, 0);
  const discount = selectedPlan === "economy" ? rawTotal * .08 : rawTotal * .04;
  const total = rawTotal - discount;
  document.querySelector(".cart-count").textContent = totalQty;
  document.querySelector("#subtotal").textContent = money(rawTotal);
  document.querySelector("#discount").textContent = `− ${money(discount)}`;
  ["total", "checkoutTotal", "successTotal"].forEach(id => {
    const el = document.querySelector(`#${id}`);
    if (el) el.textContent = money(total);
  });
}

function processFile(file) {
  if (!file) return;
  document.querySelector("#fileName").textContent = `${file.name} · Identificando productos y comprobando stock...`;
  go("processing");
  setTimeout(() => { go("options"); }, 2700);
}

document.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => go(btn.dataset.go)));
document.querySelector("#fileInput").addEventListener("change", e => processFile(e.target.files[0]));

const dropzone = document.querySelector("#dropzone");
["dragenter", "dragover"].forEach(type => dropzone.addEventListener(type, e => {
  e.preventDefault(); dropzone.classList.add("drag");
}));
["dragleave", "drop"].forEach(type => dropzone.addEventListener(type, e => {
  e.preventDefault(); dropzone.classList.remove("drag");
}));
dropzone.addEventListener("drop", e => processFile(e.dataTransfer.files[0]));

cartList.addEventListener("click", e => {
  const button = e.target.closest("button");
  if (!button) return;
  const product = products.find(p => p.id === Number(button.dataset.id));
  product.qty = Math.max(0, product.qty + (button.dataset.action === "plus" ? 1 : -1));
  renderCart();
});

document.querySelectorAll("[data-plan]").forEach(card => card.addEventListener("click", () => {
  selectedPlan = card.dataset.plan;
  document.querySelector("#planBadge").textContent = selectedPlan === "economy" ? "💰 AHORRO ACTIVADO" : "✨ CALIDAD PREMIUM";
  renderCart();
  go("cart");
}));

const productPicker = document.querySelector("#productPicker");
const searchInput = document.querySelector("#productSearch");
const searchResults = document.querySelector("#searchResults");

function renderSearch(query = "") {
  const normalized = query.trim().toLowerCase();
  const results = catalog.filter(p => p.name.toLowerCase().includes(normalized));
  searchResults.innerHTML = results.length ? results.map(p => `
    <div class="search-result">
      <span>${p.emoji}</span>
      <div><strong>${p.name}</strong><small>${p[selectedPlan][0]} · ${money(p[selectedPlan][1])}</small></div>
      <button data-add-id="${p.id}" aria-label="Agregar ${p.name}">＋</button>
    </div>`).join("") : `<div class="search-empty">No encontramos ese producto. Prueba con otra palabra.</div>`;
}

document.querySelector("#addMore").addEventListener("click", () => {
  productPicker.classList.add("open");
  renderSearch();
  searchInput.focus();
});
document.querySelector("#closePicker").addEventListener("click", () => productPicker.classList.remove("open"));
searchInput.addEventListener("input", e => renderSearch(e.target.value));
searchResults.addEventListener("click", e => {
  const button = e.target.closest("[data-add-id]");
  if (!button) return;
  const extra = products.find(p => p.id === Number(button.dataset.addId));
  extra.qty += 1;
  renderCart();
  const toast = document.querySelector("#toast");
  toast.textContent = `${extra.name} agregado`;
  toast.classList.add("show"); 
  setTimeout(() => toast.classList.remove("show"), 1800);
});

document.querySelectorAll(".payment").forEach(label => label.addEventListener("click", () => {
  document.querySelectorAll(".payment").forEach(item => {
    item.classList.toggle("selected", item === label);
    item.querySelector("i").textContent = item === label ? "●" : "○";
  });
}));

document.querySelector("#checkoutForm").addEventListener("submit", e => {
  e.preventDefault();
  const passwords = e.currentTarget.querySelectorAll('input[type="password"]');
  if (passwords[0].value !== passwords[1].value) {
    passwords[1].setCustomValidity("Las contraseñas no coinciden");
    passwords[1].reportValidity();
    return;
  }
  passwords[1].setCustomValidity("");
  const email = document.querySelector("#accountEmail").value;
  document.querySelector("#createdUser").textContent = `Usuario: ${email}`;
  go("payment");
});
document.querySelectorAll('#checkoutForm input[type="password"]').forEach(input => {
  input.addEventListener("input", () => input.setCustomValidity(""));
});

document.querySelector("#paymentForm").addEventListener("submit", e => {
  e.preventDefault();
  go("success");
});

renderCart();
