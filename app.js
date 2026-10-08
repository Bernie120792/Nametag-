// NOVA STORE - Cart, Checkout and PayMongo frontend
// PayMongo secret keys MUST stay in Google Apps Script.

const CART_KEY = "nova_store_cart";

function peso(value) {
  return "₱" + Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getProducts() {
  return window.PRODUCTS || {};
}

// Supports BOTH cart formats used by previous NOVA STORE versions:
// Array: [{ productId: "tee", quantity: 1 }]
// Object: { tee: 1, cap: 2 }
function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed
        .map(item => ({
          productId: String(item.productId || ""),
          quantity: Math.max(0, Math.min(99, Number(item.quantity) || 0))
        }))
        .filter(item => item.productId && item.quantity > 0);
    }

    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed)
        .map(([productId, quantity]) => ({
          productId: String(productId),
          quantity: Math.max(0, Math.min(99, Number(quantity) || 0))
        }))
        .filter(item => item.productId && item.quantity > 0);
    }

    return [];
  } catch (error) {
    console.error("Cart read error:", error);
    return [];
  }
}

function saveCart(cart) {
  const cleanCart = cart
    .map(item => ({
      productId: String(item.productId),
      quantity: Math.max(0, Math.min(99, Number(item.quantity) || 0))
    }))
    .filter(item => item.productId && item.quantity > 0);

  localStorage.setItem(CART_KEY, JSON.stringify(cleanCart));
  updateCartCount();
}

function updateCartCount() {
  const count = getCart().reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = count;
  });
}

function addToCart(productId) {
  const products = getProducts();
  if (!products[productId]) return;

  const cart = getCart();
  const existing = cart.find(item => item.productId === productId);

  if (existing) {
    existing.quantity = Math.min(99, Number(existing.quantity) + 1);
  } else {
    cart.push({ productId, quantity: 1 });
  }

  saveCart(cart);
  renderCart();
  renderCheckout();
  toast(products[productId].name + " added to cart.");
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(x => x.productId === productId);
  if (!item) return;

  item.quantity = Number(item.quantity) + Number(delta);

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  item.quantity = Math.min(99, item.quantity);
  saveCart(cart);
  renderCart();
  renderCheckout();
}

function removeFromCart(productId) {
  saveCart(getCart().filter(item => item.productId !== productId));
  renderCart();
  renderCheckout();
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartCount();
  renderCart();
  renderCheckout();
}

function cartTotal() {
  const products = getProducts();

  return getCart().reduce((total, item) => {
    const product = products[item.productId];
    if (!product) return total;

    const price = Number(product.price) || 0;
    const quantity = Number(item.quantity) || 0;

    return total + price * quantity;
  }, 0);
}

function renderProducts() {
  const grid = document.querySelector("[data-products]");
  if (!grid) return;

  const products = getProducts();

  grid.innerHTML = Object.entries(products).map(([id, product]) => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <div class="product-title-row">
          <h3>${product.name}</h3>
          <strong>${peso(product.price)}</strong>
        </div>
        <p>${product.description || ""}</p>
        <button class="btn btn-primary" onclick="addToCart('${id}')">
          Add to cart
        </button>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const box = document.querySelector("[data-cart]");
  if (!box) return;

  const cart = getCart();
  const products = getProducts();

  if (!cart.length) {
    box.innerHTML = `
      <div class="empty-state">
        <h2>Your cart is empty</h2>
        <p>Add something from our products to continue.</p>
        <a class="btn btn-primary" href="./products.html">Shop products</a>
      </div>
    `;
    return;
  }

  box.innerHTML = `
    <div class="cart-list">
      ${cart.map(item => {
        const product = products[item.productId];
        if (!product) return "";

        return `
          <div class="cart-item">
            <img src="${product.image}" alt="${product.name}">
            <div class="cart-item-main">
              <h3>${product.name}</h3>
              <p>${peso(product.price)} each</p>
              <div class="qty">
                <button onclick="changeQty('${item.productId}', -1)">−</button>
                <span>${item.quantity}</span>
                <button onclick="changeQty('${item.productId}', 1)">+</button>
              </div>
            </div>
            <div class="cart-item-side">
              <strong>${peso(Number(product.price) * item.quantity)}</strong>
              <button class="remove" onclick="removeFromCart('${item.productId}')">Remove</button>
            </div>
          </div>
        `;
      }).join("")}
    </div>

    <div class="cart-summary">
      <span>Total</span>
      <strong>${peso(cartTotal())}</strong>
    </div>

    <a class="btn btn-primary full" href="./checkout.html">
      Proceed to checkout
    </a>
  `;
}

function renderCheckout() {
  const box = document.querySelector("[data-checkout-items]");
  const total = document.querySelector("[data-checkout-total]");
  const button = document.querySelector("#payButton");

  if (!box || !total) return;

  const cart = getCart();
  const products = getProducts();

  if (!cart.length) {
    box.innerHTML = `
      <p class="muted">Your cart is empty.</p>
    `;
    total.textContent = peso(0);
    if (button) button.disabled = true;
    return;
  }

  const validItems = cart.filter(item => products[item.productId]);

  if (!validItems.length) {
    box.innerHTML = `
      <p class="muted">Your cart contains no valid products.</p>
    `;
    total.textContent = peso(0);
    if (button) button.disabled = true;
    return;
  }

  if (button) button.disabled = false;

  box.innerHTML = validItems.map(item => {
    const product = products[item.productId];
    const lineTotal = Number(product.price) * Number(item.quantity);

    return `
      <div class="checkout-line">
        <div>
          <strong>${product.name}</strong>
          <span>Qty ${item.quantity}</span>
        </div>
        <strong>${peso(lineTotal)}</strong>
      </div>
    `;
  }).join("");

  // IMPORTANT: total is calculated from the same cart/products used above.
  total.textContent = peso(cartTotal());
}

// ---------------------------------------------------------
// PAYMONGO CHECKOUT
// ---------------------------------------------------------
async function startPayment() {
  const endpoint = window.APP_CONFIG && window.APP_CONFIG.APPS_SCRIPT_URL;
  const status = document.querySelector("#checkoutMessage");
  const button = document.querySelector("#payButton");

  if (!endpoint) {
    throw new Error("Checkout config is missing. Check config.js.");
  }

  const cart = getCart();

  if (!cart.length) {
    throw new Error("Your cart is empty.");
  }

  const products = getProducts();

  const items = cart
    .filter(item => products[item.productId])
    .map(item => ({
      productId: String(item.productId),
      quantity: Number(item.quantity)
    }))
    .filter(item => Number.isInteger(item.quantity) && item.quantity > 0);

  if (!items.length) {
    throw new Error("Your cart contains no valid products.");
  }

  if (button) {
    button.disabled = true;
    button.textContent = "Connecting to PayMongo...";
  }

  if (status) status.textContent = "";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({ items })
    });

    const responseText = await response.text();

    console.log("PayMongo backend status:", response.status);
    console.log("PayMongo backend response:", responseText);

    if (!responseText.trim()) {
      throw new Error("The checkout server returned an empty response.");
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Non-JSON checkout response:", responseText);

      if (
        responseText.trim().startsWith("<!DOCTYPE") ||
        responseText.toLowerCase().includes("<html")
      ) {
        throw new Error(
          "The Apps Script Web App returned an HTML page instead of JSON. " +
          "Check the deployed /exec URL and Web App access settings."
        );
      }

      throw new Error("Invalid response from the checkout server.");
    }

    if (!data.ok) {
      throw new Error(
        data.error || "Unable to create PayMongo checkout."
      );
    }

    if (!data.checkout_url) {
      throw new Error("PayMongo did not return a checkout URL.");
    }

    window.location.href = data.checkout_url;

  } catch (error) {
    console.error("Checkout error:", error);

    if (status) {
      status.textContent = error.message || "Unable to start checkout.";
    }

    if (button) {
      button.disabled = false;
      button.textContent = "Pay with PayMongo";
    }

    throw error;
  }
}

function toast(message) {
  let el = document.querySelector(".toast");

  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }

  el.textContent = message;
  el.classList.add("show");

  setTimeout(() => {
    el.classList.remove("show");
  }, 1800);
}

// Keep these functions available to the existing HTML buttons.
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.startPayment = startPayment;
window.getCart = getCart;
window.cartTotal = cartTotal;

// If an older version saved an object cart, normalize it once now.
function migrateCartStorage() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);

    if (parsed && !Array.isArray(parsed) && typeof parsed === "object") {
      saveCart(getCart());
    }
  } catch (error) {
    console.warn("Cart migration skipped:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  migrateCartStorage();
  updateCartCount();
  renderProducts();
  renderCart();
  renderCheckout();
});
